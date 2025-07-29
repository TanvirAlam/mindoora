import { z } from 'zod'

export const gameExperienceSchema = z.object({
    roomId: z.string().uuid(),
    totalQ: z.number().min(1).max(99),
    timeTaken: z.number().min(1).max(999),
    totalText: z.number().min(1).max(999),
})
export type gameExperienceType = z.infer<typeof gameExperienceSchema>
