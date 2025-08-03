import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { authQueries } from '../../utils/query'
import {loginType,loginSchema} from '../../db/schemas/auth/login.schema'

export const loginController = async (req: Request<{},{},loginType>, res: Response) => {
  try {
    console.log('🔐 LOGIN CONTROLLER CALLED:', { email: req.body.email, hasPassword: !!req.body.password })
    const { email, password } = req.body
    loginSchema.parse(req.body)

    if (!email || !password) {
      return res.status(400).json({ message: 'Required data not found' })
    }

    // Get client information for enhanced login tracking
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress
    const userAgent = req.get('User-Agent')
    
    // Find user by email
    const existingUser = await authQueries.findUserByEmail(email)
    
    if (!existingUser) {
      return res.status(401).json({ message: 'User is not found' })
    }

    if (existingUser.verified == false) {
      return res.status(401).json({ message: 'Account Not Verified' })
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password)
    if (!passwordMatch) {
      // Record failed login attempt
      await authQueries.createFailedLoginHistory(
        existingUser.id, 
        'password', 
        ipAddress, 
        userAgent, 
        'Invalid password'
      )
      return res.status(401).json({ message: 'Password is not match' })
    }

    // Find user profile
    const user = await authQueries.findUserProfile(existingUser.id)

    const token = jwt.sign(
      { 
        email: existingUser.email,
        userId: existingUser.id 
      },
      process.env.JWT_SECRETE,
      { expiresIn: '86400s' }
    )

    // Update access token
    await authQueries.updateAccessToken(token, existingUser.id)

    // Create enhanced login history entry
    await authQueries.createLoginHistory(
      existingUser.id, 
      'password', 
      ipAddress, 
      userAgent,
      null, // deviceInfo can be enhanced later
      null  // location can be enhanced later
    )

    return res.status(200).json({ message: 'Login successful', ...existingUser, ...user, accessToken: token })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Login failed' })
  }
}

export default loginController
