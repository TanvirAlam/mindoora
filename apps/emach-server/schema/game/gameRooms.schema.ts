import { z } from 'zod'

export const createGameRoomSchema = z.object({
    gameId: z.string().uuid(),
})
export type createGameRoomType = z.infer<typeof createGameRoomSchema>

export const updateGameRoomStatusSchema = z.object({
    id: z.string().uuid(),
    status: z.enum(['live', 'finished', 'closed'])
})
export type updateGameRoomStatusType = z.infer<typeof updateGameRoomStatusSchema>
