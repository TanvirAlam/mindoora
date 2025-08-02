import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { createQuestionSchema, createQuestionType, updateQuestionSchema, updateQuestionType } from '../../db/schemas/game/question.schema'
import {findDuplicate, missingParams, userAccess} from '../tools'

export const createQuestionController = async (req: Request<{}, {}, createQuestionType>, res: Response) => {
  try {
    const {
      gameId,
      question,
      answer,
      options,
      timeLimit,
      qSource,
      qImage,
      qPoints,
      qTrophy
    } = req.body
    createQuestionSchema.parse(req.body)

    if(await userAccess('userGame', { id: gameId }, res) === null) return;
    if(await findDuplicate( 'questions', { gameId, question}, res)) return;

    const newQuestionResult = await pool.query(
      'INSERT INTO "Questions" ("gameId", question, answer, options, "timeLimit", "qSource", "qImage", "qPoints", "qTrophy") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [gameId, question, +answer, options, timeLimit, qSource, qImage, qPoints, qTrophy]
    )
    const newQuestion = newQuestionResult.rows[0]
    return res.status(201).json({ message: 'Question created successfully', questionId: newQuestion.id })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const deleteQuestionController = async (req: Request, res: Response) => {
  try {
    const id = req.query?.id as string;
    if(missingParams({id}, res)) return;

    const getQuestionResult = await pool.query(
      'SELECT * FROM "Questions" WHERE id = $1',
      [id]
    )
    const getQuestion = getQuestionResult.rows[0]
    if(!getQuestion){
      return res.status(404).json({ message: 'Question Not Found' })
    }

    if(await userAccess('userGame', {id: getQuestion.gameId}, res) === null) return;

    await pool.query(
      'DELETE FROM "Questions" WHERE id = $1',
      [id]
    )
    return res.status(204).json({ message: 'Question deleted successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllQuestionController = async (req: Request, res: Response) => {
  try {
    const gameId = req.query?.gameId as string;

    if(missingParams({gameId}, res)) return;
    if(await userAccess('userGame', {id: gameId}, res) === null) return;

    const allQuestionResult = await pool.query(
      'SELECT * FROM "Questions" WHERE "gameId" = $1',
      [gameId]
    )
    const allQuestion = allQuestionResult.rows

    if (allQuestion.length === 0) {
      return res.status(404).json({ message: 'Questions Not Found' })
    }

    return res.status(201).json({ message: 'Got All Questions Successfully', result: {questions: allQuestion} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const updateQuestionController = async (req: Request<{}, {}, updateQuestionType>, res: Response) => {
  try {
    const {
      id,
      question,
      answer,
      options,
      timeLimit,
      qSource,
      qImage,
      qPoints,
      qTrophy
    } = req.body
    updateQuestionSchema.parse(req.body)

    const findQuestionResult = await pool.query(
      'SELECT * FROM "Questions" WHERE id = $1',
      [id]
    )
    const findQuestion = findQuestionResult.rows[0]
    if (!findQuestion){
      return res.status(404).json({ message: 'Question Not found' });
    }

    if(await userAccess('userGame', {id: findQuestion.gameId}, res) === null) return;

    const updateQuestionResult = await pool.query(
      'UPDATE "Questions" SET question = $1, answer = $2, options = $3, "timeLimit" = $4, "qSource" = $5, "qImage" = $6, "qPoints" = $7, "qTrophy" = $8 WHERE id = $9 RETURNING *',
      [question, +answer, options, timeLimit, qSource, qImage, qPoints, qTrophy, id]
    )
    const updateQuestion = updateQuestionResult.rows[0]
    return res.status(201).json({ message: 'Question updated successfully', questionId: updateQuestion.id })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getOneQuestionController = async (req: Request, res: Response) => {
  try {

    const id = req.query?.id as string;
    if(missingParams({id}, res)) return;

    const getQuestionResult = await pool.query(
      'SELECT * FROM "Questions" WHERE id = $1',
      [id]
    )
    const getQuestion = getQuestionResult.rows[0]

    if (!getQuestion){
      return res.status(404).json({ message: 'Question Not Found' })
    }

    if(await userAccess('userGame', {id: getQuestion.gameId}, res) === null) return;

    return res.status(201).json({ message: 'Got Question Successfully', result: {question: getQuestion} })
  } catch (error) {
    return res.status(500).json(error)
  }
}
