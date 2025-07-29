import { Request, Response } from 'express'
import { prisma } from '../utils/PrismaInstance'
import { createSubscriptionType, createSucscriptionSchema } from '../schema/auth/subscription.schema'
import { findDuplicate } from './tools'

export const createSubscriptionController = async (req: Request<{}, {}, createSubscriptionType>, res: Response) => {
  try {
    const { email } = req.body
    const ipAdress = req.socket.remoteAddress
    createSucscriptionSchema.parse(req.body)

    if(await findDuplicate('subscription', { email }, res))return;

    await prisma.subscription.create({
      data: {
        email,
        ipAdress,
        isActive: true
      }
    })

    return res.status(201).json({ message: 'Subscription Added successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}
