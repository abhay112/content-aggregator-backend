import express from 'express';
import { app } from './app';
import { config } from '@config/env';
import { logger } from '@utils/logger';
import { metricsRegister } from '@utils/metrics';
import { startFetchJob } from '@jobs/fetchArticles.job';
import { prisma } from '@config/database';
import * as ArticleService from '@services/article.service';

// 1. Database Health Check
const startServer = async (): Promise<void> => {
    try {
        // Test database connection
        await prisma.$connect();
        logger.info('Database connected successfully');

        // 2. Main API Server (Port 6001)
        app.listen(config.port, '0.0.0.0', () => {
            logger.info({
                port: config.port,
                env: config.env,
                docs: `http://localhost:${config.port}/api/docs`,
                grafana: config.grafanaUrl,
            }, 'Main API server started');

            if (!config.isProduction) {
                console.log('\n🚀  Server is ready!');
                console.log(`📡  Main API:    http://localhost:${config.port}`);
                console.log(`📝  Swagger API: http://localhost:${config.port}/api/docs`);
                console.log(`📊  Grafana:     ${config.grafanaUrl}`);
                console.log(`📈  Metrics:     http://localhost:${config.metricsPort}/metrics\n`);
            }
        });

        // 3. Metrics Server (Port 6002)
        const metricsApp = express();
        metricsApp.get('/metrics', async (req, res) => {
            try {
                res.set('Content-Type', metricsRegister.contentType);
                res.end(await metricsRegister.metrics());
            } catch (ex) {
                res.status(500).send(ex);
            }
        });

        metricsApp.listen(config.metricsPort, '0.0.0.0', () => {
            logger.info({ port: config.metricsPort }, 'Prometheus metrics server started');
        });

        // 4. Start Background Jobs
        startFetchJob();

        // 5. Trigger initial fetch immediately on startup
        logger.info('Performing initial content fetch...');
        ArticleService.triggerRefresh()
            .then((res: any) => logger.info({ res }, 'Initial fetch completed'))
            .catch((err: any) => logger.error({ err }, 'Initial startup tasks failed'));


    } catch (error) {
        logger.fatal({ err: error }, 'Failed to start server');
        process.exit(1);
    }
};

// Graceful shutdown
const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Closing server gracefully...');
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
