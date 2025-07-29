import { z } from 'zod'

export const createQuestionSolveSchema = z.object({
    playerId: z.string().uuid(),
    questionId: z.string().uuid(),
    answer: z.string(),
    timeTaken: z.number()
})
export type createQuestionSolveType = z.infer<typeof createQuestionSolveSchema>
