import { Request, Response } from 'express'
import { pool } from '../utils/PrismaInstance'
import { gameExperienceSchema, gameExperienceType } from '../schema/gameExperience.schema'
import { findDuplicate } from './tools'


export const saveGameExperienceController = async (req: Request<{}, {}, gameExperienceType>, res: Response) => {
  try {
    const { roomId, totalQ, timeTaken, totalText } = req.body
    gameExperienceSchema.parse(req.body)

    if(await findDuplicate('gameExperience', { roomId }, res))return;

    const lavelOfFun = (timeTaken / (totalQ * 30)) + (totalText / 100)

    await pool.query(
      'INSERT INTO "gameExperience" ("roomId", "totalQ", "timeTaken", "totalText", "lavelOfFun") VALUES ($1, $2, $3, $4, $5)',
      [roomId, totalQ, timeTaken, totalText, lavelOfFun]
    )

    return res.status(201).json({ message: 'Game Experience Saved' })
  } catch (error) {
    console.error(error)
    return res.status(500).json(error)
  }
}
