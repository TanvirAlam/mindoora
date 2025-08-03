import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { authQueries } from '../../utils/query'
import { createUser, createAccessToken } from '../../utils/auth/register'
import { pool } from '../../utils/PrismaInstance'

interface OAuthUserData {
  name: string
  email: string
  image?: string
  provider: 'google' | 'facebook' | 'discord' | 'linkedin' | 'twitter' | 'instagram'
  providerId: string
  verified?: boolean
}

export const oauthLoginController = async (req: Request<{}, {}, OAuthUserData>, res: Response) => {
  console.log('🔍 OAUTH LOGIN CONTROLLER CALLED');
  console.log('📨 OAuth request body:', req.body);
  console.log('🌐 IP Address:', req.ip || req.connection.remoteAddress);
  console.log('🖥️ User Agent:', req.get('User-Agent'));
  
  try {
    const { name, email, image, provider, providerId, verified = true } = req.body

    if (!email || !name || !provider || !providerId) {
      return res.status(400).json({ message: 'Required OAuth data not found' })
    }

    // Get client information for enhanced login tracking
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress
    const userAgent = req.get('User-Agent')
    
    // Check if user already exists
    const existingUser = await authQueries.findUserByEmail(email)

    if (existingUser) {
      // User exists, update their information and create login history
      const user = await authQueries.findUserProfile(existingUser.id)

      // Create enhanced login history entry
      await authQueries.createLoginHistory(
        existingUser.id, 
        provider, 
        ipAddress, 
        userAgent,
        null,
        null
      )

      // Update user profile with latest OAuth data
      await pool.query(
        'UPDATE "User" SET name = $1, image = $2 WHERE "registerId" = $3',
        [name, image || user.image, existingUser.id]
      )

      // Update access token
      const jwtSecret = process.env.JWT_SECRETE || process.env.JWT_SECRET || 'fallback-secret';
      const token = jwt.sign(
        { 
          email: existingUser.email,
          userId: existingUser.id
        },
        jwtSecret,
        { expiresIn: '86400s' }
      )

      await authQueries.updateAccessToken(token, existingUser.id)

      // Store OAuth provider information
      try {
        await authQueries.insertOAuthProvider(existingUser.id, provider, providerId)
      } catch (error) {
        console.log('OAuth providers table not found, skipping provider tracking')
      }

      return res.status(200).json({
        message: 'OAuth login successful',
        ...existingUser,
        ...user,
        name,
        image: image || user.image,
        accessToken: token
      })
    } else {
      // Create new user from OAuth data
      const hashedProviderId = await import('bcrypt').then(bcrypt => 
        bcrypt.hash(providerId, 10)
      )

      const register = await authQueries.createUser(email, hashedProviderId, 'Gamer', verified)

      // Create user profile
      const user = await createUser({ 
        name, 
        image: image || 'https://via.placeholder.com/150', 
        registerId: register.id 
      })
      
      const accessToken = await createAccessToken(register)

      // Create initial login history entry with enhanced tracking
      await authQueries.createLoginHistory(
        register.id, 
        provider, 
        ipAddress, 
        userAgent,
        null,
        null
      )

      // Store OAuth provider information
      try {
        await authQueries.insertOAuthProvider(register.id, provider, providerId)
      } catch (error) {
        console.log('OAuth providers table not found, skipping provider tracking')
      }

      return res.status(201).json({
        message: 'OAuth registration successful',
        ...register,
        ...user,
        accessToken
      })
    }
  } catch (error) {
    console.error('OAuth login error:', error)
    return res.status(500).json({ message: 'OAuth login failed' })
  }
}

export const getOAuthProvidersController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id

    const providers = await authQueries.getOAuthProviders(userId)

    return res.status(200).json({
      message: 'OAuth providers retrieved successfully',
      providers
    })
  } catch (error) {
    console.error('Get OAuth providers error:', error)
    return res.status(500).json({ message: 'Failed to retrieve OAuth providers' })
  }
}

export const oauthLogoutController = async (req: Request, res: Response) => {
  try {
    console.log('🔴 OAUTH LOGOUT CONTROLLER CALLED');
    const { userId, provider } = req.body
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required for logout' })
    }

    // Get client information for logout tracking
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress
    const userAgent = req.get('User-Agent')
    
    console.log('📊 Creating logout history entry for user:', userId);
    console.log('📊 Using provider as loginMethod:', provider || 'unknown');

    // Create logout history entry using the new createLogoutHistory function
    // This will set loginStatus to 'LOGGED OUT' and use provider as loginMethod
    await authQueries.createLogoutHistory(
      userId, 
      provider || 'logout', // Use the original provider (google/facebook) as loginMethod
      ipAddress, 
      userAgent,
      null,
      null
    )
    
    return res.status(200).json({
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('OAuth logout error:', error)
    return res.status(500).json({ message: 'Failed to process logout' })
  }
}

export const unlinkOAuthProviderController = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user.id
    const { provider } = req.params

    if (!provider) {
      return res.status(400).json({ message: 'Provider name is required' })
    }

    // Check if user has other authentication methods before unlinking
    const providersCount = await authQueries.countOAuthProviders(userId)

    if (providersCount <= 1) {
      return res.status(400).json({ 
        message: 'Cannot unlink the last authentication method. Please add another method first.' 
      })
    }

    await authQueries.deleteOAuthProvider(userId, provider)

    return res.status(200).json({
      message: `${provider} provider unlinked successfully`
    })
  } catch (error) {
    console.error('Unlink OAuth provider error:', error)
    return res.status(500).json({ message: 'Failed to unlink OAuth provider' })
  }
}

export default oauthLoginController
