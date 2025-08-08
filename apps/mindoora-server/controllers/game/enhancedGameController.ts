import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import {
  gameSessionCreateSchema,
  gameSessionQuerySchema,
  enhancedQuestionSolveSchema,
  liveLeaderboardQuerySchema,
  calculateWinnersSchema,
  realTimeAnswerSchema,
  questionAttemptCreateSchema,
  GameSessionCreateType,
  EnhancedQuestionSolveType,
  LiveLeaderboardQueryType,
  CalculateWinnersType,
  RealTimeAnswerType,
  QuestionAttemptCreateType
} from '../../db/schemas/game/enhancedGameTracking.schema'
import { calculatePoint, isExpired, missingParams, findDuplicate } from '../tools'

// ============================================================================
// Game Session Management
// ============================================================================

/**
 * Creates a new game session with enhanced tracking capabilities
 */
export const createGameSessionController = async (
  req: Request<{}, {}, GameSessionCreateType>,
  res: Response
) => {
  try {
    const sessionData = gameSessionCreateSchema.parse(req.body)
    
    // Verify that the room and game exist and are valid
    const roomCheck = await pool.query(
      'SELECT gr.*, ug."title", ug."nPlayer" FROM "GameRooms" gr ' +
      'JOIN "UserGame" ug ON ug.id = gr."gameId" ' +
      'WHERE gr.id = $1 AND gr."gameId" = $2 AND gr.status IN (\'created\', \'live\')',
      [sessionData.roomId, sessionData.gameId]
    )
    
    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Invalid room or game' })
    }
    
    const room = roomCheck.rows[0]
    
    // Check if room is expired
    if (isExpired(room.expiredAt)) {
      return res.status(400).json({ message: 'Game room has expired' })
    }
    
    // Get total questions for this game
    const questionCount = await pool.query(
      'SELECT COUNT(*) as total FROM "Questions" WHERE "gameId" = $1',
      [sessionData.gameId]
    )
    
    const totalQuestions = parseInt(questionCount.rows[0].total)
    
    if (totalQuestions === 0) {
      return res.status(400).json({ message: 'Game has no questions' })
    }
    
    // Create the game session
    const sessionResult = await pool.query(
      'INSERT INTO "GameSessions" ("roomId", "gameId", "totalQuestions", "totalPlayers", ' +
      '"gameMode", "maxPlayersAllowed", "sessionMetadata") ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        sessionData.roomId,
        sessionData.gameId,
        totalQuestions,
        sessionData.totalPlayers,
        sessionData.gameMode,
        sessionData.maxPlayersAllowed,
        JSON.stringify(sessionData.sessionMetadata)
      ]
    )
    
    const session = sessionResult.rows[0]
    
    // Initialize live leaderboard for all players in the room
    const players = await pool.query(
      'SELECT * FROM "GamePlayers" WHERE "roomId" = $1 AND "isApproved" = true',
      [sessionData.roomId]
    )
    
    for (const player of players.rows) {
      await pool.query(
        'INSERT INTO "LiveLeaderboard" ("sessionId", "playerId", "playerName") ' +
        'VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [session.id, player.id, player.name]
      )
    }
    
    // Emit session created event to room
    req.io.to(sessionData.roomId).emit('session_created', {
      sessionId: session.id,
      totalQuestions,
      gameMode: sessionData.gameMode,
      players: players.rows.length
    })
    
    return res.status(201).json({
      message: 'Game session created successfully',
      result: {
        sessionId: session.id,
        roomId: session.roomId,
        gameId: session.gameId,
        totalQuestions: session.totalQuestions,
        gameMode: session.gameMode,
        status: session.status
      }
    })
    
  } catch (error) {
    console.error('Create game session error:', error)
    return res.status(500).json({ message: 'Internal server error', error })
  }
}

// ============================================================================
// Real-time Answer Processing with Precise Timing
// ============================================================================

/**
 * Processes answers with millisecond precision and determines winners based on speed
 */
