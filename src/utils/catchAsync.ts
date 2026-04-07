import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async function to catch any errors and pass them to next().
 * This removes the need for repetitive try/catch blocks in controllers.
 */
export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};
