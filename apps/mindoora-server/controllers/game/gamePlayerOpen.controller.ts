import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { createGamePlayersSchema, createGamePlayersType } from '../../db/schemas/game/gamePlayers.schema'
import { missingParams } from '../tools'

export const createGamePlayerController = async (req: Request<{}, {}, createGamePlayersType>, res: Response) => {
  try {
    const { inviteCode, name } = req.body
    console.log('🎮 JOIN GAME REQUEST:', { inviteCode, name });
    
    createGamePlayersSchema.parse(req.body)

    // Find room by invite code (created status means waiting for players)
    console.log('🔍 Searching for room with invite code:', inviteCode);
    const roomResult = await pool.query(
      'SELECT * FROM "GameRooms" WHERE "inviteCode" = $1 AND status = $2 LIMIT 1',
      [inviteCode, 'created']
    )
    const room = roomResult.rows[0]
    console.log('🏠 Room found:', room ? { id: room.id, inviteCode: room.inviteCode, status: room.status } : 'NOT FOUND');
    
    if (!room) {
      // Let's also check if room exists with different status
      const anyRoomResult = await pool.query(
        'SELECT * FROM "GameRooms" WHERE "inviteCode" = $1 LIMIT 1',
        [inviteCode]
      )
      const anyRoom = anyRoomResult.rows[0]
      console.log('🔍 Room with any status:', anyRoom ? { id: anyRoom.id, status: anyRoom.status } : 'NOT FOUND');
      
      return res.status(404).json({ message: 'Room not found or already started' });
    }

    // Get user game details
    const userGameResult = await pool.query(
      'SELECT * FROM "UserGame" WHERE id = $1',
      [room.gameId]
    )
    const userGame = userGameResult.rows[0]

    // Check if player already exists
    console.log('👤 Checking if player exists:', { roomId: room.id, name });
    const playerResult = await pool.query(
      'SELECT * FROM "GamePlayers" WHERE "roomId" = $1 AND name = $2 LIMIT 1',
      [room.id, name]
    )
    let player = playerResult.rows[0]
    console.log('👤 Player found:', player ? { id: player.id, name: player.name, role: player.role, isApproved: player.isApproved } : 'NOT FOUND');

    // Count approved players
    const approvedPlayersResult = await pool.query(
      'SELECT * FROM "GamePlayers" WHERE "roomId" = $1 AND "isApproved" = true',
      [room.id]
    )
    const numberOfApprovedPlayers = approvedPlayersResult.rows
    console.log('✅ Approved players count:', numberOfApprovedPlayers.length, '/ Max:', userGame.nPlayer);

    if (!player) {
      if (numberOfApprovedPlayers.length < userGame.nPlayer) {
        console.log('➕ Creating new player as guest (auto-approved)');
        const newPlayerResult = await pool.query(
          'INSERT INTO "GamePlayers" ("roomId", name, role, "isApproved") VALUES ($1, $2, $3, $4) RETURNING *',
          [room.id, name, 'guest', true]
        )
        player = newPlayerResult.rows[0]
        console.log('✅ New player created and auto-approved:', { id: player.id, name: player.name, role: player.role, isApproved: player.isApproved });
      } else {
        return res.status(400).json({ message: 'Room Capacity is full' })
      }
    } else {
      // Player already exists, just return their info
      console.log('👤 Player already exists in room, returning existing player info');
    }

    // Get all players in the room
    const allPlayerResult = await pool.query(
      'SELECT * FROM "GamePlayers" WHERE "roomId" = $1',
      [room.id]
    )
    const allPlayer = allPlayerResult.rows

    req.io.to(room.id).emit('players_response', allPlayer)

    return res.status(201).json({ message: 'Game player Created.', player, gameId: userGame.id, allPlayer })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getPlayersByInviteCodeController = async (req: Request, res: Response) => {
  try {
    const inviteCode = req.query?.inviteCode as string;
    
    if(missingParams({inviteCode}, res))return;

    // Find room by invite code (include started status for active games)
    const roomResult = await pool.query(
      'SELECT * FROM "GameRooms" WHERE "inviteCode" = $1 AND status IN ($2, $3, $4) LIMIT 1',
      [inviteCode, 'created', 'live', 'started']
    )
    const room = roomResult.rows[0]

    if(!room){
      return res.status(404).json({ message: 'Game Room Not Found' })
    }

    // Get all players in the room
    const allPlayersResult = await pool.query(
      'SELECT id, name, "imgUrl", role, "isApproved", "createdAt" FROM "GamePlayers" WHERE "roomId" = $1 ORDER BY "createdAt" ASC',
      [room.id]
    )
    const allPlayers = allPlayersResult.rows

    return res.status(200).json({ 
      message: 'Got all players successfully', 
      result: {
        room: {
          id: room.id,
          status: room.status,
          inviteCode: room.inviteCode,
          expiredAt: room.expiredAt
        },
        players: allPlayers
      }
    })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllPlayersOfARoomController = async (req: Request, res: Response) => {
  try {
    let roomId = req.query?.roomId as string;
    let playerId = req.query?.playerId as string;

    if(missingParams({roomId}, res))return;
    if(missingParams({playerId}, res))return;

    // Find room that is not closed
    const liveRoomResult = await pool.query(
      'SELECT * FROM "GameRooms" WHERE id = $1 AND status != $2',
      [roomId, 'closed']
    )
    const isLiveRoom = liveRoomResult.rows[0]

    if(!isLiveRoom){
      return res.status(404).json({ message: 'Game Room Not Found' })
    }

    // Check if player is approved
    const approvedPlayerResult = await pool.query(
      'SELECT * FROM "GamePlayers" WHERE id = $1 AND "isApproved" = true LIMIT 1',
      [playerId]
    )
    const isApprovedPlayer = approvedPlayerResult.rows[0]

    if(!isApprovedPlayer){
      return res.status(404).json({ message: 'Game Player is Not Approved' })
    }

    // Get all approved players in the room
    const allPlayersResult = await pool.query(
      'SELECT * FROM "GamePlayers" WHERE "roomId" = $1 AND "isApproved" = true',
      [roomId]
    )
    const allPlayers = allPlayersResult.rows

    return res.status(201).json({ message: 'Got all Players successfully', result: {allPlayers} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getResultOfARoomController = async (req: Request, res: Response) => {
  try {
    let roomId = req.query?.roomId as string;
    let playerId = req.query?.playerId as string;
    if(missingParams({roomId}, res))return;
    if(missingParams({playerId}, res))return;

    // Check if player has access (is approved)
    const userAccessResult = await pool.query(
      'SELECT * FROM "GamePlayers" WHERE id = $1 AND "isApproved" = true LIMIT 1',
      [playerId]
    )
    const userAccess = userAccessResult.rows[0]

    if(!userAccess){
      return res.status(404).json({ message: 'Approved Game Player Not Found' })
    }

    // Check if room exists and is finished
    const finishedRoomResult = await pool.query(
      'SELECT * FROM "GameRooms" WHERE id = $1 AND status = $2',
      [roomId, 'finished']
    )
    const isLiveRoom = finishedRoomResult.rows[0]

    if(!isLiveRoom){
      return res.status(404).json({ message: 'Game Room Not Found' })
    }
    
    // Check if we have a completed session with enhanced data
    const sessionResult = await pool.query(
      `SELECT * FROM "GameSessions" WHERE "roomId" = $1 AND status = 'completed' 
       ORDER BY "sessionEndedAt" DESC LIMIT 1`,
      [roomId]
    );
    
    // Use enhanced detailed results if available
    if (sessionResult.rows.length > 0) {
      const session = sessionResult.rows[0];
      
      // Get detailed results from GameResultsDetailed view
      const detailedResult = await pool.query(
        `SELECT * FROM "GameResultsDetailed" WHERE "sessionId" = $1 ORDER BY "finalRank" ASC`,
        [session.id]
      );
      
      if (detailedResult.rows.length > 0) {
        // Transform to expected format
        const formattedResult = detailedResult.rows.map(player => ({
          playerName: player.playerName,
          image: player.playerImage,
          nQuestionSolved: player.questionsAnswered,
          rightAnswered: player.correctAnswers,
          points: player.finalScore,
          accuracyPercentage: player.accuracyPercentage,
          rank: player.finalRank,
          // Add additional enhanced metrics
          wasFirst: player.wasFirstCorrect, // How many times player was first to answer correctly
          fastestTime: player.fastestReactionTime // Player's fastest reaction time
        }));
        
        return res.status(200).json({
          message: 'Got Enhanced Result of a game room successfully',
          result: formattedResult,
          session: {
            id: session.id,
            totalQuestions: session.totalQuestions,
            totalPlayers: session.totalPlayers,
            startedAt: session.sessionStartedAt,
            endedAt: session.sessionEndedAt,
            gameId: session.gameId
          }
        });
      }
    }
    
    // Fallback to original logic if no enhanced data is available
    // Get all approved players in the room
    const playersResult = await pool.query(
      'SELECT * FROM "GamePlayers" WHERE "roomId" = $1 AND "isApproved" = true',
      [roomId]
    )
    const players = playersResult.rows

    let result = [];

    for (const player of players) {
      // Get questions solved by this player
      const questionSolvedResult = await pool.query(
        'SELECT * FROM "questionsSolved" WHERE "playerId" = $1',
        [player.id]
      )
      const questionSolved = questionSolvedResult.rows

      const nQuestionSolved = questionSolved.length;
      const rightAnswered = questionSolved.filter((e: any) => e.isRight === true).length;
      const points = questionSolved.reduce((sum: number, q: any) => sum + q.point, 0);

      result.push({
        playerName: player.name,
        image: player.imgUrl,
        nQuestionSolved,
        rightAnswered,
        points
      });
    }

    result.sort((a, b) => b.points - a.points);

    return res.status(201).json({ message: 'Got Result of a game room successfully', result })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getGameProgressController = async (req: Request, res: Response) => {
  try {
    let roomId = req.query?.roomId as string;
    
    if(missingParams({roomId}, res)) return;

    // Find room that is not closed
    const liveRoomResult = await pool.query(
      'SELECT * FROM "GameRooms" WHERE id = $1 AND status IN ($2, $3, $4)',
      [roomId, 'live', 'started', 'created']
    )
    const isLiveRoom = liveRoomResult.rows[0]

    if(!isLiveRoom){
      return res.status(404).json({ message: 'Game Room Not Found or Not Active' })
    }
    
    // Try to get enhanced leaderboard data if available
    const sessionResult = await pool.query(
      `SELECT * FROM "GameSessions" WHERE "roomId" = $1 AND status IN ('waiting', 'in_progress') 
       ORDER BY "sessionStartedAt" DESC LIMIT 1`,
      [roomId]
    );
    
    if (sessionResult.rows.length > 0) {
      const session = sessionResult.rows[0];
      
      // Get live leaderboard data
      const leaderboardResult = await pool.query(
        `SELECT ll.*, pp."averageReactionTime", pp."fastestCorrectAnswer", pp."streak" as "currentStreak"
         FROM "LiveLeaderboard" ll
         LEFT JOIN "PlayerPerformance" pp ON pp."sessionId" = ll."sessionId" AND pp."playerId" = ll."playerId"
         WHERE ll."sessionId" = $1
         ORDER BY ll."currentRank" ASC`,
        [session.id]
      );
      
      if (leaderboardResult.rows.length > 0) {
        // Get player details
        const playerIds = leaderboardResult.rows.map(p => p.playerId);
        const playersResult = await pool.query(
          `SELECT * FROM "GamePlayers" WHERE id = ANY($1::uuid[])`,
          [playerIds]
        );
        const playersMap = playersResult.rows.reduce((map, player) => {
          map[player.id] = player;
          return map;
        }, {});
        
        // Format enhanced progress data
        const enhancedProgressData = leaderboardResult.rows.map(player => ({
          id: player.playerId,
          name: player.playerName,
          imgUrl: playersMap[player.playerId]?.imgUrl,
          currentQuestion: player.questionsAnswered,
          score: player.currentPoints,
          rank: player.currentRank,
          correctAnswers: player.correctAnswers,
          currentStreak: player.currentStreak || 0,
          averageReactionTime: player.averageReactionTime,
          fastestTime: player.fastestCorrectAnswer,
          isAnswered: player.questionsAnswered > 0,
          isOnline: true
        }));
        
        // Find max question number
        let maxQuestion = 0;
        enhancedProgressData.forEach(player => {
          if (player.currentQuestion > maxQuestion) {
            maxQuestion = player.currentQuestion;
          }
        });
        
        return res.status(200).json({
          message: 'Got enhanced game progress successfully',
          result: {
            players: enhancedProgressData,
            currentQuestion: maxQuestion,
            sessionId: session.id,
            totalQuestions: session.totalQuestions,
            totalPlayers: session.totalPlayers,
            leaderboard: true
          }
        });
      }
    }

    // Fall back to original logic if enhanced data not available
    // Get all approved players in the room
    const playersResult = await pool.query(
      'SELECT * FROM "GamePlayers" WHERE "roomId" = $1 AND "isApproved" = true ORDER BY "createdAt" ASC',
      [roomId]
    )
    const players = playersResult.rows

    let progressData = [];
    let currentQuestion = 0;

    for (const player of players) {
      // Get questions solved by this player
      const questionSolvedResult = await pool.query(
        'SELECT * FROM "QuestionsSolved" WHERE "playerId" = $1 ORDER BY "createdAt" DESC',
        [player.id]
      )
      const questionSolved = questionSolvedResult.rows
      
      const score = questionSolved.reduce((sum: number, q: any) => sum + q.point, 0);
      const currentQuestionNumber = questionSolved.length;
      const isAnswered = questionSolved.length > 0;
      const latestAnswerTime = questionSolved.length > 0 ? questionSolved[0].timeToAnswer : undefined;
      
      if (currentQuestionNumber > currentQuestion) {
        currentQuestion = currentQuestionNumber;
      }

      progressData.push({
        id: player.id,
        name: player.name,
        imgUrl: player.imgUrl,
        currentQuestion: currentQuestionNumber,
        score: score,
        isAnswered: isAnswered,
        answerTime: latestAnswerTime,
        isOnline: true // We'll assume players are online for now
      });
    }

    const result = {
      players: progressData,
      currentQuestion: currentQuestion,
      leaderboard: false
    };

    return res.status(200).json({ message: 'Got game progress successfully', result })
  } catch (error) {
    console.error('Error in getGameProgressController:', error);
    return res.status(500).json(error)
  }
}
