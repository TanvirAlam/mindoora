import { json } from 'stream/consumers'
import { z } from 'zod'

export const createQuestionSchema = z.object({
    gameId: z.string().uuid(),
    question: z.string().min(1).max(500),
    answer: z.string().max(1).optional(),
    options: z.record(z.string()),
    timeLimit: z.number().optional(),
    qSource: z.string(),
    qImage: z.string().optional(),
    qPoints: z.number().optional(),
    qTrophy: z.string().optional()
})
export type createQuestionType = z.infer<typeof createQuestionSchema>

export const updateQuestionSchema = z.object({
    id: z.string().uuid(),
    question: z.string().min(1).max(500).optional(),
    answer: z.string().max(1).optional(),
    options: z.record(z.string()),
    timeLimit: z.number().optional(),
    qSource: z.string(),
    qImage: z.string().optional(),
    qPoints: z.number().optional(),
    qTrophy: z.string().optional()
})
export type updateQuestionType = z.infer<typeof updateQuestionSchema>
