import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../../utils/PrismaInstance'
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
    const existingUser = await prisma.register.findUnique({ where: { email } })

    if (existingUser) {
      await prisma.loginHistory.create({
        data: { userId: existingUser.id }
      })
      return res.status(409).json({ message: 'User Exists!!' })
    } else {
      const register = await prisma.register.create({
        data: {
          email,
          phone: hashedPassword,
          password: hashedPassword,
          role,
          accessToken: '',
          verified: !isVerifyNeed
        }
      })


      const user = await createUser({ name, image, registerId: register.id })
      const accessToken = await createAccessToken(register)

      if (isVerifyNeed){
        const verifyCode = generateRandomCode()

        const expirationTime = new Date()
        expirationTime.setMinutes(expirationTime.getMinutes() + 5)
        sendVerificationEmail(email, verifyCode, 'Account Verify Code')

        await prisma.emailVerify.create({
          data: { email, createAt: new Date(), expireAt: expirationTime, code: +verifyCode }
        })
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

    const checkUser = await prisma.register.findUnique({ where: { id: user } })

    if (!checkUser) {
      return res.status(404).json({ message: 'User Not Found' })
    }

    await prisma.register.delete({
      where: { id: user }
    })

    return res.status(204).json({ message: 'Account deleted successfully' })
  } catch (error) {
    return res.status(500).json(error)
  }
}
