import { z } from 'zod'

export const sendMailSchema = z.object({
  email: z.string().email().min(10).max(100),
  emailType: z.enum(['verifyEmail', 'otpEmail'])
})
export type sendMailType = z.infer<typeof sendMailSchema>
