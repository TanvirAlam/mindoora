import { Request, Response } from 'express'
import { pool } from '../utils/PrismaInstance'
import { findDuplicate } from './tools'
import { createFeedbackSchema, createFeedbackType, createGameScoreSchema, createGameScoreType } from '../schema/feedback.schema'

export const createFeedbackController = async (req: Request<{}, {}, createFeedbackType>, res: Response) => {
  try {
    const { score, feedback } = req.body
    createFeedbackSchema.parse(req.body)
    const user = res.locals.user.id

    if(await findDuplicate('feedback', { userId: user, isActive: true }, res))return;

    await pool.query(
      'INSERT INTO feedback (score, feedback, "isActive", "userId") VALUES ($1, $2, $3, $4)',
      [+score, feedback, true, user]
    )

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
    const userAccessResult = await pool.query(
      'SELECT * FROM "gamePlayers" WHERE id = $1 AND "isApproved" = true LIMIT 1',
      [playerId]
    )
    const userAccess = userAccessResult.rows[0]

    if(!userAccess){
      return res.status(404).json({ message: 'Approved Game Player Not Found' })
    }

    // Find game room with the player that is not closed
    const liveRoomResult = await pool.query(
      `SELECT gr.* FROM "gameRooms" gr 
       JOIN "gamePlayers" gp ON gr.id = gp."roomId" 
       WHERE gr."gameId" = $1 AND gp.id = $2 AND gr.status != 'closed' 
       LIMIT 1`,
      [gameId, playerId]
    )
    const isLiveRoom = liveRoomResult.rows[0]

    if(!isLiveRoom){
      return res.status(404).json({ message: 'Game Room Not Found' })
    }

    if(await findDuplicate('userGameScore', { playerId, gameId }, res))return;

    await pool.query(
      'INSERT INTO "userGameScore" (score, "playerId", "gameId") VALUES ($1, $2, $3)',
      [+score, playerId, gameId]
    )

    return res.status(201).json({ message: 'Score Added successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}
