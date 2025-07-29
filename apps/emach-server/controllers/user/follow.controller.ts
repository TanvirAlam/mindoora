import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { createFollowSchema } from '../../schema/follow.schema '
import { findDuplicate, missingParams } from '../tools'


export const followUserController = async (req: Request, res: Response) => {
  try {
    const { followingId } = req.body
    createFollowSchema.parse(req.body)
    const followerId = res.locals.user.id

    if (await findDuplicate('followings', { followerId, followingId }, res))return;

    if (followerId == followingId){
      return res.status(400).json({message: 'You can not follow yourself'})
    }

    await pool.query(
      'INSERT INTO followings (followerId, followingId) VALUES ($1, $2)',
      [followerId, followingId]
    )

    return res.status(201).json({ message: 'User followed successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}


export const unfollowUserController = async (req: Request, res: Response) => {
  try {
    const followingId = req.query.followingId as string
    const followerId = res.locals.user.id

    if(missingParams({followingId}, res)) return;

    const { rows } = await pool.query(
      'SELECT id FROM followings WHERE followerId = $1 AND followingId = $2',
      [followerId, followingId]
    );
    const checkFollowing = rows[0];

    if (!checkFollowing){
      return res.status(404).json({message: 'Following Not Found'})
    }

    await pool.query(
      'DELETE FROM followings WHERE id = $1',
      [checkFollowing.id]
    )


    return res.status(204).json({ message: 'User unfollowed successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}

export const isFollowing = async (req: Request, res: Response) => {
  try {
    const followingId = req.query.followingId as string
    const followerId = res.locals.user.id

    if(missingParams({followingId}, res)) return;

    const { rows } = await pool.query(
      'SELECT id FROM followings WHERE followerId = $1 AND followingId = $2',
      [followerId, followingId]
    );
    const checkFollowing = rows[0];

    const isFollowing = !checkFollowing ? false : true

    return res.status(201).json({ message: 'Following Status Got Successfully', result:{isFollowing} })
  } catch (error) {
    return res.status(500).json(error)
  }
}
