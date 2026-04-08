import { Source } from '@prisma/client';

export type SourceType = Source;

export interface CreateSourceInput {
    name: string;
    slug: string;
    apiUrl: string;
    active?: boolean;
}

