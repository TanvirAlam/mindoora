import { z } from 'zod';

export const trophyRankEnum = z.enum(['bronze', 'silver', 'gold', 'platinum']);

export const createUserTrophySchema = z.object({
  name: z.string().min(1, 'Trophy name is required').max(100, 'Trophy name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  trophyRank: trophyRankEnum.optional().default('bronze'),
});

export const updateUserTrophySchema = z.object({
  name: z.string().min(1, 'Trophy name is required').max(100, 'Trophy name must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  trophyRank: trophyRankEnum.optional(),
});

export const getUserTrophiesSchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
});

export type CreateUserTrophy = z.infer<typeof createUserTrophySchema>;
export type UpdateUserTrophy = z.infer<typeof updateUserTrophySchema>;
export type GetUserTrophies = z.infer<typeof getUserTrophiesSchema>;
