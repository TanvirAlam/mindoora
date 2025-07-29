import { Request, Response } from 'express'
import { prisma } from '../utils/PrismaInstance'
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

    const checkFriendId = await prisma.register.findUnique({
      where: {id: friendId}
    })

    if (!checkFriendId){
      return res.status(404).json({message: 'Friend Id Not Found'})
    }

    const userName = (await prisma.user.findUnique({ where: { registerId: user }})).name

    await prisma.friends.create({
      data: {
        userId: user,
        friendId
      }
    })

    await prisma.notifications.create({
      data: {
        from: user,
        notification: `${userName} wants to be a friend of you.`,
        recipients: {
          create: {
            recipientId: checkFriendId.id
          }
        }
      }
    })

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

    const checkFriend = await prisma.friends.findFirst({
      where: {OR: [{userId: user, friendId}, {userId: friendId, friendId: user}]}
    })

    if (!checkFriend){
      return res.status(404).json({message: 'Friend Id Not Found'})
    }

    await prisma.friends.delete({
      where: {id: checkFriend.id}
    })

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

    const checkRequest = await prisma.friends.findFirst({
      where: {userId, friendId: user, status: 'REQUESTED'}
    })

    if (!checkRequest){
      return res.status(404).json({message: 'Friend Request Not Found'})
    }

    await prisma.friends.update({
      where: { id: checkRequest.id },
      data: {
        status: 'ACCEPTED'
      }
    })

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

    const checkRequest = await prisma.friends.findFirst({
      where: {userId, friendId: user, status: 'REQUESTED'}
    })

    if (!checkRequest){
      return res.status(404).json({message: 'Friend Request Not Found'})
    }

    await prisma.friends.update({
      where: { id: checkRequest.id },
      data: {
        status: 'REJECTED'
      }
    })

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

    const checkFriend = await prisma.friends.findFirst({
      where: {OR: [{userId: user, friendId}, {userId: friendId, friendId: user}]}
    })

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

    const friendList = await prisma.friends.findMany({
      where: {
        AND: [
          {
            OR: [
              { userId: user },
              { friendId: user },
            ]
          },
          { status: 'ACCEPTED' }
        ]
      }
    });

    return res.status(200).json({ message: 'Got Friend List successfully', result: {friendList} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const mutualFriendController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id
    const friendId = req.query?.friendId as string;

    const friendListUser = await prisma.friends.findMany({
      where: {
        AND: [
          {
            OR: [
              { userId: user },
              { userId: friendId },
              { friendId: user },
              { friendId },
            ]
          },
          { status: 'ACCEPTED' }
        ]
      }
    });

    const mutualFriendsIncludingUser = Array.from(
      new Set(
        friendListUser.reduce(
          (acc, { userId, friendId }) => [...acc, userId, friendId],
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

    const pendingFriendList = await prisma.friends.findMany({
      where: {friendId: user, status: 'REQUESTED' }
    });

    return res.status(200).json({ message: 'Got One Game successfully', result: {pendingFriendList} })
  } catch (error) {
    return res.status(500).json(error)
  }
}


export const pendingRequestsToFriendController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id

    const pendingFriendList = await prisma.friends.findMany({
      where: {userId: user, status: 'REQUESTED' }
    });

    return res.status(200).json({ message: 'Got One Game successfully', result: {pendingFriendList} })
  } catch (error) {
    return res.status(500).json(error)
  }
}
