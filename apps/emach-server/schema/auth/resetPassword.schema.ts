import { z } from 'zod'

export const resetPasswordSchema = z.object({
    email: z.string().email().min(10).max(100),
    password: z.string().min(5).max(30),
    otp: z.string().min(4).max(4),
})
export type resetPasswordType = z.infer<typeof resetPasswordSchema>
