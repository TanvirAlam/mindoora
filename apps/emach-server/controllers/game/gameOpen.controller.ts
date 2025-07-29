import { Request, Response } from 'express'
import { prisma } from '../../utils/PrismaInstance'
import { missingParams } from '../tools'


export const getOnePublicGameController = async (req: Request, res: Response) => {
  try {
    const id = req.query?.id as string;

    if(missingParams({id}, res)) return;


    const oneGame = await prisma.userGame.findUnique({
      where: { id }
    }
    )

    if(oneGame === null) return res.status(400).json({ message: 'Not Found Game'});


    const gameCreator = await prisma.user.findUnique({
      where: {registerId: oneGame?.user},
      select: {id: true, name: true, image: true}
    })


    const gameDetails = await prisma.userGameDetails.findFirst({
      where: {gameId: oneGame?.id},
      select: {
        imgUrl: true,
        description: true,
        category: true,
        theme: true,
        keyWords: true
      }
    })

    const nQuestions = await prisma.questions.count({
      where: {gameId: oneGame?.id},
    })

    const gameScores = await prisma.userGameScore.findMany({
      where: {gameId: oneGame?.id},
      select: {score: true}
    })

    const averageScore = gameScores.length > 0 ? gameScores.reduce((acc, gs)=> acc + gs.score, 0)/gameScores.length : 0;

    const gameRooms = await prisma.gameRooms.findMany({
      where: {gameId: oneGame?.id},
      include: {
        _count: {
          select: { gamePlayers: true }
        }
       }
    })

    const nGameRooms = gameRooms.length

    const totalPlayers = gameRooms.reduce((acc, gr)=> acc + gr._count.gamePlayers, 0);


    const gameAllDetails = {
      ...oneGame,
      ...gameDetails,
      userId: gameCreator?.id,
      name: gameCreator?.name,
      image: gameCreator?.image,
      nQuestions,
      nGameRooms,
      averageScore,
      totalPlayers,
      registerId: oneGame?.user
    }

    delete gameAllDetails.createdAt;



    return res.status(201).json({ message: 'Got One Game successfully', result: {...gameAllDetails} })
  } catch (error) {
    return res.status(500).json(error)
  }
}
