import { Request, Response } from 'express'
import { pool } from '../utils/PrismaInstance'
import { createSubscriptionType, createSucscriptionSchema } from '../schema/auth/subscription.schema'
import { findDuplicate } from './tools'

export const createSubscriptionController = async (req: Request<{}, {}, createSubscriptionType>, res: Response) => {
  try {
    const { email } = req.body
    const ipAdress = req.socket.remoteAddress
    createSucscriptionSchema.parse(req.body)

    if(await findDuplicate('subscription', { email }, res))return;

    await pool.query(
      'INSERT INTO subscription (email, "ipAdress", "isActive") VALUES ($1, $2, $3)',
      [email, ipAdress, true]
    )

    return res.status(201).json({ message: 'Subscription Added successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}
