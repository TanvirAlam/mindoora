import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { authQueries } from '../../utils/query'
import sendVerificationEmail from './email.controller'
import { createUser, createAccessToken, generateRandomCode } from '../../utils/auth/register'
import { registerType, registerSchema } from '../../db/schemas/auth/register.schema'

export const registerController = async (req: Request<{}, {}, registerType>, res: Response) => {
  try {
    console.log('📝 REGISTER CONTROLLER CALLED:', { 
      email: req.body.email, 
      name: req.body.name,
      role: req.body.role,
      verified: req.body.verified,
      hasTrueCode: !!req.body.trueCode
    })
    const { name, email, password, image, role, verified, trueCode } = req.body
    registerSchema.parse(req.body)

    const isVerifyNeed = verified ? (trueCode === process.env.NEXT_PUBLIC_VERIFIED_SECRET ? false : true) : true;

    if (!email || !password || !name || !image || !role) {
      return res.status(400).json({ message: 'Required data not found' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Get client information for enhanced login tracking
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress
    const userAgent = req.get('User-Agent')
    
    // Check if user already exists
    const existingUser = await authQueries.findUserByEmail(email)

    if (existingUser) {
      // Create login history entry for existing user attempting to register
      await authQueries.createLoginHistory(
        existingUser.id, 
        'registration_attempt', 
        ipAddress, 
        userAgent,
        null,
        null
      )
      return res.status(409).json({ message: 'User Exists!!' })
    } else {
      // Create new user registration
      const register = await authQueries.createUser(email, hashedPassword, role, !isVerifyNeed)

      const user = await createUser({ name, image, registerId: register.id })
      const accessToken = await createAccessToken(register)

      if (isVerifyNeed){
        const verifyCode = generateRandomCode()

        const expirationTime = new Date()
        expirationTime.setMinutes(expirationTime.getMinutes() + 5)
        sendVerificationEmail(email, verifyCode, 'Account Verify Code')

        // Create email verification entry
        await authQueries.createEmailVerification(email, expirationTime, +verifyCode)
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
    const checkUser = await authQueries.findUserByEmail(res.locals.user.email)

    if (!checkUser) {
      return res.status(404).json({ message: 'User Not Found' })
    }

    // Delete user (CASCADE will handle related records)
    await authQueries.deleteAccount(user)

    return res.status(204).json({ message: 'Account deleted successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}
