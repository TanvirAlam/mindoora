import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email().min(10).max(100),
  password: z.string().min(5).max(30),
  image: z.string().url(),
  role: z.string().max(10),
  verified: z.boolean().default(false),
  trueCode: z.string().optional()
})
export type registerType = z.infer<typeof registerSchema>
