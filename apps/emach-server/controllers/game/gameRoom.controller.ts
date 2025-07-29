import { Request, Response } from 'express'
import { prisma } from '../../utils/PrismaInstance'
import { createGameRoomSchema, createGameRoomType, updateGameRoomStatusSchema, updateGameRoomStatusType } from '../../schema/game/gameRooms.schema'
import { findDuplicate, isExpired, missingParams, userAccess } from '../tools'
import { generateRandomCode } from '../../utils/game/gameRoom'

export const createGameRoomController = async (req: Request<{}, {}, createGameRoomType>, res: Response) => {
  try {
    const { gameId } = req.body
    createGameRoomSchema.parse(req.body)
    const user = res.locals.user.id

    let roomInfo = await prisma.gameRooms.findFirst({
      where: {
          gameId,
          user,
          status: {
            in: ['live', 'created']
        }
      }
  });

  const isGameRoomExpired = roomInfo ? isExpired(roomInfo.expiredAt) : true;

    const userInfo = await prisma.user.findUnique({
      where: { registerId: user }
    })

    if (isGameRoomExpired) {
      let inviteCode
      let duplicateInviteCode

      do {
        inviteCode = generateRandomCode()
        duplicateInviteCode = await findDuplicate('gameRooms', { inviteCode, status: {
          in: ['live', 'created']
      }  }, res)
      } while (duplicateInviteCode)

      const now = new Date();

      roomInfo = await prisma.gameRooms.create({
        data: {
            gameId,
            status: 'created',
            inviteCode,
            user,
            expiredAt: new Date(now.setHours(now.getHours() + 1))
        }
    });

      await prisma.gamePlayers.create({
        data: {
          roomId: roomInfo.id,
          name: userInfo.name,
          imgUrl: userInfo.image,
          role: 'admin',
          isApproved: true
        }
      })
    }

      const allPlayers = await prisma.gamePlayers.findMany({
        where: {
          roomId: roomInfo.id
        }
      })

      req.io.to(roomInfo.id).emit('players_response', allPlayers)
      return res
        .status(201)
        .json({
          message: 'Game Room Created successfully',
          roomId: roomInfo.id,
          inviteCode: roomInfo.inviteCode,
          name: userInfo.name,
          allPlayers
        })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const deleteGameRoomController = async (req: Request, res: Response) => {
  try {
    const id = req.query?.id as string;
    if(missingParams({id}, res))return;
    if(await userAccess('gameRooms', {id}, res) === null) return;

    await prisma.gameRooms.delete({
      where: { id },
    })
    return res.status(204).json({ message: 'Game Room deleted successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllGameRoomByStatusController = async (req: Request, res: Response) => {
  try {
    const validStatuses: ('live' | 'finished' | 'closed' | 'created')[] = ['live', 'finished', 'closed', 'created'];
    const status: 'live' | 'finished' | 'closed' | undefined = validStatuses.includes(req.query.status as 'live' | 'finished' | 'closed') ? req.query.status as 'live' | 'finished' | 'closed' : undefined;

    if(missingParams({status}, res))return;

    const gameRoom = await userAccess('gameRooms', {status}, res);
    if(gameRoom === null)return;
    const gameRooms = Array.isArray(gameRoom)? gameRoom: [gameRoom]

    return res.status(201).json({ message: `Got All ${status} Game Room successfully`, result: {gameRooms: gameRooms} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getOneGameRoomController = async (req: Request, res: Response) => {
  try {
    let id = req.query?.id as string;
    if(missingParams({id}, res))return;

    const oneGameRoom = await userAccess('gameRooms', {id}, res);
    if(oneGameRoom === null)return;

    return res.status(201).json({ message: 'Got One Game Room successfully', result: {gameRoom: oneGameRoom} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const updateGameRoomStatusController = async (req: Request<{}, {}, updateGameRoomStatusType>, res: Response) => {
  try {

    const {
      id,
      status
    } = req.body
    updateGameRoomStatusSchema.parse(req.body)
    if(await userAccess('gameRooms', {id}, res) === null)return;

    const gameRoom = await prisma.gameRooms.update({
      where: {id},
      data: {
        status
      }
    })

    req.io.to(gameRoom.id).emit('game_status', {id: gameRoom.id, status: gameRoom.status})
    return res.status(201).json({ message: `Game Room Status Updated successfully`, result: {gameRoom} })
  } catch (error) {
    return res.status(500).json(error)
  }
}
