import { z } from 'zod'

export const createUserGameSchema = z.object({
    title: z.string().min(3).max(100),
    language: z.string().min(2).max(2),
    nPlayer: z.string().min(1).max(100)
})
export type createUserGameType = z.infer<typeof createUserGameSchema>

export const updateUserGameSchema = z.object({
    id: z.string(),
    title: z.string().min(3).max(100).optional(),
    language: z.string().min(2).max(2).optional(),
    nPlayer: z.string().min(1).max(100).optional()
})
export type updateUserGameType = z.infer<typeof updateUserGameSchema>
