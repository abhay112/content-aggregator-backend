import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './errorHandler';

/**
 * Validates request body, query params, or route params using a Zod schema.
 * Throws AppError(400) on validation failure.
 *
 * NOTE: In Express 5, req.query is a read-only getter and cannot be reassigned.
 * We skip the write-back for 'query' — validation has passed so req.query is safe to use as-is.
 */
export const validate = (
    schema: ZodSchema,
    property: 'body' | 'query' | 'params' = 'body'
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[property]);

        if (!result.success) {
            const errorMessages = result.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            return next(new AppError('Validation failure', 400, 'VALIDATION_FAILED', errorMessages as any));
        }

        // req.query is read-only in Express 5 / Node 20+ — skip assignment for it
        if (property === 'body' || property === 'params') {
            (req as any)[property] = result.data;
        }

        next();
    };
};
