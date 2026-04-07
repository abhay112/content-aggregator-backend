import pino from 'pino';
import { config } from '@config/env';

const logger = pino({
    level: config.logLevel,
    base: {
        service: config.serviceName,
        environment: config.env,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
});

export { logger };
