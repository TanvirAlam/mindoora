import { Request, Response } from 'express'
import { pool } from '../utils/PrismaInstance'
import { findDuplicate, missingParams, userAccess } from './tools'
import {
  sendRequestSchema,
  sendRequestType,
  acceptRejectRequestSchema,
  acceptRejectRequestType
} from '../schema/friends.schema'

export const sendRequestController = async (req: Request<{}, {}, sendRequestType>, res: Response) => {
  try {
    const { friendId } = req.body
    sendRequestSchema.parse(req.body)
    const user = res.locals.user.id

    if(await findDuplicate('friends', { userId: user, friendId }, res))return;
    if(await findDuplicate('friends', { userId: friendId, friendId: user }, res))return;

    // Check if friend exists
    const checkFriendIdResult = await pool.query(
      'SELECT * FROM register WHERE id = $1',
      [friendId]
    )
    const checkFriendId = checkFriendIdResult.rows[0]

    if (!checkFriendId){
      return res.status(404).json({message: 'Friend Id Not Found'})
    }

    // Get user name
    const userResult = await pool.query(
      'SELECT name FROM "user" WHERE "registerId" = $1',
      [user]
    )
    const userName = userResult.rows[0].name

    // Create friend request
    await pool.query(
      'INSERT INTO friends ("userId", "friendId") VALUES ($1, $2)',
      [user, friendId]
    )

    // Create notification
    const notificationResult = await pool.query(
      'INSERT INTO notifications ("from", notification) VALUES ($1, $2) RETURNING id',
      [user, `${userName} wants to be a friend of you.`]
    )
    const notificationId = notificationResult.rows[0].id

    await pool.query(
      'INSERT INTO "NotificationRecipient" ("notificationId", "recipientId") VALUES ($1, $2)',
      [notificationId, checkFriendId.id]
    )

    return res.status(201).json({ message: 'Friend Request Send Successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const deleteFriendController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id
    const friendId = req.query?.friendId as string;

    if(missingParams({friendId}, res)) return;

    // Find friend relationship
    const checkFriendResult = await pool.query(
      'SELECT * FROM friends WHERE ("userId" = $1 AND "friendId" = $2) OR ("userId" = $2 AND "friendId" = $1) LIMIT 1',
      [user, friendId]
    )
    const checkFriend = checkFriendResult.rows[0]

    if (!checkFriend){
      return res.status(404).json({message: 'Friend Id Not Found'})
    }

    await pool.query(
      'DELETE FROM friends WHERE id = $1',
      [checkFriend.id]
    )

    return res.status(204).json({ message: 'Friend Request deleted successfully'})
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const acceptRequestController = async (req: Request<{}, {}, acceptRejectRequestType>, res: Response) => {
  try {
    const { userId } = req.body
    acceptRejectRequestSchema.parse(req.body)
    const user = res.locals.user.id

    // Find pending friend request
    const checkRequestResult = await pool.query(
      'SELECT * FROM friends WHERE "userId" = $1 AND "friendId" = $2 AND status = $3 LIMIT 1',
      [userId, user, 'REQUESTED']
    )
    const checkRequest = checkRequestResult.rows[0]

    if (!checkRequest){
      return res.status(404).json({message: 'Friend Request Not Found'})
    }

    await pool.query(
      'UPDATE friends SET status = $1 WHERE id = $2',
      ['ACCEPTED', checkRequest.id]
    )

    return res.status(201).json({ message: 'Friend Request Accepted Successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const rejectRequestController = async (req: Request<{}, {}, acceptRejectRequestType>, res: Response) => {
  try {
    const { userId } = req.body
    acceptRejectRequestSchema.parse(req.body)
    const user = res.locals.user.id

    // Find pending friend request
    const checkRequestResult = await pool.query(
      'SELECT * FROM friends WHERE "userId" = $1 AND "friendId" = $2 AND status = $3 LIMIT 1',
      [userId, user, 'REQUESTED']
    )
    const checkRequest = checkRequestResult.rows[0]

    if (!checkRequest){
      return res.status(404).json({message: 'Friend Request Not Found'})
    }

    await pool.query(
      'UPDATE friends SET status = $1 WHERE id = $2',
      ['REJECTED', checkRequest.id]
    )

    return res.status(201).json({ message: 'Friend Request Rejected Successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const friendStatusController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id
    const friendId = req.query?.friendId as string;

    if(user == friendId){
      return res.status(201).json({message: 'It is me', result: {status: 'ITSME'}})
    }

    // Check friend relationship
    const checkFriendResult = await pool.query(
      'SELECT * FROM friends WHERE ("userId" = $1 AND "friendId" = $2) OR ("userId" = $2 AND "friendId" = $1) LIMIT 1',
      [user, friendId]
    )
    const checkFriend = checkFriendResult.rows[0]

    if (!checkFriend){
      return res.status(404).json({message: 'Friend Id Not Found'})
    }

    const isApprover = checkFriend.friendId === user

    return res.status(201).json({ message: 'Friend Status Got Successfully', result:{status: checkFriend.status, isApprover} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const friendListController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id

    // Get accepted friends
    const friendListResult = await pool.query(
      'SELECT * FROM friends WHERE (("userId" = $1) OR ("friendId" = $1)) AND status = $2',
      [user, 'ACCEPTED']
    )
    const friendList = friendListResult.rows

    return res.status(200).json({ message: 'Got Friend List successfully', result: {friendList} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const mutualFriendController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id
    const friendId = req.query?.friendId as string;

    // Get friends related to both users
    const friendListUserResult = await pool.query(
      'SELECT * FROM friends WHERE (("userId" = $1) OR ("userId" = $2) OR ("friendId" = $1) OR ("friendId" = $2)) AND status = $3',
      [user, friendId, 'ACCEPTED']
    )
    const friendListUser = friendListUserResult.rows

    const mutualFriendsIncludingUser = Array.from(
      new Set(
        friendListUser.reduce(
          (acc: string[], { userId, friendId }: any) => [...acc, userId, friendId],
          [] as string[]
        )
      )
    );

    const mutualFriends = mutualFriendsIncludingUser.filter((id) => id !== user);

    return res.status(200).json({ message: 'Mutual Friends Got successfully', result: {mutualFriends} })
  } catch (error) {
    return res.status(500).json(error)
  }
}


export const pendingRequestsToUserController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id

    // Get pending requests to this user
    const pendingFriendListResult = await pool.query(
      'SELECT * FROM friends WHERE "friendId" = $1 AND status = $2',
      [user, 'REQUESTED']
    )
    const pendingFriendList = pendingFriendListResult.rows

    return res.status(200).json({ message: 'Got One Game successfully', result: {pendingFriendList} })
  } catch (error) {
    return res.status(500).json(error)
  }
}


export const pendingRequestsToFriendController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id

    // Get pending requests from this user
    const pendingFriendListResult = await pool.query(
      'SELECT * FROM friends WHERE "userId" = $1 AND status = $2',
      [user, 'REQUESTED']
    )
    const pendingFriendList = pendingFriendListResult.rows

    return res.status(200).json({ message: 'Got One Game successfully', result: {pendingFriendList} })
  } catch (error) {
    return res.status(500).json(error)
  }
}
