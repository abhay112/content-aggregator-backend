import axios, { AxiosResponse } from 'axios';
import { logger } from '@utils/logger';
import { NormalizedArticle } from '@appTypes/article.types';
import { retryRequest } from '@utils/retryRequest';
import { fetchFailuresTotal } from '@utils/metrics';

/**
 * Generic fetcher to handle axios logic, retry, and basic error logging.
 * Reduces boilerplate in individual fetchers.
 */
export const genericFetcher = async <T = any>(
    apiUrl: string,
    sourceSlug: string,
    mapper: (data: T) => NormalizedArticle[]
): Promise<NormalizedArticle[]> => {
    try {
        const response: AxiosResponse<T> = await retryRequest(() =>
            axios.get(apiUrl, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'ContentAggregator/1.0'
                }
            }),
            3,
            1000,
            sourceSlug
        );

        return mapper(response.data);
    } catch (error: any) {
        logger.error({
            source: sourceSlug,
            error: error.message,
            apiUrl
        }, `Fetch failure for ${sourceSlug} after retries`);

        fetchFailuresTotal.inc({
            source: sourceSlug,
            error_type: error.code || 'UNKNOWN'
        });

        return [];
    }
};
