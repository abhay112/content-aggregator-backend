import { z } from 'zod';

export const articleQuerySchema = z.object({
    page: z.string().optional().transform((v) => Number(v) || 1),
    limit: z.string().optional().transform((v) => Number(v) || 20),
    source: z.string().optional(),
    sortBy: z.enum(['publishedAt', 'fetchedAt']).optional().default('publishedAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
});
