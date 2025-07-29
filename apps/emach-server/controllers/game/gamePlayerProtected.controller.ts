import { Request, Response } from 'express'
import { prisma } from '../../utils/PrismaInstance'
import { missingParams, userAccess } from '../tools';
import { updateGamePlayerStatusType, updateGamePlayerStatusSchema, updateConfirmAllGamePlayerType, updateConfirmAllGamePlayerSchema } from '../../schema/game/gamePlayers.schema';

export const deleteGamePlayerController = async (req: Request, res: Response) => {
  try {
    const id = req.query?.id as string;
    if (missingParams({ id }, res)) return;
    if (await userAccess('gameRooms', {
      gamePlayers: { some: { id } }, status: {
        in: ['live', 'created']
      }
    }, res) === null) return;

    await prisma.gamePlayers.delete({
      where: { id },
    })
    return res.status(204).json({ message: 'Game Player deleted successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllPlayersOfARoomController = async (req: Request, res: Response) => {
  try {
    let roomId = req.query?.roomId as string;
    if (missingParams({ roomId }, res)) return;
    if (await userAccess('gameRooms', { id: roomId }, res) === null) return;

    const allPlayers = await prisma.gamePlayers.findMany({
      where: { roomId }
    })

    return res.status(201).json({ message: 'Got all Players successfully', result: { allPlayers } })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const updateGamePlayerStatusController = async (
  req: Request<{}, {}, updateGamePlayerStatusType>,
  res: Response
) => {
  try {
    const { id, isApproved } = req.body
    updateGamePlayerStatusSchema.parse(req.body)
    if (await userAccess('gameRooms', {
      gamePlayers: { some: { id } }, status: {
        in: ['live', 'created']
      }
    }, res) === null) return;

    const updatedPlayer = await prisma.gamePlayers.update({
      where: { id },
      data: {
        isApproved
      }
    })

    const allPlayer = await prisma.gamePlayers.findMany({
      where: {
        roomId: updatedPlayer.roomId
      }
    })

    const roomStatus = await prisma.gameRooms.findUnique({
      where: { id: updatedPlayer.roomId }
    })

    req.io.to(roomStatus.id).emit('players_response', allPlayer)
    req.io.to(roomStatus.id).emit('game_status', { id: roomStatus.id, status: roomStatus.status })

    return res.status(201).json({ message: 'Game player Status updated successfully.', updatedPlayer })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const updateConfirmAllGamePlayerController = async (
  req: Request<{}, {}, updateConfirmAllGamePlayerType>,
  res: Response
) => {
  try {
    const currentDate = new Date();
    const { roomId } = req.body
    updateConfirmAllGamePlayerSchema.parse(req.body)

    if (await userAccess('gameRooms', {id: roomId, status: {
      in: ['created', 'live']
    }, expiredAt: {
      gt: currentDate
    } }, res) === null) return;

    await prisma.gamePlayers.updateMany({
      where: {
        roomId
      },
      data: {
        isApproved: true
      }
    });

    const allPlayer = await prisma.gamePlayers.findMany({
      where: {
        roomId: roomId
      }
    })

    req.io.to(roomId).emit('players_response', allPlayer)

    return res.status(201).json({ message: 'Game player Status updated successfully.', allPlayer })
  } catch (error) {
    return res.status(500).json(error)
  }
}
