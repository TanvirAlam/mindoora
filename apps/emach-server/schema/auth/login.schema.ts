import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email().min(10).max(100),
  password: z.string().min(5).max(30)
})

export type loginType = z.infer<typeof loginSchema>
