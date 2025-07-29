import { Request, Response } from 'express'
import { pool } from '../utils/PrismaInstance'
import { questionsInDbSchema, questionsInDbType } from '../schema/questionsInDB.schema'
import { findDuplicateContinue } from './tools'


export const saveQuestionsInDbController = async (req: Request<{}, {}, questionsInDbType[]>, res: Response) => {
  try {
    const user = res.locals.user.id

    for (const q of req.body) {
      questionsInDbSchema.parse(q);

      if(await findDuplicateContinue('questionDB', {question: q.question}, res))continue;

      await pool.query(
        'INSERT INTO "questionDB" (type, question, difficulty, category, correct_answer, incorrect_answers, extra_incorrect_answers, "user") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [q.type, q.question, q.difficulty, q.category, q.correct_answer, q.incorrect_answers, q.extra_incorrect_answers, user]
      );
    }

    return res.status(201).json({ message: 'Questions Saved Successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}
