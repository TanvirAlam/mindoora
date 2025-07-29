import { z } from 'zod'

export const createFollowSchema = z.object({
    followingId: z.string().uuid()
})
export type createFollowType = z.infer<typeof createFollowSchema>
