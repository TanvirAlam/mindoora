import { z } from 'zod'

enum MessagesType {
    normal = 'normal',
    top = 'top'
  }

export const createMessagesSchema = z.object({
id: z.string().uuid(),
text: z.string().min(1).max(1000),
name: z.string().min(1).max(50),
type: z.enum([MessagesType.normal, MessagesType.top]),
roomId: z.string(),
createdAt: z.string(),
});

export type createMessagesType = z.infer<typeof createMessagesSchema>


export const updateMessagesSchema = z.object({
    id: z.string().uuid(),
    isApproved: z.boolean()
})
export type updateMessagesType = z.infer<typeof updateMessagesSchema>
