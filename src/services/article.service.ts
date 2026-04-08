import * as ArticleRepository from '@repositories/article.repository';
import { ArticleQueryParams } from '@appTypes/article.types';
import { logger } from '@utils/logger';
import * as ArticleFetchers from './fetchers/registry';
import { articlesFetchedTotal } from '@utils/metrics';

import * as SourceRepository from '@repositories/source.repository';

export const getArticles = async (params: ArticleQueryParams) => {
    return ArticleRepository.findMany(params);
};

export const getArticleById = async (id: string) => {
    return ArticleRepository.findById(id);
};

export const toggleBookmark = async (id: string) => {
    return ArticleRepository.toggleBookmark(id);
};


export const refreshArticles = async (sourceSlug?: string) => {
    const fetcherMap: Record<string, (url: string) => Promise<any[]>> = {
        'hacker-news': ArticleFetchers.fetchHN,
        'devto': ArticleFetchers.fetchDevTo,
        'reddit-programming': ArticleFetchers.fetchReddit,
        'lobsters': ArticleFetchers.fetchLobsters,
    };

    const results: any = {};

    // Get active sources from database
    const sources = await SourceRepository.findAll(true);
    const activeSources = sourceSlug
        ? sources.filter(s => s.slug === sourceSlug)
        : sources;

    for (const source of activeSources) {
        const fetcher = fetcherMap[source.slug];
        if (!fetcher) {
            logger.warn({ slug: source.slug }, 'No fetcher found for source slug');
            continue;
        }

        try {
            logger.debug({ slug: source.slug }, 'Refreshing source...');
            const articles = await fetcher(source.apiUrl);

            if (articles.length > 0) {
                const count = await ArticleRepository.upsertMany(articles);
                articlesFetchedTotal.inc({ source: source.slug }, articles.length);
                results[source.slug] = count;

                // Update last fetched timestamp
                await SourceRepository.updateLastFetched(source.id);
            } else {
                results[source.slug] = { count: 0, status: 'no_articles' };
            }
        } catch (err: any) {
            logger.error({ slug: source.slug, err: err.message }, 'Failed to refresh source');
            results[source.slug] = { status: 'failed', error: err.message };
        }
    }

    return results;
};
