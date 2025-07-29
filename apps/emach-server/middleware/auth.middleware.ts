import express from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../utils/PrismaInstance'
import type { CustomJwtPayload } from '../types/type'

export const authenticateJWT = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRETE) as CustomJwtPayload

      if (!decoded) {
        return res.status(403).json({ message: 'Invalid token' })
      }

      // Query the Register table using PostgreSQL
      const result = await pool.query(
        'SELECT * FROM "Register" WHERE email = $1',
        [decoded.email]
      )

      const user = result.rows[0]

      if (!user) {
        return res.status(403).json({ message: 'User not found' })
      }
      res.locals.user = user;
      next()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    return res.status(401).json({ message: 'No token provided' })
  }
}
