import { Request, Response } from 'express';
import { pool } from '../utils/PrismaInstance';
import { findDuplicate } from './tools';
import { saveTCSchema, saveTCType } from '../schema/TC.schema ';

export const saveAcceptTCController = async (req: Request<{}, {}, saveTCType>, res: Response) => {
  try {
    const user = res.locals.user.id
    const ipAddress = req.socket.remoteAddress
    const { metadata } = req.body
    saveTCSchema.parse(req.body)

    if(await findDuplicate('acceptTC', { user }, res))return;
    await pool.query(
      'INSERT INTO "acceptTC" ("ipAddress", "user", metadata) VALUES ($1, $2, $3)',
      [ipAddress, user, metadata]
    )

    return res.status(201).json({ message: 'Accept TC Added successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).json(error)
  }
}

export const getAcceptTCController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id
    const checkAcceptTCResult = await pool.query(
      'SELECT * FROM "acceptTC" WHERE "user" = $1 LIMIT 1',
      [user]
    )
    const checkAcceptTC = checkAcceptTCResult.rows[0]

    if (!checkAcceptTC){
      return res.status(404).json({ message: 'Terms and Conditions Not Accepted'})
    }

    return res.status(201).json({ message: 'Terms and Conditions Accepted'})
  } catch (error) {
    return res.status(500).json(error)
  }
}
