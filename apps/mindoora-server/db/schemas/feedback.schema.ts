import { z } from 'zod'

export const createFeedbackSchema = z.object({
    score: z.string().max(1),
    feedback: z.string().max(100)
})
export type createFeedbackType = z.infer<typeof createFeedbackSchema>

export const createGameScoreSchema = z.object({
    score: z.string().max(1),
    gameId: z.string().uuid(),
    playerId: z.string().uuid()
})
export type createGameScoreType = z.infer<typeof createGameScoreSchema>
