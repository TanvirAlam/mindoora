import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { createQuestionSolveSchema, createQuestionSolveType } from '../../db/schemas/game/questionSolve.schema'
import { enhancedQuestionSolveSchema } from '../../db/schemas/game/enhancedGameTracking.schema'
import {calculatePoint, findDuplicate, isExpired, missingParams} from '../tools'

export const createQuestionSolveController = async (req: Request<{}, {}, createQuestionSolveType>, res: Response) => {
  try {
    const {
      playerId,
      questionId,
      answer,
      timeTaken
    } = req.body
    createQuestionSolveSchema.parse(req.body)
    
    // Record the precise submission time for accurate ordering
    const submissionTimeMs = Date.now()

    // Find game room with approved player
    const gamePlayerResult = await pool.query(
      `SELECT gr.* FROM "GameRooms" gr 
       JOIN "GamePlayers" gp ON gr.id = gp."roomId" 
       WHERE gp.id = $1 AND gp."isApproved" = true AND gr.status = 'live' 
       LIMIT 1`,
      [playerId]
    )
    const gamePlayer = gamePlayerResult.rows[0]

    const isGameRoomExpired = gamePlayer? isExpired(gamePlayer.expiredAt): true;

    if (isGameRoomExpired) {
      return res.status(404).json({ message: 'Game Room not found' });
    }

    if(await findDuplicate('QuestionsSolved', { playerId, questionId }, res))return;

    let isRight = false;

    // Get question details
    const questionResult = await pool.query(
      'SELECT * FROM "Questions" WHERE id = $1',
      [questionId]
    )
    const question = questionResult.rows[0]

    if(timeTaken === 0){
      return res.status(404).json({message: 'Too Quick Answer'})
    }

    if(timeTaken > question.timeLimit){
      return res.status(404).json({message: 'Time Limit Exceeds'})
    }

    if(question.answer === +answer){
      isRight = true
    }

    let pointAchieved = 0
    if(isRight){
      pointAchieved = calculatePoint(question.timeLimit, timeTaken)
    }

    // Get or create a game session for this room
    let sessionId;
    const sessionResult = await pool.query(
      `SELECT gs.* FROM "GameSessions" gs 
       WHERE gs."roomId" = $1 AND gs.status IN ('waiting', 'in_progress')
       ORDER BY gs."sessionStartedAt" DESC LIMIT 1`,
      [gamePlayer.id]
    );
    
    if (sessionResult.rows.length === 0) {
      // Create a new game session
      const gameResult = await pool.query('SELECT * FROM "UserGame" WHERE id = $1', [gamePlayer.gameId]);
      const game = gameResult.rows[0];
      
      // Count questions for this game
      const questionsCountResult = await pool.query(
        'SELECT COUNT(*) as total FROM "Questions" WHERE "gameId" = $1',
        [gamePlayer.gameId]
      );
      const totalQuestions = parseInt(questionsCountResult.rows[0].total);
      
      // Count players for this room
      const playersCountResult = await pool.query(
        'SELECT COUNT(*) as total FROM "GamePlayers" WHERE "roomId" = $1 AND "isApproved" = true',
        [gamePlayer.id]
      );
      const totalPlayers = parseInt(playersCountResult.rows[0].total);
      
      const newSessionResult = await pool.query(
        `INSERT INTO "GameSessions" ("roomId", "gameId", "totalQuestions", "totalPlayers", "status")
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [gamePlayer.id, gamePlayer.gameId, totalQuestions, totalPlayers, 'in_progress']
      );
      sessionId = newSessionResult.rows[0].id;
    } else {
      sessionId = sessionResult.rows[0].id;
    }
    
    // Calculate reaction time in milliseconds
    const reactionTimeMs = Math.max(0, timeTaken * 1000); // Convert seconds to milliseconds
    
    // Begin transaction for atomic operations
    await pool.query('BEGIN');
    
    try {
      // Create question solved record with enhanced data
      const questionSolvedResult = await pool.query(
        `INSERT INTO "QuestionsSolved" ("playerId", "questionId", answer, "rightAnswer", "isRight", 
         "timeLimit", "timeTaken", point, "answeredAtMs", "reactionTime")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [playerId, questionId, answer, question.answer.toString(), isRight, question.timeLimit, timeTaken, pointAchieved, submissionTimeMs, reactionTimeMs]
      );
      const questionSolved = questionSolvedResult.rows[0];
      
      // Add detailed question attempt for analytics
      await pool.query(
        `INSERT INTO "QuestionAttempts" ("sessionId", "questionId", "playerId", "attemptedAnswer",
         "isCorrect", "timeTakenMs", "displayedAt", "answeredAt", "pointsEarned")
         VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '1 second' * $7, NOW(), $8)`,
        [sessionId, questionId, playerId, answer, isRight, reactionTimeMs, timeTaken, pointAchieved]
      );
      
      // Update player performance metrics
      const playerPerfResult = await pool.query(
        `SELECT * FROM "PlayerPerformance" WHERE "sessionId" = $1 AND "playerId" = $2`,
        [sessionId, playerId]
      );
      
      if (playerPerfResult.rows.length === 0) {
        // Create new player performance record
        await pool.query(
          `INSERT INTO "PlayerPerformance" ("sessionId", "playerId", "totalPoints", "correctAnswers",
           "incorrectAnswers", "questionsAttempted", "averageReactionTime", "fastestCorrectAnswer",
           "streak", "maxStreak")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [sessionId, playerId, pointAchieved, isRight ? 1 : 0, isRight ? 0 : 1, 1, reactionTimeMs,
          isRight ? reactionTimeMs : null, isRight ? 1 : 0, isRight ? 1 : 0]
        );
      } else {
        // Update existing player performance
        const perf = playerPerfResult.rows[0];
        const totalPoints = perf.totalPoints + pointAchieved;
        const correctAnswers = perf.correctAnswers + (isRight ? 1 : 0);
        const incorrectAnswers = perf.incorrectAnswers + (isRight ? 0 : 1);
        const questionsAttempted = perf.questionsAttempted + 1;
        
        // Calculate new average reaction time
        const newAvgReactionTime = Math.round(
          ((perf.averageReactionTime * perf.questionsAttempted) + reactionTimeMs) / questionsAttempted
        );
        
        // Update fastest reaction time if applicable
        let fastestCorrectAnswer = perf.fastestCorrectAnswer;
        if (isRight && (fastestCorrectAnswer === null || reactionTimeMs < fastestCorrectAnswer)) {
          fastestCorrectAnswer = reactionTimeMs;
        }
        
        // Update streak
        let streak = isRight ? perf.streak + 1 : 0;
        let maxStreak = Math.max(perf.maxStreak, streak);
        
        await pool.query(
          `UPDATE "PlayerPerformance" SET
           "totalPoints" = $1, "correctAnswers" = $2, "incorrectAnswers" = $3, "questionsAttempted" = $4,
           "averageReactionTime" = $5, "fastestCorrectAnswer" = $6, "streak" = $7, "maxStreak" = $8
           WHERE "sessionId" = $9 AND "playerId" = $10`,
          [totalPoints, correctAnswers, incorrectAnswers, questionsAttempted, newAvgReactionTime,
          fastestCorrectAnswer, streak, maxStreak, sessionId, playerId]
        );
      }
      
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

    // Get all players in the room
    const playersResult = await pool.query(
      'SELECT * FROM "GamePlayers" WHERE "roomId" = $1',
      [gamePlayer.id]
    )
    const players = playersResult.rows

    let result = [];

    for (const player of players) {
      // Get questions solved by this player
      const questionSolvedResult = await pool.query(
        'SELECT * FROM "QuestionsSolved" WHERE "playerId" = $1',
        [player.id]
      )
      const questionSolved = questionSolvedResult.rows

      const nQuestionSolved = questionSolved.length;
      const rightAnswered = questionSolved.filter((e: any) => e.isRight === true).length;
      const points = questionSolved.reduce((sum: number, q: any) => sum + q.point, 0);

      result.push({
        playerName: player.name,
        nQuestionSolved,
        rightAnswered,
        points
      });
    }

    // Get players who solved this specific question
    const solvedQuestionIdsResult = await pool.query(
      'SELECT qs."playerId" FROM "QuestionsSolved" qs JOIN "GamePlayers" gp ON qs."playerId" = gp.id WHERE gp."roomId" = $1 AND qs."questionId" = $2',
      [gamePlayer.id, questionId]
    )
    const solvedQuestionIds = solvedQuestionIdsResult.rows.map((row: any) => row.playerId)

    req.io.to(gamePlayer.id).emit('result_response', result)
    req.io.to(gamePlayer.id).emit('q_solve_response', {questionId, playerId: solvedQuestionIds})

    return res.status(201).json({ message: 'Question Solve Saved successfully', result: {isRight} })

  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllQuestionSolvedController = async (req: Request, res: Response) => {
  try {
    let playerId = req.query?.playerId as string;
    if(missingParams({playerId}, res))return;

    // Find game room with approved player that is not closed
    const gamePlayerResult = await pool.query(
      `SELECT gr.* FROM "GameRooms" gr 
       JOIN "GamePlayers" gp ON gr.id = gp."roomId" 
       WHERE gp.id = $1 AND gp."isApproved" = true AND gr.status != 'closed' 
       LIMIT 1`,
      [playerId]
    )
    const gamePlayer = gamePlayerResult.rows[0]

    const isGameRoomExpired = gamePlayer? isExpired(gamePlayer.expiredAt): true;

    if (isGameRoomExpired) {
      return res.status(404).json({ message: 'Game Room not found' });
    }

    // Get all solved questions for this player
    const allSolvedQuestionsResult = await pool.query(
      'SELECT * FROM "QuestionsSolved" WHERE "playerId" = $1',
      [playerId]
    )
    const allSolvedQuestions = allSolvedQuestionsResult.rows

    return res.status(201).json({ message: 'Got all solved question successfully', result: {allSolvedQuestions} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllQuestionRawV2Controller = async (req: Request, res: Response) => {
  try {
    let playerId = req.query?.playerId as string;
    if(missingParams({playerId}, res))return;

    // Find game room with approved player (live or finished)
    const gamePlayerResult = await pool.query(
      `SELECT gr.* FROM "GameRooms" gr 
       JOIN "GamePlayers" gp ON gr.id = gp."roomId" 
       WHERE gp.id = $1 AND gp."isApproved" = true AND gr.status IN ('live', 'finished') 
       LIMIT 1`,
      [playerId]
    )
    const gamePlayer = gamePlayerResult.rows[0]

    const isGameRoomExpired = gamePlayer? isExpired(gamePlayer.expiredAt): true;

    if (isGameRoomExpired) {
      return res.status(404).json({ message: 'Game Room not found' });
    }

    // Get all questions for this game
    const allQuestionsRawResult = await pool.query(
      'SELECT * FROM "Questions" WHERE "gameId" = $1',
      [gamePlayer.gameId]
    )
    const allQuestionsRaw = allQuestionsRawResult.rows

    // Get all solved questions for this player
    const allSolvedQuestionsResult = await pool.query(
      'SELECT * FROM "QuestionsSolved" WHERE "playerId" = $1',
      [playerId]
    )
    const allSolvedQuestions = allSolvedQuestionsResult.rows

    const allSolvedQuestionsId = allSolvedQuestions.map((q: any) => q.questionId);
    const allQuestions = allQuestionsRaw.map((question: any) => {
      const { answer, ...restOfQuestion } = question;
      return {
        ...question,
        isAnswered: allSolvedQuestionsId.includes(question.id),
        answered: +allSolvedQuestions.filter((q: any) => q.questionId === question.id)[0]?.answer || null
      }
    });

    return res.status(201).json({ message: 'Got all Raw Questions successfully', result: {allQuestions} })
  } catch (error) {
    return res.status(500).json(error)
  }
}
