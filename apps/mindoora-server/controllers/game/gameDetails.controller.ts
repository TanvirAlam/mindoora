import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import {
  createGameDetailsSchema,
  createGameDetailsType,
  updateGameDetailsSchema,
  updateGameDetailsType
} from '../../db/schemas/game/gameDetails.schema'
import { findDuplicate, missingParams, userAccess } from '../tools'

export const createGameDetailsController = async (req: Request<{}, {}, createGameDetailsType>, res: Response) => {
  try {
    const { gameId, imgUrl, description, isPublic, category, theme, keyWords } = req.body
    createGameDetailsSchema.parse(req.body)

    if ((await userAccess('userGame', { id: gameId }, res)) === null) return
    if (await findDuplicate('userGameDetails', { gameId }, res)) return

    const gameDetailsResult = await pool.query(
      'INSERT INTO "userGameDetails" ("gameId", "imgUrl", description, "isPublic", category, theme, "keyWords") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [gameId, imgUrl || null, description, isPublic, category, theme, keyWords]
    )
    const gameDetails = gameDetailsResult.rows[0]
    return res.status(201).json({ message: 'Game Details added successfully', gameDetaisId: gameDetails.id })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const deleteGameDetailsController = async (req: Request, res: Response) => {
  try {
    const gameId = req.query?.gameId as string
    const gameTitle = req.query?.gametitle as string

    if (missingParams({ gameId, gameTitle }, res)) return
    const userGame = await userAccess('userGame', gameId ? { id: gameId } : { title: gameTitle }, res)
    if (userGame === null) return

    await pool.query(
      'DELETE FROM "userGameDetails" WHERE "gameId" = $1',
      [userGame.id]
    )
    return res.status(204).json({ message: 'Game deleted successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const getOneGameDetailsController = async (req: Request, res: Response) => {
  try {
    const gameId = req.query?.gameId as string
    const gameTitle = req.query?.gameTitle as string

    if (missingParams({ gameId, gameTitle }, res)) return
    const userGame = await userAccess('userGame', gameId ? { id: gameId } : { title: gameTitle }, res)
    if (userGame === null) return

    const gameDetailResult = await pool.query(
      'SELECT * FROM "userGameDetails" WHERE "gameId" = $1',
      [userGame.id]
    )
    const oneGameDetail = gameDetailResult.rows[0]

    return res
      .status(201)
      .json({ message: 'Got One Game Details successfully', result: { gamedetails: oneGameDetail } })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const updateGameDetailsController = async (req: Request<{}, {}, updateGameDetailsType>, res: Response) => {
  try {
    const { gameId, imgUrl, description, isPublic, category, theme, keyWords } = req.body
    updateGameDetailsSchema.parse(req.body)

    if ((await userAccess('userGame', { id: gameId }, res)) === null) return

    const gameDetailsResult = await pool.query(
      'UPDATE "userGameDetails" SET "imgUrl" = $1, description = $2, "isPublic" = $3, category = $4, theme = $5, "keyWords" = $6 WHERE "gameId" = $7 RETURNING *',
      [imgUrl || null, description, isPublic, category, theme, keyWords, gameId]
    )
    const gameDetails = gameDetailsResult.rows[0]

    if (!gameDetails) {
      return res.status(404).json({ message: 'Game Details Not found' })
    }
    return res.status(201).json({ message: 'Game Details updated successfully', gameDetailsId: gameDetails.id })
  } catch (error) {
    return res.status(500).json(error)
  }
}
