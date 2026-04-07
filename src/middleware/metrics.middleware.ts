import { Request, Response, NextFunction } from 'express';
import { httpRequestsTotal, httpRequestDurationSeconds } from '@utils/metrics';

export const metricsMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const start = process.hrtime();
    const path = req.route ? req.route.path : req.url;

    res.on('finish', () => {
        const duration = process.hrtime(start);
        const durationInSeconds = duration[0] + duration[1] / 1e9;
        const statusCode = res.statusCode.toString();

        // Increment request count
        httpRequestsTotal.inc({
            method: req.method,
            route: path,
            status_code: statusCode,
        });

        // Record request duration
        httpRequestDurationSeconds.observe(
            {
                method: req.method,
                route: path,
            },
            durationInSeconds
        );
    });

    next();
};
