import { z } from 'zod'

export const createGamePlayersSchema = z.object({
    inviteCode: z.string().min(6).max(6),
    name: z.string().min(3).max(50)
})
export type createGamePlayersType = z.infer<typeof createGamePlayersSchema>


export const updateGamePlayerStatusSchema = z.object({
    id: z.string().uuid(),
    isApproved: z.boolean()
})
export type updateGamePlayerStatusType = z.infer<typeof updateGamePlayerStatusSchema>

export const updateConfirmAllGamePlayerSchema = z.object({
    roomId: z.string().uuid()
})
export type updateConfirmAllGamePlayerType = z.infer<typeof updateConfirmAllGamePlayerSchema>
