import { v4 as uuidv4 } from 'uuid';
import pinoHttp from 'pino-http';
import { logger } from '@utils/logger';

export const requestLogger = pinoHttp({
    logger,
    genReqId: (req) => req.headers['x-request-id'] || uuidv4(),
    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
        if (res.statusCode >= 500 || err) return 'error';
        return 'info';
    },
    serializers: {
        req(req) {
            return {
                id: req.id,
                method: req.method,
                url: req.url,
            };
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
    customSuccessMessage: (req, res, responseTime) => {
        return `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`;
    },
});
