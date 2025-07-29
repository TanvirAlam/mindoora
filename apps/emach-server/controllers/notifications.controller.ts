import { Request, Response } from 'express'
import { pool } from '../utils/PrismaInstance'
import { missingParams } from './tools'

export const getAllNotificationsController = async (req: Request, res: Response) => {
  try {
    const lastNotification = req.query?.lastNotification as string;
    if(missingParams({lastNotification}, res)) return;
    const lastNotificationNumber = parseInt(lastNotification);

    // Get notifications for this user
    const allNotificationsResult = await pool.query(
      `SELECT n."from", n.notification 
       FROM notifications n 
       JOIN "NotificationRecipient" nr ON n.id = nr."notificationId" 
       WHERE nr."recipientId" = $1 
       OFFSET $2 LIMIT 25`,
      [res.locals.user.id, lastNotificationNumber]
    )
    const allNotifications = allNotificationsResult.rows

    if (!allNotifications || allNotifications.length === 0) {
      return res.status(404).json({ message: 'Notifications Not Found' })
    }

    let allNotificationsWithName = []

    for (let i = 0; i < allNotifications.length; i++) {
      // Get user name for each notification
      const fromUserResult = await pool.query(
        'SELECT name FROM "user" WHERE id = $1',
        [allNotifications[i].from]
      )
      const fromUser = fromUserResult.rows[0]
      
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
