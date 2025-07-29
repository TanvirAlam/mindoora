import { Request, Response } from 'express'
import { prisma } from '../utils/PrismaInstance'
import { missingParams } from './tools'

export const getAllNotificationsController = async (req: Request, res: Response) => {
  try {
    const lastNotification = req.query?.lastNotification as string;
    if(missingParams({lastNotification}, res)) return;
    const lastNotificationNumber = parseInt(lastNotification);

    const allNotifications = await prisma.notifications.findMany({
      where: {
        recipients: {
          some: {
            recipientId: res.locals.user.id
          }
        }
      },
      select: {
        from: true,
        notification: true,
      },
      skip: lastNotificationNumber,
      take: 25
    })

    if (!allNotifications) {
      return res.status(404).json({ message: 'Notifications Not Found' })
    }

    let allNotificationsWithName = []

    for (let i = 0; i < allNotifications.length; i++) {
      const fromUser = await prisma.user.findUnique({
        where: { id: allNotifications[i].from }
      });
      if (fromUser) {
        allNotificationsWithName.push({
          ...allNotifications[i],
          name: fromUser.name
        })
      } else {
        allNotificationsWithName.push(allNotifications[i])
      }
    }

    res.setHeader('Cache-Control', 'public, s-maxage=90000');
    return res.status(201).json({ message: 'Got All Notifications Successfully', result: allNotificationsWithName })
  } catch (error) {
    return res.status(500).json(error)
  }
}
