import { Request, Response } from 'express'
import { prisma } from '../../utils/PrismaInstance'
import { missingParams } from '../tools'

export const getTopAuthorsController = async (req: Request, res: Response) => {
  try {

    const user = res.locals.user.id

    const topPlayers = await prisma.register.findMany({
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        following: {
          where: {
            followerId: user
          }
        },
        _count: {
          select: {
            userGame: true
          }
        }
      },
      take: 10,
      orderBy: {
        userGame: {
          _count: 'desc',
        },
      },
    })

    res.setHeader('Cache-Control', 'public, s-maxage=90000');
    return res.status(201).json({message: 'Got Authors Successfully', topPlayers})
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user data' })
  }
}

export const searchAuthorsController = async (req: Request, res: Response) => {
  try {
    const searchText = req.query?.searchText as string

    if (missingParams({ searchText }, res)) return;

    const searchedUsers = await prisma.register.findMany({
      where: {
        user: {
          name: {
            contains: searchText,
            mode: 'insensitive'
          }
        }
      },
      select: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    return res.status(201).json({message: 'Got Authors successfully', searchedUsers})
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user data' })
  }
}

export const getOneUserController = async (req: Request, res: Response) => {
  try {
    const userId = req.query?.userId as string

    if (missingParams({ userId }, res)) return;

    const searchedOneUser = await prisma.register.findFirst({
      where: {
        id: userId
      },

      select: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    res.setHeader('Cache-Control', 'public, s-maxage=90000');
    return res.status(201).json({message: 'Got Authors successfully', result: searchedOneUser.user})
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user data' })
  }
}