export const submitRealTimeAnswerController = async (
  req: Request<{}, {}, RealTimeAnswerType>,
  res: Response
) => {
  try {
    const answerData = realTimeAnswerSchema.parse(req.body)
    
    // Record the server-side timestamp as soon as possible for accuracy
    const serverTimestampMs = Date.now()
    const adjustedTimestamp = answerData.clientLatency 
      ? serverTimestampMs - answerData.clientLatency 
      : serverTimestampMs
    
    // Verify session exists and is active
    const sessionCheck = await pool.query(
      'SELECT gs.*, gr."expiredAt" FROM "GameSessions" gs ' +
      'JOIN "GameRooms" gr ON gr.id = gs."roomId" ' +
      'WHERE gs.id = $1 AND gs.status IN (\'in_progress\', \'waiting\')',
      [answerData.sessionId]
    )
    
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Game session not found or not active' })
    }
    
    const session = sessionCheck.rows[0]
    
    if (isExpired(session.expiredAt)) {
      return res.status(400).json({ message: 'Game session has expired' })
    }
    
    // Verify player is in this session
    const playerCheck = await pool.query(
      'SELECT gp.* FROM "GamePlayers" gp ' +
      'JOIN "GameRooms" gr ON gr.id = gp."roomId" ' +
      'WHERE gp.id = $1 AND gr.id = $2 AND gp."isApproved" = true',
      [answerData.playerId, session.roomId]
    )
    
    if (playerCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Player not authorized for this session' })
    }
    
    // Check if player already answered this question
    const existingAnswer = await pool.query(
      'SELECT id FROM "QuestionsSolved" WHERE "playerId" = $1 AND "questionId" = $2',
      [answerData.playerId, answerData.questionId]
    )
    
    if (existingAnswer.rows.length > 0) {
      return res.status(400).json({ message: 'Question already answered' })
    }
    
    // Get question details
    const questionResult = await pool.query(
      'SELECT * FROM "Questions" WHERE id = $1 AND "gameId" = $2',
      [answerData.questionId, session.gameId]
    )
    
    if (questionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' })
    }
    
    const question = questionResult.rows[0]
    
    // Calculate if answer is correct
    const isCorrect = question.answer === parseInt(answerData.answer)
    
    // Calculate time taken (this should be provided by frontend with precise timing)
    const timeTakenSeconds = Math.floor((adjustedTimestamp - answerData.submittedAt) / 1000)
    const reactionTimeMs = Math.max(0, adjustedTimestamp - answerData.submittedAt)
    
    // Validate time limits
    if (timeTakenSeconds > question.timeLimit) {
      return res.status(400).json({ message: 'Answer submitted after time limit' })
    }
    
    if (reactionTimeMs < 100) { // Minimum human reaction time
      return res.status(400).json({ message: 'Answer submitted too quickly' })
    }
    
    // Calculate points based on correctness and speed
    let pointsEarned = 0
    if (isCorrect) {
      pointsEarned = calculatePoint(question.timeLimit, timeTakenSeconds)
      
      // Add speed bonus if answered quickly
      if (timeTakenSeconds <= question.timeLimit * 0.3) {
        pointsEarned = Math.floor(pointsEarned * 1.5) // 50% speed bonus
      } else if (timeTakenSeconds <= question.timeLimit * 0.6) {
        pointsEarned = Math.floor(pointsEarned * 1.2) // 20% speed bonus
      }
    }
    
    // Begin transaction for atomic operations
    await pool.query('BEGIN')
    
    try {
      // Insert into QuestionsSolved with enhanced data
      await pool.query(
        'INSERT INTO "QuestionsSolved" ("playerId", "questionId", "answer", "rightAnswer", ' +
        '"isRight", "timeTaken", "timeLimit", "point", "answeredAtMs", "reactionTime") ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [
          answerData.playerId,
          answerData.questionId,
          answerData.answer,
          question.answer.toString(),
          isCorrect,
          timeTakenSeconds,
          question.timeLimit,
          pointsEarned,
          adjustedTimestamp,
          reactionTimeMs
        ]
      )
      
      // Determine speed rank among correct answers for this question
      let speedRank = null
      let wasFirstCorrect = false
      
      if (isCorrect) {
        const correctAnswersResult = await pool.query(
          'SELECT COUNT(*) + 1 as rank FROM "QuestionsSolved" ' +
          'WHERE "questionId" = $1 AND "isRight" = true AND "answeredAtMs" < $2',
          [answerData.questionId, adjustedTimestamp]
        )
        
        speedRank = parseInt(correctAnswersResult.rows[0].rank)
        wasFirstCorrect = speedRank === 1
        
        // Insert detailed question attempt record
        await pool.query(
          'INSERT INTO "QuestionAttempts" ("sessionId", "questionId", "playerId", ' +
          '"attemptedAnswer", "isCorrect", "timeTakenMs", "displayedAt", "answeredAt", ' +
          '"pointsEarned", "speedRank", "wasFirstCorrect") ' +
          'VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL \'1 second\' * $7, NOW(), $8, $9, $10)',
          [
            answerData.sessionId,
            answerData.questionId,
            answerData.playerId,
            answerData.answer,
            isCorrect,
            reactionTimeMs,
            timeTakenSeconds,
            pointsEarned,
            speedRank,
            wasFirstCorrect
          ]
        )
      }
      
      await pool.query('COMMIT')
      
      // Get updated leaderboard
      const leaderboard = await getLiveLeaderboard(answerData.sessionId)
      
      // Emit real-time updates to all players in the session
      req.io.to(session.roomId).emit('answer_submitted', {
        playerId: answerData.playerId,
        questionId: answerData.questionId,
        isCorrect,
        timeTaken: timeTakenSeconds,
        pointsEarned,
        speedRank,
        wasFirstCorrect,
        leaderboard
      })
      
      // Send individual response to the player
      return res.status(200).json({
        message: 'Answer processed successfully',
        result: {
          isCorrect,
          pointsEarned,
          timeTaken: timeTakenSeconds,
          reactionTime: reactionTimeMs,
          speedRank,
          wasFirstCorrect,
          totalPoints: leaderboard.find((p: any) => p.playerId === answerData.playerId)?.currentPoints || 0
        }
      })
      
    } catch (transactionError) {
      await pool.query('ROLLBACK')
      throw transactionError
    }
    
  } catch (error) {
    console.error('Submit real-time answer error:', error)
    return res.status(500).json({ message: 'Internal server error', error })
  }
}

