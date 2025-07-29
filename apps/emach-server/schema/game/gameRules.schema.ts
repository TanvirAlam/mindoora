import { z } from 'zod'

export const createGameRulesSchema = z.object({
    name: z.string().min(3).max(50),
    description: z.string().min(5).max(1000),
    isActive: z.boolean()
})
export type createGameRulesType = z.infer<typeof createGameRulesSchema>

export const updateGameRulesSchema = z.object({
    id: z.string(),
    name: z.string().min(3).max(50).optional(),
    description: z.string().min(5).max(1000).optional(),
    isActive: z.boolean().optional()
})
export type updateGameRulesType = z.infer<typeof updateGameRulesSchema>
