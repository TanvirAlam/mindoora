import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { createUserGameSchema, createUserGameType, updateUserGameSchema, updateUserGameType } from '../../schema/game/userGame.schema'
import { findDuplicate, missingParams, userAccess } from '../tools'

export const createUserGameController = async (req: Request<{}, {}, createUserGameType>, res: Response) => {
  try {
    const { title, language, nPlayer } = req.body
    createUserGameSchema.parse(req.body)
    const user = res.locals.user.id

    if (await findDuplicate('userGame', { title, user }, res)) return;

    // Create user game
    const gameResult = await pool.query(
      'INSERT INTO "userGame" (title, language, "nPlayer", "user") VALUES ($1, $2, $3, $4) RETURNING *',
      [title, language, +nPlayer, user]
    )
    const game = gameResult.rows[0]

    // Get user name
    const userResult = await pool.query(
      'SELECT name FROM "user" WHERE "registerId" = $1',
      [user]
    )
    const userName = userResult.rows[0]?.name

    // Get all other users
    const allUsersResult = await pool.query(
      'SELECT id FROM register WHERE id != $1',
      [user]
    )
    const arrayOfIds = allUsersResult.rows.map((obj: any) => obj.id);

    // Create notifications for all users
    for (const i of arrayOfIds) {
      const notificationResult = await pool.query(
        'INSERT INTO notifications ("from", notification) VALUES ($1, $2) RETURNING id',
        [user, `${userName} has created a new game: ${title}`]
      )
      const notificationId = notificationResult.rows[0].id
      
      await pool.query(
        'INSERT INTO "NotificationRecipient" ("notificationId", "recipientId") VALUES ($1, $2)',
        [notificationId, i]
      )
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

    await pool.query(
      'DELETE FROM "userGame" WHERE id = $1',
      [id]
    )
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
        const gameDetailsResult = await pool.query(
          'SELECT * FROM "userGameDetails" WHERE "gameId" = $1',
          [g.id]
        )
        const gameDetails = gameDetailsResult.rows[0]

        const userResult = await pool.query(
          'SELECT name FROM "user" WHERE "registerId" = $1',
          [g.user]
        )
        const user = userResult.rows[0]

        // Get game rooms count
        const gameRoomsResult = await pool.query(
          'SELECT COUNT(*) as count FROM "gameRooms" WHERE "gameId" = $1',
          [g.id]
        )
        const nRoomsCreated = parseInt(gameRoomsResult.rows[0].count)

        // Get questions count
        const questionsResult = await pool.query(
          'SELECT COUNT(*) as count FROM questions WHERE "gameId" = $1',
          [g.id]
        )
        const nQuestions = parseInt(questionsResult.rows[0].count)

        // Get game scores and calculate average
        const gameStarsResult = await pool.query(
          'SELECT score FROM "userGameScore" WHERE "gameId" = $1',
          [g.id]
        )
        const gameStars = gameStarsResult.rows
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
    let oneGameResult;
    if (id) {
      oneGameResult = await pool.query(
        'SELECT ug.* FROM "userGame" ug JOIN "userGameDetails" ugd ON ug.id = ugd."gameId" WHERE ug.id = $1 AND ugd."isPublic" = true',
        [id]
      )
    } else {
      oneGameResult = await pool.query(
        'SELECT ug.* FROM "userGame" ug JOIN "userGameDetails" ugd ON ug.id = ugd."gameId" WHERE ug.title = $1 AND ugd."isPublic" = true',
        [title]
      )
    }

    if (oneGameResult.rows.length === 0) {
      return res.status(404).json({ message: 'Not Found' })
    }

    const oneGame = oneGameResult.rows[0]

    // Get game details
    const gameDetailsResult = await pool.query(
      'SELECT * FROM "userGameDetails" WHERE "gameId" = $1',
      [oneGame.id]
    )
    const gameDetails = gameDetailsResult.rows[0]

    // Get questions
    const questionsResult = await pool.query(
      'SELECT * FROM questions WHERE "gameId" = $1',
      [oneGame.id]
    )
    const questions = questionsResult.rows

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

    const gameResult = await pool.query(
      'UPDATE "userGame" SET title = $1, language = $2, "nPlayer" = $3 WHERE id = $4 RETURNING *',
      [title, language, +nPlayer, id]
    )
    const game = gameResult.rows[0]
    return res.status(201).json({ message: 'Game updated successfully', gameId: game.id })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getAllPublicGameController = async (req: Request, res: Response) => {
  try {
    const publicGamesResult = await pool.query(
      'SELECT ug.* FROM "userGame" ug JOIN "userGameDetails" ugd ON ug.id = ugd."gameId" WHERE ugd."isPublic" = true'
    )
    const allPublicGames = publicGamesResult.rows;

    const myGames = await Promise.all(
      allPublicGames.map(async (g) => {
        const gameDetailsResult = await pool.query(
          'SELECT * FROM "userGameDetails" WHERE "gameId" = $1',
          [g.id]
        )
        const gameDetails = gameDetailsResult.rows[0]

        const userResult = await pool.query(
          'SELECT name FROM "user" WHERE "registerId" = $1',
          [g.user]
        )
        const user = userResult.rows[0]

        const gameRoomsResult = await pool.query(
          'SELECT COUNT(*) as count FROM "gameRooms" WHERE "gameId" = $1',
          [g.id]
        )
        const nRoomsCreated = parseInt(gameRoomsResult.rows[0].count)

        const questionsResult = await pool.query(
          'SELECT COUNT(*) as count FROM questions WHERE "gameId" = $1',
          [g.id]
        )
        const nQuestions = parseInt(questionsResult.rows[0].count)

        const gameStarsResult = await pool.query(
          'SELECT score FROM "userGameScore" WHERE "gameId" = $1',
          [g.id]
        )
        const gameStars = gameStarsResult.rows
        const nReviews = gameStars.length
        const averageStars = nReviews > 0 ? gameStars.reduce((acc, gs) => acc + gs.score, 0) / nReviews : 0;

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

    let query = `
      SELECT ug.* FROM "userGame" ug 
      JOIN "userGameDetails" ugd ON ug.id = ugd."gameId" 
      WHERE ugd."isPublic" = true
    `;
    const params = [];
    
    if (category) {
      query += ' AND ugd.category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY ug."createdAt" ASC OFFSET $' + (params.length + 1) + ' LIMIT 10';
    params.push(lastGameNumber);

    const publicGamesResult = await pool.query(query, params);
    const allPublicGames = publicGamesResult.rows;

    const myGames = await Promise.all(
      allPublicGames.map(async (g) => {
        const gameDetailsResult = await pool.query(
          'SELECT * FROM "userGameDetails" WHERE "gameId" = $1',
          [g.id]
        )
        const gameDetails = gameDetailsResult.rows[0]

        const userResult = await pool.query(
          'SELECT name FROM "user" WHERE "registerId" = $1',
          [g.user]
        )
        const user = userResult.rows[0]

        const gameRoomsResult = await pool.query(
          'SELECT COUNT(*) as count FROM "gameRooms" WHERE "gameId" = $1',
          [g.id]
        )
        const nRoomsCreated = parseInt(gameRoomsResult.rows[0].count)

        const questionsResult = await pool.query(
          'SELECT COUNT(*) as count FROM questions WHERE "gameId" = $1',
          [g.id]
        )
        const nQuestions = parseInt(questionsResult.rows[0].count)

        const gameStarsResult = await pool.query(
          'SELECT score FROM "userGameScore" WHERE "gameId" = $1',
          [g.id]
        )
        const gameStars = gameStarsResult.rows
        const nReviews = gameStars.length
        const averageStars = nReviews > 0 ? gameStars.reduce((acc, gs) => acc + gs.score, 0) / nReviews : 0;

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

    const ownGamesResult = await pool.query(
      'SELECT * FROM "userGame" WHERE "user" = $1 ORDER BY "createdAt" ASC OFFSET $2 LIMIT 10',
      [res.locals.user.id, lastGameNumber]
    );
    const allGames = ownGamesResult.rows;
    
    if(allGames.length === 0) {return res.status(404).json({ message: "Not Found" });}

    const myGames = await Promise.all(
      allGames.map(async (g) => {
        const gameDetailsResult = await pool.query(
          'SELECT * FROM "userGameDetails" WHERE "gameId" = $1',
          [g.id]
        )
        const gameDetails = gameDetailsResult.rows[0]

        const userResult = await pool.query(
          'SELECT name FROM "user" WHERE "registerId" = $1',
          [g.user]
        )
        const user = userResult.rows[0]

        const gameRoomsResult = await pool.query(
          'SELECT COUNT(*) as count FROM "gameRooms" WHERE "gameId" = $1',
          [g.id]
        )
        const nRoomsCreated = parseInt(gameRoomsResult.rows[0].count)

        const questionsResult = await pool.query(
          'SELECT COUNT(*) as count FROM questions WHERE "gameId" = $1',
          [g.id]
        )
        const nQuestions = parseInt(questionsResult.rows[0].count)

        const gameStarsResult = await pool.query(
          'SELECT score FROM "userGameScore" WHERE "gameId" = $1',
          [g.id]
        )
        const gameStars = gameStarsResult.rows
        const nReviews = gameStars.length
        const averageStars = nReviews > 0 ? gameStars.reduce((acc, gs) => acc + gs.score, 0) / nReviews : 0;

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
