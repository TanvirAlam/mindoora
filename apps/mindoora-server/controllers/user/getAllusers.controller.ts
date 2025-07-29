import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { missingParams } from '../tools'

export const getTopAuthorsController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id

    // Complex query to get top authors with user info, following status, and game count
    const topPlayersResult = await pool.query(`
      SELECT 
        r.id,
        u.id as user_id,
        u.name,
        u.image,
        COUNT(ug.id) as userGame_count,
        CASE WHEN f.id IS NOT NULL THEN true ELSE false END as is_following
      FROM "Register" r
      LEFT JOIN "User" u ON r.id = u."registerId"
      LEFT JOIN "UserGame" ug ON r.id = ug."user"
      LEFT JOIN "Followings" f ON r.id = f."followingId" AND f."followerId" = $1
      GROUP BY r.id, u.id, u.name, u.image, f.id
      ORDER BY COUNT(ug.id) DESC
      LIMIT 10
    `, [user]);

    // Transform the result to match the original structure
    const topPlayers = topPlayersResult.rows.map(row => ({
      id: row.id,
      user: {
        id: row.user_id,
        name: row.name,
        image: row.image
      },
      following: row.is_following ? [{ followerId: user }] : [],
      _count: {
        userGame: parseInt(row.usergame_count)
      }
    }));

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

    // Search for users by name (case insensitive)
    const searchedUsersResult = await pool.query(`
      SELECT 
        r.id,
        u.name,
        u.image
      FROM "Register" r
      LEFT JOIN "User" u ON r.id = u."registerId"
      WHERE u.name ILIKE $1
    `, [`%${searchText}%`]);

    // Transform the result to match the original structure
    const searchedUsers = searchedUsersResult.rows.map(row => ({
      user: {
        name: row.name,
        image: row.image
      }
    }));

    return res.status(201).json({message: 'Got Authors successfully', searchedUsers})
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user data' })
  }
}

export const getOneUserController = async (req: Request, res: Response) => {
  try {
    const userId = req.query?.userId as string

    if (missingParams({ userId }, res)) return;

    // Get specific user by register ID
    const searchedOneUserResult = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.image
      FROM "Register" r
      LEFT JOIN "User" u ON r.id = u."registerId"
      WHERE r.id = $1
      LIMIT 1
    `, [userId]);

    const searchedOneUser = searchedOneUserResult.rows[0];

    if (!searchedOneUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=90000');
    return res.status(201).json({
      message: 'Got Authors successfully', 
      result: {
        id: searchedOneUser.id,
        name: searchedOneUser.name,
        image: searchedOneUser.image
      }
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user data' })
  }
}
