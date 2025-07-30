import { Request, Response } from 'express'
import { miscQueries } from '../utils/query'
import { questionsInDbSchema, questionsInDbType } from '../db/schemas/questionsInDB.schema'
import { findDuplicateContinue } from './tools'


export const saveQuestionsInDbController = async (req: Request<{}, {}, questionsInDbType[]>, res: Response) => {
  try {
    const user = res.locals.user.id

    for (const q of req.body) {
      questionsInDbSchema.parse(q);

      if(await findDuplicateContinue('questionDB', {question: q.question}, res))continue;

      await miscQueries.saveQuestionInDB(q.type, q.question, q.difficulty, q.category, q.correct_answer, q.incorrect_answers, q.extra_incorrect_answers, user);
    }

    return res.status(201).json({ message: 'Questions Saved Successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}
