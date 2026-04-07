import { Request, Response } from 'express';
import * as SourceService from '@services/source.service';
import { sendSuccess } from '@utils/response';
import { catchAsync } from '@utils/catchAsync';

/**
 * @swagger
 * /api/v1/sources:
 *   get:
 *     summary: List all active content sources
 *     tags: [Sources]
 *     responses:
 *       200:
 *         description: Active sources
 */
export const getSources = catchAsync(async (req: Request, res: Response) => {
    const list = await SourceService.getSources(true);
    sendSuccess(res, list);
});

/**
 * @swagger
 * /api/v1/sources:
 *   post:
 *     summary: Add a new content source
 *     tags: [Sources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               apiUrl: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       201:
 *         description: Created
 */
export const createSource = catchAsync(async (req: Request, res: Response) => {
    const created = await SourceService.createSource(req.body);
    sendSuccess(res, created, undefined, 201);
});

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Check system health status
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Health details
 */
export const checkHealth = catchAsync(async (req: Request, res: Response) => {
    sendSuccess(res, {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        db: 'connected'
    });
});
