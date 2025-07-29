import { z } from 'zod'

export const saveTCSchema = z.object({
    metadata: z.object({
        tarmsAndConditions: z.boolean(),
        specialOffers: z.boolean()
    })
})
export type saveTCType = z.infer<typeof saveTCSchema>