// ============================================================================
// Live Leaderboard Management
// ============================================================================

/**
 * Gets real-time leaderboard for a game session
 */
export const getLiveLeaderboardController = async (
  req: Request<{}, {}, {}, LiveLeaderboardQueryType>,
  res: Response
) => {
  try {
    const query = liveLeaderboardQuerySchema.parse(req.query)
    const leaderboard = await getLiveLeaderboard(query.sessionId, query.limit, query.includeMetrics)
    
    return res.status(200).json({
      message: 'Leaderboard retrieved successfully',
      result: { leaderboard }
    })
    
  } catch (error) {
    console.error('Get live leaderboard error:', error)
    return res.status(500).json({ message: 'Internal server error', error })
  }
}

/**
 * Helper function to get live leaderboard data
 */
const getLiveLeaderboard = async (
  sessionId: string, 
  limit: number = 10, 
  includeMetrics: boolean = true
) => {
  const query = includeMetrics
    ? `SELECT ll.*, 
         ROUND(
           CASE WHEN ll."questionsAnswered" > 0 
           THEN (ll."correctAnswers"::DECIMAL / ll."questionsAnswered" * 100)
           ELSE 0 END, 2
         ) as "accuracyPercentage",
         pp."averageReactionTime",
         pp."maxStreak"
       FROM "LiveLeaderboard" ll
       LEFT JOIN "PlayerPerformance" pp ON pp."sessionId" = ll."sessionId" AND pp."playerId" = ll."playerId"
       WHERE ll."sessionId" = $1
       ORDER BY ll."currentRank" ASC
       LIMIT $2`
    : `SELECT * FROM "LiveLeaderboard" 
       WHERE "sessionId" = $1 
       ORDER BY "currentRank" ASC 
       LIMIT $2`
  
  const result = await pool.query(query, [sessionId, limit])
  return result.rows
}

// ============================================================================
// Winner Calculation and Final Results
// ============================================================================

/**
 * Calculates final winners based on comprehensive criteria
 */
