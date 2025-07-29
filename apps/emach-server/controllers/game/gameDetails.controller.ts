import { Request, Response } from 'express'
import { prisma } from '../../utils/PrismaInstance'
import {
  createGameDetailsSchema,
  createGameDetailsType,
  updateGameDetailsSchema,
  updateGameDetailsType
} from '../../schema/game/gameDetails.schema'
import { findDuplicate, missingParams, userAccess } from '../tools'

export const createGameDetailsController = async (req: Request<{}, {}, createGameDetailsType>, res: Response) => {
  try {
    const { gameId, imgUrl, description, isPublic, category, theme, keyWords } = req.body
    createGameDetailsSchema.parse(req.body)

    if ((await userAccess('userGame', { id: gameId }, res)) === null) return
    if (await findDuplicate('userGameDetails', { gameId }, res)) return

    const gameDetails = await prisma.userGameDetails.create({
      data: {
        gameId,
        imgUrl: imgUrl || null,
        description,
        isPublic,
        category,
        theme,
        keyWords
      }
    })
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

    await prisma.userGameDetails.delete({
      where: { gameId: userGame.id }
    })
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

    const oneGameDetail = await prisma.userGameDetails.findUnique({
      where: { gameId: userGame.id }
    })

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

    const gameDetails = await prisma.userGameDetails.update({
      where: { gameId },
      data: {
        imgUrl: imgUrl || null,
        description,
        isPublic,
        category,
        theme,
        keyWords
      }
    })

    if (!gameDetails) {
      return res.status(404).json({ message: 'Game Details Not found' })
    }
    return res.status(201).json({ message: 'Game Details updated successfully', gameDetailsId: gameDetails.id })
  } catch (error) {
    return res.status(500).json(error)
  }
}
