import { Request, Response } from 'express'
import { notificationQueries, userQueries } from '../utils/query'
import { missingParams } from './tools'

export const getAllNotificationsController = async (req: Request, res: Response) => {
  try {
    const lastNotification = req.query?.lastNotification as string;
    if(missingParams({lastNotification}, res)) return;
    const lastNotificationNumber = parseInt(lastNotification);

    // Get notifications for this user
    const allNotifications = await notificationQueries.getNotificationsForUser(res.locals.user.id, lastNotificationNumber)

    if (!allNotifications || allNotifications.length === 0) {
      return res.status(404).json({ message: 'Notifications Not Found' })
    }

    let allNotificationsWithName = []

    for (let i = 0; i < allNotifications.length; i++) {
      // Get user name for each notification
      const fromUser = await userQueries.getUserByName(allNotifications[i].from)
      
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
