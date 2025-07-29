import { Request, Response } from 'express'
import { miscQueries } from '../utils/query'
import { gameExperienceSchema, gameExperienceType } from '../schema/gameExperience.schema'
import { findDuplicate } from './tools'


export const saveGameExperienceController = async (req: Request<{}, {}, gameExperienceType>, res: Response) => {
  try {
    const { roomId, totalQ, timeTaken, totalText } = req.body
    gameExperienceSchema.parse(req.body)

    if(await findDuplicate('gameExperience', { roomId }, res))return;

    const lavelOfFun = (timeTaken / (totalQ * 30)) + (totalText / 100)

    await miscQueries.saveGameExperience(roomId, totalQ, timeTaken, totalText, lavelOfFun)

    return res.status(201).json({ message: 'Game Experience Saved' })
  } catch (error) {
    console.error(error)
    return res.status(500).json(error)
  }
}
