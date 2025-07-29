import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { pool } from '../../utils/PrismaInstance'
import sendVerificationEmail from './email.controller'
import { createUser, createAccessToken, generateRandomCode } from '../../utils/auth/register'
import { registerType, registerSchema } from '../../schema/auth/register.schema'

export const registerController = async (req: Request<{}, {}, registerType>, res: Response) => {
  try {
    const { name, email, password, image, role, verified, trueCode } = req.body
    registerSchema.parse(req.body)

    const isVerifyNeed = verified ? (trueCode === process.env.NEXT_PUBLIC_VERIFIED_SECRET ? false : true) : true;

    if (!email || !password || !name || !image || !role) {
      return res.status(400).json({ message: 'Required data not found' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Check if user already exists
    const existingUserResult = await pool.query(
      'SELECT * FROM "Register" WHERE email = $1',
      [email]
    )
    const existingUser = existingUserResult.rows[0]

    if (existingUser) {
      // Create login history entry
      await pool.query(
        'INSERT INTO "LoginHistory" ("userId", "loginTime") VALUES ($1, NOW())',
        [existingUser.id]
      )
      return res.status(409).json({ message: 'User Exists!!' })
    } else {
      // Create new user registration
      const registerResult = await pool.query(
        `INSERT INTO "Register" (email, phone, password, role, "accessToken", verified, "createdAt") 
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
        [email, hashedPassword, hashedPassword, role, '', !isVerifyNeed]
      )
      const register = registerResult.rows[0]

      const user = await createUser({ name, image, registerId: register.id })
      const accessToken = await createAccessToken(register)

      if (isVerifyNeed){
        const verifyCode = generateRandomCode()

        const expirationTime = new Date()
        expirationTime.setMinutes(expirationTime.getMinutes() + 5)
        sendVerificationEmail(email, verifyCode, 'Account Verify Code')

        // Create email verification entry
        await pool.query(
          'INSERT INTO "EmailVerify" (email, "createAt", "expireAt", code) VALUES ($1, NOW(), $2, $3)',
          [email, expirationTime, +verifyCode]
        )
      }

      return res.status(201).json({
        message: 'Registration successful',
        ...register,
        ...user,
        accessToken
      })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Action Failed' })
  }
}


export const deleteAccountController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id

    // Check if user exists
    const checkUserResult = await pool.query(
      'SELECT * FROM "Register" WHERE id = $1',
      [user]
    )
    const checkUser = checkUserResult.rows[0]

    if (!checkUser) {
      return res.status(404).json({ message: 'User Not Found' })
    }

    // Delete user (CASCADE will handle related records)
    await pool.query(
      'DELETE FROM "Register" WHERE id = $1',
      [user]
    )

    return res.status(204).json({ message: 'Account deleted successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}
