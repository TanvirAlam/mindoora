import { Request, Response } from 'express'
import { prisma } from '../../utils/PrismaInstance'
import { createGamePlayersSchema, createGamePlayersType } from '../../schema/game/gamePlayers.schema'
import { missingParams } from '../tools'

export const createGamePlayerController = async (req: Request<{}, {}, createGamePlayersType>, res: Response) => {
  try {
    const { inviteCode, name } = req.body
    createGamePlayersSchema.parse(req.body)

    const isLiveRoom = await prisma.gameRooms.findFirst({
      where: { inviteCode, status: {
        in: ['live', 'created']
    } }
    })
    if (!isLiveRoom) return res.status(404).json({ message: 'Room not found' });


    const userGame = await prisma.userGame.findFirst({
      where: { id: isLiveRoom.gameId }
    })

    let player = await prisma.gamePlayers.findFirst({
      where: { roomId: isLiveRoom.id, name }
    })

    const numberOfApprovedPlayers = await prisma.gamePlayers.findMany({
      where: {
        roomId: isLiveRoom.id,
        isApproved: true
      }
    })

    if (!player) {
      if (numberOfApprovedPlayers.length < userGame.nPlayer) {
        player = await prisma.gamePlayers.create({
          data: {
            roomId: isLiveRoom.id,
            name,
            role: 'guest',
            isApproved: false
          }
        })
      } else {
        return res.status(404).json({ message: 'Room Capacity is full' })
      }
    }

    const allPlayer = await prisma.gamePlayers.findMany({
      where: {
        roomId: isLiveRoom.id
      }
    })

    req.io.to(isLiveRoom.id).emit('players_response', allPlayer)

    return res.status(201).json({ message: 'Game player Created.', player, gameId: userGame.id, allPlayer })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllPlayersOfARoomController = async (req: Request, res: Response) => {
  try {
    let roomId = req.query?.roomId as string;
    let playerId = req.query?.playerId as string;

    if(missingParams({roomId}, res))return;
    if(missingParams({playerId}, res))return;

    const isLiveRoom = await prisma.gameRooms.findUnique({
      where: {
        id: roomId,
        status: {
          not: 'closed'
        }
      }
    });

    if(!isLiveRoom){
      return res.status(404).json({ message: 'Game Room Not Found' })
    }

    const isApprovedPlayer = await prisma.gamePlayers.findFirst({
      where: {id: playerId, isApproved: true}
    })

    if(!isApprovedPlayer){
      return res.status(404).json({ message: 'Game Player is Not Approved' })
    }

    const allPlayers = await prisma.gamePlayers.findMany({
      where: {roomId, isApproved: true}
    })

    return res.status(201).json({ message: 'Got all Players successfully', result: {allPlayers} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getResultOfARoomController = async (req: Request, res: Response) => {
  try {
    let roomId = req.query?.roomId as string;
    let playerId = req.query?.playerId as string;
    if(missingParams({roomId}, res))return;
    if(missingParams({playerId}, res))return;

    const userAccess = await prisma.gamePlayers.findFirst({
      where: {id: playerId, isApproved: true}
    })

    if(!userAccess){
      return res.status(404).json({ message: 'Approved Game Player Not Found' })
    }

    const isLiveRoom = await prisma.gameRooms.findUnique({
      where: {
        id: roomId,
        status: 'finished'}
      });

    if(!isLiveRoom){
      return res.status(404).json({ message: 'Game Room Not Found' })
    }

    const players = await prisma.gamePlayers.findMany({
      where: { roomId, isApproved: true }
    });

    let result = [];

    for (const player of players) {
      const questionSolved = await prisma.questionsSolved.findMany({
        where: { playerId: player.id }
      });

      const nQuestionSolved = questionSolved.length;
      const rightAnswered = questionSolved.filter((e) => e.isRight === true).length;
      const points = questionSolved.reduce((sum, q) => sum + q.point, 0);

      result.push({
        playerName: player.name,
        image: player.imgUrl,
        nQuestionSolved,
        rightAnswered,
        points
      });
    }

    result.sort((a, b) => b.points - a.points);

    return res.status(201).json({ message: 'Got Result of a game room successfully', result })
  } catch (error) {
    return res.status(500).json(error)
  }
}
