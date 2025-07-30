import { Request, Response } from 'express'
import { feedbackQueries, gamePlayerQueries } from '../utils/query'
import { findDuplicate } from './tools'
import { createFeedbackSchema, createFeedbackType, createGameScoreSchema, createGameScoreType } from '../db/schemas/feedback.schema'

export const createFeedbackController = async (req: Request<{}, {}, createFeedbackType>, res: Response) => {
  try {
    const { score, feedback } = req.body
    createFeedbackSchema.parse(req.body)
    const user = res.locals.user.id

    if(await findDuplicate('feedback', { userId: user, isActive: true }, res))return;

    await feedbackQueries.createFeedback(+score, feedback, user)

    return res.status(201).json({ message: 'Feedback Added successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const createGameScoreController = async (req: Request<{}, {}, createGameScoreType>, res: Response) => {
  try {
    const { score, gameId, playerId } = req.body
    createGameScoreSchema.parse(req.body)

    // Check if player is approved
    const userAccess = await gamePlayerQueries.getApprovedGamePlayer(playerId)

    if(!userAccess){
      return res.status(404).json({ message: 'Approved Game Player Not Found' })
    }

    // Find game room with the player that is not closed
    const isLiveRoom = await gamePlayerQueries.findGamePlayerInLiveRoom(gameId, playerId)

    if(!isLiveRoom){
      return res.status(404).json({ message: 'Game Room Not Found' })
    }

    if(await findDuplicate('userGameScore', { playerId, gameId }, res))return;

    await feedbackQueries.createGameScore(+score, playerId, gameId)

    return res.status(201).json({ message: 'Score Added successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}
