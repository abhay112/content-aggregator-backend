import { Article } from '@prisma/client';

export type ArticleType = Article;

export interface NormalizedArticle {
    externalId: string | null;
    title: string;
    url: string;
    source: string;
    author: string;
    summary: string;
    publishedAt: string; // ISO String
    tags: string[];
}

export interface ArticleQueryParams {
    page?: number;
    limit?: number;
    source?: string;
    q?: string;
    saved?: boolean;
    sortBy?: 'publishedAt' | 'fetchedAt';
    order?: 'asc' | 'desc';
}


