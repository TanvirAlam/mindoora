import { z } from 'zod'

export const createGameDetailsSchema = z.object({
    gameId: z.string().uuid(),
    imgUrl: z.string().url().optional(),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
    category: z.string().optional(),
    theme: z.string().optional(),
    keyWords: z.array(z.string()).optional()
})
export type createGameDetailsType = z.infer<typeof createGameDetailsSchema>

export const updateGameDetailsSchema = z.object({
    gameId: z.string().uuid(),
    imgUrl: z.string().url().optional(),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
    category: z.string().optional(),
    theme: z.string().optional(),
    keyWords: z.array(z.string()).optional()
})
export type updateGameDetailsType = z.infer<typeof updateGameDetailsSchema>
