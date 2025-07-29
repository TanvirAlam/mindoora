import { Request, Response } from 'express'
import { pool } from '../../utils/PrismaInstance'
import { hashing } from '../../helper/hashing'
import {resetPasswordType,resetPasswordSchema} from '../../schema/auth/resetPassword.schema'

export const resetPasswordController = async (req: Request<{},{},resetPasswordType>, res: Response) => {
  try {
    const { email, otp, password } = req.body

    resetPasswordSchema.parse(req.body)

    // Check if email exists
    const { rows } = await pool.query(
      'SELECT id, otp, expireTime FROM register WHERE email = $1',
      [email]
    );
    const existingUser = rows[0];
    
    if (!existingUser) {
      return res.status(401).json({ message: 'User is not found' })
    }

    // Compare otp match
    if (existingUser.otp != parseInt(otp)) {
      return res.status(401).json({ message: 'OTP is Invalid' })
    }

    if (Date.now() > parseInt(existingUser.expireTime)) {
      return res.status(401).json({ message: 'OTP is expire' })
    }

    const hashedPassword = await hashing(password, 10)

    // Save the password
    await pool.query(
      'UPDATE register SET password = $1 WHERE id = $2',
      [hashedPassword, existingUser.id]
    )

    return res.status(200).json({ message: 'password changed successfully' })
  } catch (error) {
    // console.error(error)
    return res.status(500).json(error)
  }
}
