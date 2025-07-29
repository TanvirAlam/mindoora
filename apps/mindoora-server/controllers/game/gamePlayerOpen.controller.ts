import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { createGamePlayersSchema, createGamePlayersType } from '../../schema/game/gamePlayers.schema'
import { missingParams } from '../tools'

export const createGamePlayerController = async (req: Request<{}, {}, createGamePlayersType>, res: Response) => {
  try {
    const { inviteCode, name } = req.body
    createGamePlayersSchema.parse(req.body)

    // Find live room by invite code
    const liveRoomResult = await pool.query(
      'SELECT * FROM "gameRooms" WHERE "inviteCode" = $1 AND status IN ($2, $3) LIMIT 1',
      [inviteCode, 'live', 'created']
    )
    const isLiveRoom = liveRoomResult.rows[0]
    if (!isLiveRoom) return res.status(404).json({ message: 'Room not found' });

    // Get user game details
    const userGameResult = await pool.query(
      'SELECT * FROM "userGame" WHERE id = $1',
      [isLiveRoom.gameId]
    )
    const userGame = userGameResult.rows[0]

    // Check if player already exists
    const playerResult = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE "roomId" = $1 AND name = $2 LIMIT 1',
      [isLiveRoom.id, name]
    )
    let player = playerResult.rows[0]

    // Count approved players
    const approvedPlayersResult = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE "roomId" = $1 AND "isApproved" = true',
      [isLiveRoom.id]
    )
    const numberOfApprovedPlayers = approvedPlayersResult.rows

    if (!player) {
      if (numberOfApprovedPlayers.length < userGame.nPlayer) {
        const newPlayerResult = await pool.query(
          'INSERT INTO "gamePlayers" ("roomId", name, role, "isApproved") VALUES ($1, $2, $3, $4) RETURNING *',
          [isLiveRoom.id, name, 'guest', false]
        )
        player = newPlayerResult.rows[0]
      } else {
        return res.status(404).json({ message: 'Room Capacity is full' })
      }
    }

    // Get all players in the room
    const allPlayerResult = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE "roomId" = $1',
      [isLiveRoom.id]
    )
    const allPlayer = allPlayerResult.rows

    req.io.to(isLiveRoom.id).emit('players_response', allPlayer)

    return res.status(201).json({ message: 'Game player Created.', player, gameId: userGame.id, allPlayer })
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
      'SELECT * FROM "gameRooms" WHERE id = $1 AND status != $2',
      [roomId, 'closed']
    )
    const isLiveRoom = liveRoomResult.rows[0]

    if(!isLiveRoom){
      return res.status(404).json({ message: 'Game Room Not Found' })
    }

    // Check if player is approved
    const approvedPlayerResult = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE id = $1 AND "isApproved" = true LIMIT 1',
      [playerId]
    )
    const isApprovedPlayer = approvedPlayerResult.rows[0]

    if(!isApprovedPlayer){
      return res.status(404).json({ message: 'Game Player is Not Approved' })
    }

    // Get all approved players in the room
    const allPlayersResult = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE "roomId" = $1 AND "isApproved" = true',
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
      'SELECT * FROM "gamePlayers" WHERE id = $1 AND "isApproved" = true LIMIT 1',
      [playerId]
    )
    const userAccess = userAccessResult.rows[0]

    if(!userAccess){
      return res.status(404).json({ message: 'Approved Game Player Not Found' })
    }

    // Check if room exists and is finished
    const finishedRoomResult = await pool.query(
      'SELECT * FROM "gameRooms" WHERE id = $1 AND status = $2',
      [roomId, 'finished']
    )
    const isLiveRoom = finishedRoomResult.rows[0]

    if(!isLiveRoom){
      return res.status(404).json({ message: 'Game Room Not Found' })
    }

    // Get all approved players in the room
    const playersResult = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE "roomId" = $1 AND "isApproved" = true',
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
