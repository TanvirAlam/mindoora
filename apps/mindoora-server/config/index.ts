import * as dotenv from 'dotenv'
dotenv.config()

export const env = {
    jwt_secret: process.env.JWT_SECRETE || process.env.JWT_SECRET || 'fallback-secret-key'
}
