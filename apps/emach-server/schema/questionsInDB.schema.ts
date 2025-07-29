import { z } from 'zod'

export const questionsInDbSchema = z.object({
    type: z.string().max(50).min(1),
    difficulty: z.string().max(50).min(1),
    category: z.string().max(50).min(1),
    question: z.string().max(500).min(1),
    correct_answer: z.string().min(1).max(50),
    incorrect_answers: z.array(z.string().max(50).min(1)),
    extra_incorrect_answers: z.array(z.string().min(1).max(50)).optional()
})
export type questionsInDbType = z.infer<typeof questionsInDbSchema>
