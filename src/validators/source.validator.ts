import { z } from 'zod';

export const createSourceSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    apiUrl: z.string().url('API URL must be valid'),
    isActive: z.boolean().optional().default(true),
});
