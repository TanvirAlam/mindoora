import { Request, Response } from 'express'
import { prisma } from '../utils/PrismaInstance'
import { questionsInDbSchema, questionsInDbType } from '../schema/questionsInDB.schema'
import { findDuplicateContinue } from './tools'


export const saveQuestionsInDbController = async (req: Request<{}, {}, questionsInDbType[]>, res: Response) => {
  try {
    const user = res.locals.user.id

    for (const q of req.body) {
      questionsInDbSchema.parse(q);

      if(await findDuplicateContinue('questionDB', {question: q.question}, res))continue;

      await prisma.questionDB.create({
        data: {
          type: q.type,
          question: q.question,
          difficulty: q.difficulty,
          category: q.category,
          correct_answer: q.correct_answer,
          incorrect_answers: q.incorrect_answers,
          extra_incorrect_answers: q.extra_incorrect_answers,
          user: user
        }
      });
    }

    return res.status(201).json({ message: 'Questions Saved Successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}
