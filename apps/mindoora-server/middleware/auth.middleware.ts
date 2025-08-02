import express from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../utils/PrismaInstance'
import type { CustomJwtPayload } from '../types/type'

export const authenticateJWT = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRETE || process.env.JWT_SECRET || 'fallback-secret';
      console.log('🔐 Attempting JWT verification with secret length:', jwtSecret.length);
      
      const decoded = jwt.verify(token, jwtSecret) as CustomJwtPayload

      if (!decoded) {
        console.error('❌ JWT verification failed: decoded token is null');
        return res.status(403).json({ message: 'Invalid token' })
      }

      console.log('✅ JWT verified successfully for user:', decoded.email);

      // Query the Register table using PostgreSQL
      const result = await pool.query(
        'SELECT * FROM "Register" WHERE email = $1',
        [decoded.email]
      )

      const user = result.rows[0]

      if (!user) {
        console.error('❌ User not found in database:', decoded.email);
        return res.status(403).json({ message: 'User not found' })
      }
      
      console.log('✅ User found in database:', user.email);
      res.locals.user = user;
      next()
    } catch (error) {
      console.error('❌ JWT Authentication Error:', error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: 'Invalid token format' })
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' })
      } else {
        return res.status(500).json({ message: 'Authentication failed', error: error.message })
      }
    }
  } else {
    console.error('❌ No authorization token provided');
    return res.status(401).json({ message: 'No token provided' })
  }
}
