import { AxiosError, AxiosResponse } from 'axios';
import { logger } from '@utils/logger';
import { fetchRetriesTotal } from '@utils/metrics';

/**
 * Retries an async function with exponential backoff.
 * Retries on 5xx errors or network-related errors (e.g. timeouts).
 * Skips 4xx errors.
 */
export const retryRequest = async <T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries: number = 3,
    initialDelay: number = 1000,
    sourceSlug?: string
): Promise<AxiosResponse<T>> => {
    let lastError: any;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await requestFn();
        } catch (error: any) {
            lastError = error;
            const axiosError = error as AxiosError;

            // Check if error status is 4xx (except 429) - don't retry on most 4xx errors
            // But retry on 429 (Too Many Requests), 5xx, or network issues/timeouts
            const status = axiosError.response?.status;
            const isRetryable =
                !status || // Network error (no response)
                status === 429 || // Too Many Requests
                (status >= 500 && status < 600); // Server error

            if (!isRetryable || attempt === retries) {
                break; // Don't retry
            }

            const delay = initialDelay * Math.pow(2, attempt - 1);
            logger.warn({
                attempt,
                nextDelay: delay,
                status,
                code: axiosError.code,
                message: axiosError.message,
                sourceSlug
            }, 'Transient request failure, retrying...');

            if (sourceSlug) {
                fetchRetriesTotal.inc({ source: sourceSlug });
            }

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
};
