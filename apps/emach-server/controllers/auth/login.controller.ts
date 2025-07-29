import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../../utils/PrismaInstance'
import {loginType,loginSchema} from '../../schema/auth/login.schema'

export const loginController = async (req: Request<{},{},loginType>, res: Response) => {
  try {
    const { email, password } = req.body
    loginSchema.parse(req.body)

    if (!email || !password) {
      return res.status(400).json({ message: 'Required data not found' })
    }

    // Find user by email
    const existingUserResult = await pool.query(
      'SELECT * FROM "Register" WHERE email = $1',
      [email]
    )
    const existingUser = existingUserResult.rows[0]
    
    if (!existingUser) {
      return res.status(401).json({ message: 'User is not found' })
    }

    if (existingUser.verified == false) {
      return res.status(401).json({ message: 'Account Not Verified' })
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Password is not match' })
    }

    // Find user profile
    const userResult = await pool.query(
      'SELECT * FROM "User" WHERE "registerId" = $1',
      [existingUser.id]
    )
    const user = userResult.rows[0]

    const token = jwt.sign(
      { email: existingUser.email },
      process.env.JWT_SECRETE,
      { expiresIn: '86400s' }
    )

    // Update access token
    await pool.query(
      'UPDATE "Register" SET "accessToken" = $1 WHERE id = $2',
      [token, existingUser.id]
    )

    // Create login history entry
    await pool.query(
      'INSERT INTO "LoginHistory" ("userId", "loginTime") VALUES ($1, NOW())',
      [existingUser.id]
    )

    return res.status(200).json({ message: 'Login successful', ...existingUser, ...user, accessToken: token })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Login failed' })
  }
}

export default loginController
