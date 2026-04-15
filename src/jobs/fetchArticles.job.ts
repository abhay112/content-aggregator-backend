import cron from 'node-cron';
import { logger } from '@utils/logger';
import * as ArticleService from '@services/article.service';
import { cronJobLastRunTimestamp, cronJobSuccessTotal, cronJobFailureTotal } from '@utils/metrics';

const JOB_NAME = 'fetchArticlesJob';

/**
 * Background job to fetch and normalize articles from all active sources.
 * Runs every 15 minutes.
 */
export const startFetchJob = () => {
    // 0, 15, 30, 45 * * * *
    cron.schedule('*/15 * * * *', async () => {
        const startTime = new Date();
        logger.info({ job: JOB_NAME, startTime }, 'Starting background fetch articles job');

        try {
            const result = await ArticleService.triggerRefresh();

            const endTime = new Date();
            const duration = (endTime.getTime() - startTime.getTime()) / 1000;

            logger.info({
                job: JOB_NAME,
                durationSeconds: duration,
                result
            }, 'Successfully completed background fetch articles job');

            // Update Prometheus metrics
            cronJobLastRunTimestamp.set({ job_name: JOB_NAME }, Math.floor(Date.now() / 1000));
            cronJobSuccessTotal.inc({ job_name: JOB_NAME });

        } catch (error: any) {
            logger.error({
                job: JOB_NAME,
                error: error.message,
                stack: error.stack
            }, 'Failed to execute background fetch articles job');

            // Increment failure counter
            cronJobFailureTotal.inc({ job_name: JOB_NAME });
        }
    });

    logger.info({ job: JOB_NAME }, 'Background articles fetcher initialized (Every 15m)');
};
