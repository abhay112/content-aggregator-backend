import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';
import { sendError } from '@utils/response';
import { config } from '@config/env';

export class AppError extends Error {
    public statusCode: number;
    public code: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_SERVER_ERROR', isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    const code = err.code || 'INTERNAL_SERVER_ERROR';

    logger.error({
        err,
        requestId: req.headers['x-request-id'],
        method: req.method,
        url: req.originalUrl,
    }, 'Error handled in Global Middleware');

    if (config.isProduction && !err.isOperational) {
        return sendError(res, 'A technical error occurred. Please try again later.', 'CRITICAL_ERROR', 500);
    }

    const stack = !config.isProduction ? err.stack : undefined;
    sendError(res, message, code, statusCode, stack);
};

// Handle unhandled exceptions and rejections
process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'UNCAUGHT EXCEPTION! Shutting down...');
    process.exit(1);
});

process.on('unhandledRejection', (err: any) => {
    logger.error({ err }, 'UNHANDLED REJECTION! Shutting down...');
    process.exit(1);
});
