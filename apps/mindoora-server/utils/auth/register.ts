import { pool } from '../PrismaInstance'
import jwt from 'jsonwebtoken'

export const createUser = async (userData: any) => {
  const { name = 'Not found', image = 'Not found', registerId } = userData
  
  const result = await pool.query(
    'INSERT INTO "User" (name, image, "registerId") VALUES ($1, $2, $3) RETURNING *',
    [name, image, registerId]
  )
  
  return result.rows[0]
}

export const createAccessToken = async (register: any) => {
  const token = jwt.sign(
    {
      email: register.email,
      userId: register.id
    },
    process.env.JWT_SECRETE,
    { expiresIn: '1h' }
  )

  await pool.query(
    'UPDATE "Register" SET "accessToken" = $1 WHERE id = $2',
    [token, register.id]
  )

  return token
}

export function generateRandomCode() {
  const min = 1000
  const max = 9999
  const randomCode = Math.floor(Math.random() * (max - min + 1)) + min

  const fourDigitCode = randomCode.toString().padStart(4, '0')

  return fourDigitCode
}
