import { Request, Response } from 'express'
import { prisma } from '../../utils/PrismaInstance'
import { createUserGameSchema, createUserGameType, updateUserGameSchema, updateUserGameType } from '../../schema/game/userGame.schema'
import { findDuplicate, missingParams, userAccess } from '../tools'

export const createUserGameController = async (req: Request<{}, {}, createUserGameType>, res: Response) => {
  try {
    const { title, language, nPlayer } = req.body
    createUserGameSchema.parse(req.body)
    const user = res.locals.user.id

    if (await findDuplicate('userGame', { title, user }, res)) return;

    const game = await prisma.userGame.create({
      data: {
        title,
        language,
        nPlayer: +nPlayer,
        user
      }
    })

    const userName = (await prisma.user.findUnique({ where: { registerId: user }})).name

    const allUsers = await prisma.register.findMany({
      where: {
        NOT: {
          id: user
        }
      },
      select: {
        id: true
      }
    })

    const arrayOfIds = allUsers.map(obj => obj.id);

    for (const i of arrayOfIds) {
      await prisma.notifications.create({
        data: {
          from: user,
          notification: `${userName} has created a new game: ${title}`,
          recipients: {
            create: {
              recipientId: i
            }
          }
        }
      })
    }

    req.io.emit('new_game_notification', { from: user, notification: `${userName} has created a new game: ${title}`, name: userName })
    return res.status(201).json({ message: 'Game created successfully', gameId: game.id })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const deleteUserGameController = async (req: Request, res: Response) => {
  try {
    const id = req.query?.id as string;

    if(missingParams({id}, res)) return;
    if(await userAccess('userGame', {id}, res) === null) return;

    const game = await prisma.userGame.delete({
      where: { id },
    })
    return res.status(204).json({ message: 'Game deleted successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllGameController = async (req: Request, res: Response) => {
  try {
    const allGame = await userAccess('userGame', {}, res);
    if(allGame === null)return;
    const allGames = Array.isArray(allGame) ? allGame : [allGame];

    const myGames = await Promise.all(
      allGames.map(async (g) => {
        const [gameDetails, user] = await Promise.all([
          prisma.userGameDetails.findUnique({ where: { gameId: g.id } }),
          prisma.user.findFirst({ where: { registerId: g.user } })
        ]);

        const gameRooms = await prisma.gameRooms.findMany({
          where: {gameId: g.id}
        })
        const nRoomsCreated = gameRooms.length

        const questions = await prisma.questions.findMany({
          where: {gameId: g.id}
        })
        const nQuestions = questions.length

        const gameStars = await prisma.userGameScore.findMany({
          where: {gameId: g.id}
        })
        const nReviews = gameStars.length
        const averageStars = nReviews > 0 ? gameStars.reduce((acc, gs)=> acc + gs.score, 0)/nReviews : 0;


        return {
          ...g,
          imgUrl: gameDetails?.imgUrl ?? null,
          author: user?.name ?? 'anonymous',
          averageStars,
          nReviews,
          nRoomsCreated,
          nQuestions
        };
      })
    );

    return res.status(200).json({ message: 'Got All Game Successfully', result: {games: myGames} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllOfAGameController = async (req: Request, res: Response) => {
  try {
    let id = req.query?.id as string;
    const title = req.query?.title as string;

    if(missingParams({id, title}, res)) return;

    const whereCondition = id ? { id } : { title }

    const oneGame = await prisma.userGame.findFirst({
      where: {
        ...whereCondition,
        userGDetails: {
          some: {
            isPublic: true
          }
        }
      },
    })

    if (!oneGame) {
      return res.status(404).json({ message: 'Not Found' })
    }

    const gameDetails = await prisma.userGameDetails.findFirst({
      where: {gameId: oneGame.id}
    })

    const questions = await prisma.questions.findMany({
      where: {gameId: oneGame.id}
    })

    return res.status(200).json({
      message: 'Got All of A Game successfully',
      result: {userGame: oneGame, gameDetails, questions}
    })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getOneGameController = async (req: Request, res: Response) => {
  try {
    const id = req.query?.id as string;
    const title = req.query?.title as string;

    if(missingParams({id, title}, res)) return;
    const oneGame = await userAccess('userGame', id?{ id }:{ title }, res);
    if(oneGame === null) return;

    return res.status(200).json({ message: 'Got One Game successfully', result: {games: oneGame} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const updateUserGameController = async (req: Request<{}, {}, updateUserGameType>, res: Response) => {
  try {
    const {
      id,
      title,
      language,
      nPlayer
    } = req.body
    updateUserGameSchema.parse(req.body)

    if(await userAccess('userGame', {id}, res) === null) return;

    const game = await prisma.userGame.update({
      where: { id: id },
      data: {
        title,
        language,
        nPlayer: +nPlayer
      }
    })
    return res.status(201).json({ message: 'Game updated successfully', gameId: game.id })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllPublicGameController = async (req: Request, res: Response) => {
  try {

    const allPublicGames = await prisma.userGame.findMany({
      where: {
        userGDetails: {
          some: {
            isPublic: true
          }
        }
      }
    })

    const myGames = await Promise.all(
      allPublicGames.map(async (g) => {
        const [gameDetails, user] = await Promise.all([
          prisma.userGameDetails.findUnique({ where: { gameId: g.id } }),
          prisma.user.findFirst({ where: { registerId: g.user } })
        ]);

        const gameRooms = await prisma.gameRooms.findMany({
          where: {gameId: g.id}
        })
        const nRoomsCreated = gameRooms.length

        const questions = await prisma.questions.findMany({
          where: {gameId: g.id}
        })
        const nQuestions = questions.length

        const gameStars = await prisma.userGameScore.findMany({
          where: {gameId: g.id}
        })
        const nReviews = gameStars.length
        const averageStars = nReviews > 0 ? gameStars.reduce((acc, gs)=> acc + gs.score, 0)/nReviews : 0;

        return {
          ...g,
          imgUrl: gameDetails?.imgUrl ?? null,
          author: user?.name ?? 'anonymous',
          averageStars,
          nReviews,
          nRoomsCreated,
          nQuestions
        };
      })
    );

    return res.status(200).json({ message: 'Got All Public Games Successfully', result: {games: myGames} })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllPublicGameV2Controller = async (req: Request, res: Response) => {
  try {
    const lastGame = req.query?.lastGame as string;
    const category = req.query?.category as string;

    if(missingParams({lastGame}, res)) return;
    const lastGameNumber = parseInt(lastGame);

    const whereClause = category ? { category: category, isPublic: true } : { isPublic: true };

    const allPublicGames = await prisma.userGame.findMany({
      where: {
        userGDetails: {
          some: whereClause
        }
      },
      orderBy: {createdAt: 'asc'},
      skip: lastGameNumber,
      take: 10
    })

    const myGames = await Promise.all(
      allPublicGames.map(async (g) => {
        const [gameDetails, user] = await Promise.all([
          prisma.userGameDetails.findUnique({ where: { gameId: g.id } }),
          prisma.user.findFirst({ where: { registerId: g.user } })
        ]);

        const gameRooms = await prisma.gameRooms.findMany({
          where: {gameId: g.id}
        })
        const nRoomsCreated = gameRooms.length

        const questions = await prisma.questions.findMany({
          where: {gameId: g.id}
        })
        const nQuestions = questions.length

        const gameStars = await prisma.userGameScore.findMany({
          where: {gameId: g.id}
        })
        const nReviews = gameStars.length
        const averageStars = nReviews > 0 ? gameStars.reduce((acc, gs)=> acc + gs.score, 0)/nReviews : 0;

        return {
          ...g,
          imgUrl: gameDetails?.imgUrl ?? null,
          author: user?.name ?? 'anonymous',
          averageStars,
          nReviews,
          nRoomsCreated,
          nQuestions,
          category: gameDetails?.category
        };
      })
    );

    res.setHeader('Cache-Control', 'public, s-maxage=90000');
    return res.status(200).json({ message: 'Got partial Public Games Successfully', result: {games: myGames} })
  } catch (error) {
    return res.status(500).json(error)
  }
}


export const getAllOwnGamesControllerV2 = async (req: Request, res: Response) => {
  try {
    const lastGame = req.query?.lastGame as string;
    if(missingParams({lastGame}, res)) return;
    const lastGameNumber = parseInt(lastGame);

    const allGames = await prisma.userGame.findMany({
      where: {
        user: res.locals.user.id
      },
      orderBy: {createdAt: 'asc'},
      skip: lastGameNumber,
      take: 10
    })
    if(allGames.length === 0) {return res.status(404).json({ message: "Not Found" });}

    const myGames = await Promise.all(
      allGames.map(async (g) => {
        const [gameDetails, user] = await Promise.all([
          prisma.userGameDetails.findUnique({ where: { gameId: g.id } }),
          prisma.user.findFirst({ where: { registerId: g.user } })
        ]);

        const gameRooms = await prisma.gameRooms.findMany({
          where: {gameId: g.id}
        })
        const nRoomsCreated = gameRooms.length

        const questions = await prisma.questions.findMany({
          where: {gameId: g.id}
        })
        const nQuestions = questions.length

        const gameStars = await prisma.userGameScore.findMany({
          where: {gameId: g.id}
        })
        const nReviews = gameStars.length
        const averageStars = nReviews > 0 ? gameStars.reduce((acc, gs)=> acc + gs.score, 0)/nReviews : 0;


        return {
          ...g,
          imgUrl: gameDetails?.imgUrl ?? null,
          author: user?.name ?? 'anonymous',
          averageStars,
          nReviews,
          nRoomsCreated,
          nQuestions,
          category: gameDetails?.category
        };
      })
    );

    res.setHeader('Cache-Control', 'public, s-maxage=90000');
    return res.status(200).json({ message: 'Got All Game Successfully', result: {games: myGames} })
  } catch (error) {
    return res.status(500).json(error)
  }
}
