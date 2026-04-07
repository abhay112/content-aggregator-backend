import { NormalizedArticle } from '@appTypes/article.types';

/**
 * Normalizes articles ensuring all mandatory fields have sensible defaults 
 * and dates are ISO strings.
 */
export const normalize = (rawArticles: any[], sourceName: string): NormalizedArticle[] => {
    return rawArticles.map((article) => ({
        externalId: article.externalId || null,
        title: article.title || 'Untitled',
        url: article.url || '',
        source: sourceName,
        author: article.author || 'Unknown',
        summary: article.summary || '',
        publishedAt: article.publishedAt || new Date().toISOString(),
        tags: Array.isArray(article.tags) ? article.tags : [],
    }));
};
