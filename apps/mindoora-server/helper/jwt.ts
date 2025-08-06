import { env } from '../config'
import jwt, { JwtPayload } from 'jsonwebtoken'

interface JwtType {
  id: string
  email: string
  name: string
  role: string
  expireTime: string
}

// Generate JWT Token
export const jwtToken = ({ id, email, name, role, expireTime }: JwtType): string => {
  const token = jwt.sign(
    {
      id,
      email,
      name,
      role
    },
    env.jwt_secret,
    { expiresIn: expireTime as string | number }
  )

  return token
}

// Verify JWT Token
export const jwtTokenVerify = (token: string) => {
  let error: string | null = null
  let decode: string | JwtPayload | null = null

  jwt.verify(token, env.jwt_secret, (err, decoded) => {
    if (err) {
      return (error = err.message)
      // if(err.message === "jwt expired"){
      //     console.log("your access is expired");
      // }
      // else if (err.message === "invalid token") {
      //     console.log("your token is invalid");

      // } else if (err.message === "invalid signature") {
      //     console.log("Your token signature is invalid");
      // }else console.log("something wrong");
    } else {
      return (decode = decoded)
    }
  })
  return { decode, error }
}
