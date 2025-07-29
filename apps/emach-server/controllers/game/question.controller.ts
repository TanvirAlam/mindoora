import { Request, Response } from 'express'
import { prisma } from '../../utils/PrismaInstance'
import { createQuestionSchema, createQuestionType, updateQuestionSchema, updateQuestionType } from '../../schema/game/question.schema'
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

    const newQuestion = await prisma.questions.create({
      data: {
        gameId,
        question,
        answer: +answer,
        options,
        timeLimit,
        qSource,
        qImage,
        qPoints,
        qTrophy
      }
    })
    return res.status(201).json({ message: 'Question created successfully', questionId: newQuestion.id })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const deleteQuestionController = async (req: Request, res: Response) => {
  try {
    const id = req.query?.id as string;
    if(missingParams({id}, res)) return;

    const getQuestion = await prisma.questions.findUnique({
      where: { id }
    })
    if(!getQuestion){
      return res.status(404).json({ message: 'Question Not Found' })
    }

    if(await userAccess('userGame', {id: getQuestion.gameId}, res) === null) return;

    await prisma.questions.delete({
      where: { id }
    })
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

    const allQuestion = await prisma.questions.findMany({
      where: { gameId }
    })

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

    const findQuestion = await prisma.questions.findUnique({
      where: { id }
    })
    if (!findQuestion){
      return res.status(404).json({ message: 'Question Not found' });
    }

    if(await userAccess('userGame', {id: findQuestion.gameId}, res) === null) return;

    const updateQuestion = await prisma.questions.update({
      where: {
        id
      },
      data: {
        question,
        answer: +answer,
        options,
        timeLimit,
        qSource,
        qImage,
        qPoints,
        qTrophy
      }
    })
    return res.status(201).json({ message: 'Question updated successfully', questionId: updateQuestion.id })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getOneQuestionController = async (req: Request, res: Response) => {
  try {

    const id = req.query?.id as string;
    if(missingParams({id}, res)) return;

    const getQuestion = await prisma.questions.findUnique({
      where: {id}
    })

    if (!getQuestion){
      return res.status(404).json({ message: 'Question Not Found' })
    }

    if(await userAccess('userGame', {id: getQuestion.gameId}, res) === null) return;

    return res.status(201).json({ message: 'Got Question Successfully', result: {question: getQuestion} })
  } catch (error) {
    return res.status(500).json(error)
  }
}
