import { Request, Response } from 'express'
import { prisma } from '../utils/PrismaInstance'
import { findDuplicate } from './tools'
import { createFeedbackSchema, createFeedbackType, createGameScoreSchema, createGameScoreType } from '../schema/feedback.schema'

export const createFeedbackController = async (req: Request<{}, {}, createFeedbackType>, res: Response) => {
  try {
    const { score, feedback } = req.body
    createFeedbackSchema.parse(req.body)
    const user = res.locals.user.id

    if(await findDuplicate('feedback', { userId: user, isActive: true }, res))return;

    await prisma.feedback.create({
      data: {
        score: +score,
        feedback,
        isActive: true,
        userId: user
      }
    })

    return res.status(201).json({ message: 'Feedback Added successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const createGameScoreController = async (req: Request<{}, {}, createGameScoreType>, res: Response) => {
  try {
    const { score, gameId, playerId } = req.body
    createGameScoreSchema.parse(req.body)

    const userAccess = await prisma.gamePlayers.findFirst({
      where: {id: playerId, isApproved: true}
    })

    if(!userAccess){
      return res.status(404).json({ message: 'Approved Game Player Not Found' })
    }

    const isLiveRoom = await prisma.gameRooms.findFirst({
      where: {
        gameId,
        gamePlayers: {
          some: {
            id: playerId
          }
        },
        status: {
          not: 'closed'
        }
      }
    });    

    if(!isLiveRoom){
      return res.status(404).json({ message: 'Game Room Not Found' })
    }

    if(await findDuplicate('userGameScore', { playerId, gameId }, res))return;

    await prisma.userGameScore.create({
      data: {
        score: +score,
        playerId,
        gameId
      }
    })

    return res.status(201).json({ message: 'Score Added successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}