export const calculateWinnersController = async (
  req: Request<{}, {}, CalculateWinnersType>,
  res: Response
) => {
  try {
    const { sessionId, criteria } = calculateWinnersSchema.parse(req.body)
    
    // Verify session exists and get session details
    const sessionResult = await pool.query(
      'SELECT gs.*, ug."title" as "gameTitle" FROM "GameSessions" gs ' +
      'JOIN "UserGame" ug ON ug.id = gs."gameId" ' +
      'WHERE gs.id = $1',
      [sessionId]
    )
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Game session not found' })
    }
    
    const session = sessionResult.rows[0]
    
    // Calculate comprehensive player statistics
    const playerStats = await pool.query(`
      SELECT 
        ll."playerId",
        ll."playerName",
        ll."currentPoints" as "totalPoints",
        ll."correctAnswers",
        ll."questionsAnswered",
        ROUND(
          CASE WHEN ll."questionsAnswered" > 0 
          THEN (ll."correctAnswers"::DECIMAL / ll."questionsAnswered" * 100)
          ELSE 0 END, 2
        ) as "accuracyPercentage",
        COALESCE(AVG(qs."reactionTime"), 0) as "averageReactionTime",
        COUNT(CASE WHEN qs."answerOrder" = 1 AND qs."isRight" = true THEN 1 END) as "firstCorrectAnswers",
        MAX(ll."currentStreak") as "maxStreak",
        MIN(CASE WHEN qs."isRight" = true THEN qs."reactionTime" END) as "fastestReaction"
      FROM "LiveLeaderboard" ll
      LEFT JOIN "QuestionsSolved" qs ON qs."playerId" = ll."playerId"
      WHERE ll."sessionId" = $1
      GROUP BY ll."playerId", ll."playerName", ll."currentPoints", ll."correctAnswers", ll."questionsAnswered", ll."currentStreak"
      ORDER BY ll."currentPoints" DESC, ll."correctAnswers" DESC, "averageReactionTime" ASC
    `, [sessionId])
    
    const players = playerStats.rows
    
    // Apply bonuses based on criteria
    const playersWithBonuses = players.map((player: any, index: number) => {
      const speedBonus = Math.floor(
        (player.firstCorrectAnswers * 10) * criteria.speedBonusMultiplier
      )
      const accuracyBonus = Math.floor(
        (player.accuracyPercentage / 100 * player.totalPoints) * criteria.accuracyBonusMultiplier
      )
      
      return {
        ...player,
        speedBonus,
        accuracyBonus,
        finalScore: player.totalPoints + speedBonus + accuracyBonus,
        originalRank: index + 1
      }
    })
    
    // Sort by final criteria
    const sortedPlayers = playersWithBonuses.sort((a, b) => {
      if (criteria.primarySort === 'totalPoints') {
        if (a.finalScore !== b.finalScore) return b.finalScore - a.finalScore
      } else if (criteria.primarySort === 'correctAnswers') {
        if (a.correctAnswers !== b.correctAnswers) return b.correctAnswers - a.correctAnswers
      } else if (criteria.primarySort === 'averageReactionTime') {
        if (a.averageReactionTime !== b.averageReactionTime) return a.averageReactionTime - b.averageReactionTime
      }
      
      // Secondary sort
      if (criteria.secondarySort === 'correctAnswers') {
        if (a.correctAnswers !== b.correctAnswers) return b.correctAnswers - a.correctAnswers
      } else if (criteria.secondarySort === 'averageReactionTime') {
        if (a.averageReactionTime !== b.averageReactionTime) return a.averageReactionTime - b.averageReactionTime
      }
      
      return a.averageReactionTime - b.averageReactionTime // Final tiebreaker
    })
    
    // Assign final ranks
    const winners = sortedPlayers.map((player, index) => ({
      ...player,
      finalRank: index + 1,
      isWinner: index < 3, // Top 3 are winners
      trophy: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : null
    }))
    
    // Update GameWinners table if top 3 exist
    if (winners.length >= 3) {
      await pool.query(`
        INSERT INTO "GameWinners" ("gameId", "firstPlacePlayerId", "secondPlacePlayerId", "thirdPlacePlayerId")
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ("gameId") DO UPDATE SET
          "firstPlacePlayerId" = EXCLUDED."firstPlacePlayerId",
          "secondPlacePlayerId" = EXCLUDED."secondPlacePlayerId",
          "thirdPlacePlayerId" = EXCLUDED."thirdPlacePlayerId",
          "updatedAt" = NOW()
      `, [session.gameId, winners[0].playerId, winners[1].playerId, winners[2].playerId])
    }
    
    // Update session status to completed
    await pool.query(
      'UPDATE "GameSessions" SET status = $1, "sessionEndedAt" = NOW() WHERE id = $2',
      ['completed', sessionId]
    )
    
    // Emit final results to all players
    req.io.to(session.roomId).emit('game_completed', {
      sessionId,
      winners: winners.slice(0, 10), // Send top 10
      gameTitle: session.gameTitle,
      totalQuestions: session.totalQuestions
    })
    
    return res.status(200).json({
      message: 'Winners calculated successfully',
      result: {
        sessionId,
        gameTitle: session.gameTitle,
        winners,
        criteria,
        completedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Calculate winners error:', error)
    return res.status(500).json({ message: 'Internal server error', error })
  }
}

// ============================================================================
// Game Analytics and Detailed Results
// ============================================================================

/**
 * Gets comprehensive game results and analytics
 */
export const getGameResultsController = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' })
    }
    
    // Get detailed game results using the view
    const results = await pool.query(
      'SELECT * FROM "GameResultsDetailed" WHERE "sessionId" = $1 ORDER BY "finalRank" ASC',
      [sessionId]
    )
    
    // Get question-level analytics for this session
    const questionAnalytics = await pool.query(`
      SELECT 
        q."id" as "questionId",
        q."question",
        COUNT(qs.*) as "totalAttempts",
        COUNT(CASE WHEN qs."isRight" = true THEN 1 END) as "correctAttempts",
        ROUND(AVG(CASE WHEN qs."isRight" = true THEN qs."timeTaken" END), 2) as "avgCorrectTime",
        MIN(CASE WHEN qs."isRight" = true THEN qs."timeTaken" END) as "fastestTime",
        STRING_AGG(
          CASE WHEN qs."answerOrder" = 1 AND qs."isRight" = true 
          THEN gp."name" 
          END, ''
        ) as "firstCorrectPlayer"
      FROM "Questions" q
      LEFT JOIN "QuestionsSolved" qs ON qs."questionId" = q."id"
      LEFT JOIN "GamePlayers" gp ON gp."id" = qs."playerId"
      LEFT JOIN "GameSessions" gs ON gs."gameId" = q."gameId" AND gs."id" = $1
      WHERE q."gameId" = (SELECT "gameId" FROM "GameSessions" WHERE "id" = $1)
      GROUP BY q."id", q."question"
      ORDER BY q."createdAt"
    `, [sessionId])
    
    return res.status(200).json({
      message: 'Game results retrieved successfully',
      result: {
        sessionId,
        players: results.rows,
        questionAnalytics: questionAnalytics.rows,
        summary: {
          totalPlayers: results.rows.length,
          totalQuestions: results.rows[0]?.totalQuestions || 0,
          averageScore: results.rows.length > 0 
            ? Math.round(results.rows.reduce((sum: number, p: any) => sum + (p.finalScore || 0), 0) / results.rows.length)
            : 0,
          winner: results.rows.find((p: any) => p.finalRank === 1)
        }
      }
    })
    
  } catch (error) {
    console.error('Get game results error:', error)
    return res.status(500).json({ message: 'Internal server error', error })
  }
}

