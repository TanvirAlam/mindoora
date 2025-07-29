import { z } from 'zod'

export const sendRequestSchema = z.object({
    friendId: z.string().uuid()
})
export type sendRequestType = z.infer<typeof sendRequestSchema>

export const acceptRejectRequestSchema = z.object({
    userId: z.string().uuid()
})
export type acceptRejectRequestType = z.infer<typeof acceptRejectRequestSchema>
