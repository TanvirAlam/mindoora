import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { createQuestionSolveSchema, createQuestionSolveType } from '../../db/schemas/game/questionSolve.schema'
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

    // Find game room with approved player
    const gamePlayerResult = await pool.query(
      `SELECT gr.* FROM "gameRooms" gr 
       JOIN "gamePlayers" gp ON gr.id = gp."roomId" 
       WHERE gp.id = $1 AND gp."isApproved" = true AND gr.status = 'live' 
       LIMIT 1`,
      [playerId]
    )
    const gamePlayer = gamePlayerResult.rows[0]

    const isGameRoomExpired = gamePlayer? isExpired(gamePlayer.expiredAt): true;

    if (isGameRoomExpired) {
      return res.status(404).json({ message: 'Game Room not found' });
    }

    if(await findDuplicate('questionsSolved', { playerId, questionId }, res))return;

    let isRight = false;

    // Get question details
    const questionResult = await pool.query(
      'SELECT * FROM questions WHERE id = $1',
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

    // Create question solved record
    await pool.query(
      'INSERT INTO "questionsSolved" ("playerId", "questionId", answer, "rightAnswer", "isRight", "timeLimit", "timeTaken", point) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [playerId, questionId, answer, question.answer.toString(), isRight, question.timeLimit, timeTaken, pointAchieved]
    )

    // Get all players in the room
    const playersResult = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE "roomId" = $1',
      [gamePlayer.id]
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
        nQuestionSolved,
        rightAnswered,
        points
      });
    }

    // Get players who solved this specific question
    const solvedQuestionIdsResult = await pool.query(
      'SELECT qs."playerId" FROM "questionsSolved" qs JOIN "gamePlayers" gp ON qs."playerId" = gp.id WHERE gp."roomId" = $1 AND qs."questionId" = $2',
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
      `SELECT gr.* FROM "gameRooms" gr 
       JOIN "gamePlayers" gp ON gr.id = gp."roomId" 
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
      'SELECT * FROM "questionsSolved" WHERE "playerId" = $1',
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
      `SELECT gr.* FROM "gameRooms" gr 
       JOIN "gamePlayers" gp ON gr.id = gp."roomId" 
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
      'SELECT * FROM questions WHERE "gameId" = $1',
      [gamePlayer.gameId]
    )
    const allQuestionsRaw = allQuestionsRawResult.rows

    // Get all solved questions for this player
    const allSolvedQuestionsResult = await pool.query(
      'SELECT * FROM "questionsSolved" WHERE "playerId" = $1',
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