/**
 * Gets real-time question statistics during gameplay
 */
export const getQuestionStatsController = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params
    const { sessionId } = req.query
    
    if (!questionId || !sessionId) {
      return res.status(400).json({ message: 'Question ID and Session ID are required' })
    }
    
    // Get who answered this question and in what order
    const answerStats = await pool.query(`
      SELECT 
        qs."playerId",
        gp."name" as "playerName",
        qs."isRight",
        qs."timeTaken",
        qs."reactionTime",
        qs."answerOrder",
        qs."answeredAtMs"
      FROM "QuestionsSolved" qs
      JOIN "GamePlayers" gp ON gp."id" = qs."playerId"
      WHERE qs."questionId" = $1
      ORDER BY qs."answerOrder" ASC
    `, [questionId])
    
    // Get question details
    const questionDetails = await pool.query(
      'SELECT "question", "timeLimit", "qPoints" FROM "Questions" WHERE "id" = $1',
      [questionId]
    )
    
    if (questionDetails.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' })
    }
    
    const question = questionDetails.rows[0]
    const answers = answerStats.rows
    
    return res.status(200).json({
      message: 'Question statistics retrieved successfully',
      result: {
        questionId,
        question: question.question,
        timeLimit: question.timeLimit,
        totalAnswers: answers.length,
        correctAnswers: answers.filter((a: any) => a.isRight).length,
        incorrectAnswers: answers.filter((a: any) => !a.isRight).length,
        fastestCorrect: answers
          .filter((a: any) => a.isRight)
          .sort((a: any, b: any) => a.timeTaken - b.timeTaken)[0] || null,
        answerOrder: answers.map((a: any) => ({
          playerName: a.playerName,
          isCorrect: a.isRight,
          timeTaken: a.timeTaken,
          reactionTime: a.reactionTime,
          order: a.answerOrder
        }))
      }
    })
    
  } catch (error) {
    console.error('Get question stats error:', error)
    return res.status(500).json({ message: 'Internal server error', error })
  }
}
