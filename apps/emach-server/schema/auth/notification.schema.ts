import { z } from 'zod'

export const createNotificationSchema = z.object({
    to: z.array(z.string().uuid()),
})
export type createNotificationType = z.infer<typeof createNotificationSchema>
