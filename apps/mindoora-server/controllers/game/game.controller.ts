import { Request, Response } from 'express'
import { gameQueries, userQueries, notificationQueries, questionQueries } from '../../utils/query'
import { createUserGameSchema, createUserGameType, updateUserGameSchema, updateUserGameType } from '../../db/schemas/game/userGame.schema'
import { findDuplicate, missingParams, userAccess } from '../tools'

export const createUserGameController = async (req: Request<{}, {}, createUserGameType>, res: Response) => {
  try {
    const { title, language, nPlayer } = req.body
    createUserGameSchema.parse(req.body)
    const user = res.locals.user.id

    if (await findDuplicate('userGame', { title, user }, res)) return;

    // Create user game
    const game = await gameQueries.createUserGame(title, language, +nPlayer, user)

    // Get user name
    const userProfile = await userQueries.getUserByRegisterId(user)
    const userName = userProfile?.name

    // Get all other users
    const arrayOfIds = await notificationQueries.getAllUserIds(user);

    // Create notifications for all users
    for (const i of arrayOfIds) {
      const notificationId = await notificationQueries.createNotification(user, `${userName} has created a new game: ${title}`)
      await notificationQueries.createNotificationRecipient(notificationId, i)
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

    await gameQueries.deleteUserGame(id)
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
      allGames.map(async (g: any) => {
        // Get game details and user info
        const gameDetails = await gameQueries.getGameDetails(g.id)

        const user = await userQueries.getUserByRegisterId(g.user)

        // Get game rooms count
        const nRoomsCreated = await gameQueries.getGameRoomsCount(g.id)

        // Get questions count
        const nQuestions = await gameQueries.getQuestionsCount(g.id)

        // Get game scores and calculate average
        const gameStars = await gameQueries.getGameScores(g.id)
        const nReviews = gameStars.length
        const averageStars = nReviews > 0 ? gameStars.reduce((acc: number, gs: any) => acc + gs.score, 0)/nReviews : 0;

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

    // Find game with public details
    let oneGame;
    if (id) {
      oneGame = await gameQueries.findPublicGameById(id)
    } else {
      oneGame = await gameQueries.findPublicGameByTitle(title)
    }

    if (!oneGame) {
      return res.status(404).json({ message: 'Not Found' })
    }

    // Get game details
    const gameDetails = await gameQueries.getGameDetails(oneGame.id)

    // Get questions
    const questions = await questionQueries.getQuestionsByGameId(oneGame.id)

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

    const game = await gameQueries.updateUserGame(title, language, +nPlayer, id)
    return res.status(201).json({ message: 'Game updated successfully', gameId: game.id })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllPublicGameController = async (req: Request, res: Response) => {
  try {
    const allPublicGames = await gameQueries.getPublicGames();

    const myGames = await Promise.all(
      allPublicGames.map(async (g: any) => {
        // Get game details
        const gameDetails = await gameQueries.getGameDetails(g.id)

        // Get user info
        const user = await userQueries.getUserByRegisterId(g.user)

        // Get game rooms count
        const nRoomsCreated = await gameQueries.getGameRoomsCount(g.id)

        // Get questions count
        const nQuestions = await gameQueries.getQuestionsCount(g.id)

        // Get game scores and calculate average
        const gameStars = await gameQueries.getGameScores(g.id)
        const nReviews = gameStars.length
        const averageStars = nReviews > 0 ? gameStars.reduce((acc: number, gs: any) => acc + gs.score, 0) / nReviews : 0;

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

    return res.status(200).json({ message: 'Got All Public Games Successfully', result: { games: myGames } })
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

    // Use centralized query for public games with pagination
    const allPublicGames = await gameQueries.getPublicGamesWithPagination(lastGameNumber, category);

    const myGames = await Promise.all(
      allPublicGames.map(async (g: any) => {
        // Get game details
        const gameDetails = await gameQueries.getGameDetails(g.id)

        // Get user info
        const user = await userQueries.getUserByRegisterId(g.user)

        // Get game rooms count
        const nRoomsCreated = await gameQueries.getGameRoomsCount(g.id)

        // Get questions count
        const nQuestions = await gameQueries.getQuestionsCount(g.id)

        // Get game scores and calculate average
        const gameStars = await gameQueries.getGameScores(g.id)
        const nReviews = gameStars.length
        const averageStars = nReviews > 0 ? gameStars.reduce((acc: number, gs: any) => acc + gs.score, 0) / nReviews : 0;

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

    const allGames = await gameQueries.getUserOwnGames(res.locals.user.id, lastGameNumber)

    if (allGames.length === 0) {
      return res.status(404).json({ message: 'Not Found' })
    }

    const myGames = await Promise.all(
      allGames.map(async (g: any) => {
        // Get game details
        const gameDetails = await gameQueries.getGameDetails(g.id)

        // Get user info
        const user = await userQueries.getUserByRegisterId(g.user)

        // Get game rooms count
        const nRoomsCreated = await gameQueries.getGameRoomsCount(g.id)

        // Get questions count
        const nQuestions = await gameQueries.getQuestionsCount(g.id)

        // Get game scores and calculate average
        const gameStars = await gameQueries.getGameScores(g.id)
        const nReviews = gameStars.length
        const averageStars = nReviews > 0 ? gameStars.reduce((acc: number, gs: any) => acc + gs.score, 0) / nReviews : 0;

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
