import { Request, Response } from 'express';
import * as ArticleService from '@services/article.service';
import { sendSuccess } from '@utils/response';
import { AppError } from '@middleware/errorHandler';
import { catchAsync } from '@utils/catchAsync';

/**
 * @swagger
 * /api/v1/articles:
 *   get:
 *     summary: Retrieve a paginated list of articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: source
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of articles retrieved successfully
 */
export const getArticles = catchAsync(async (req: Request, res: Response) => {
    const { page, limit, source, sortBy, order } = req.query;
    const result = await ArticleService.getArticles({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        source: source as string,
        sortBy: sortBy as any,
        order: order as any,
    });

    sendSuccess(res, result.data, {
        page: result.page,
        limit: result.limit,
        total: result.total,
    });
});

/**
 * @swagger
 * /api/v1/articles/{id}:
 *   get:
 *     summary: Return a single article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Article object
 *       404:
 *         description: Article not found
 */
export const getArticleById = catchAsync(async (req: Request, res: Response) => {
    const article = await ArticleService.getArticleById(req.params.id);
    if (!article) {
        throw new AppError('Article not found', 404, 'ARTICLE_NOT_FOUND');
    }
    sendSuccess(res, article);
});

/**
 * @swagger
 * /api/v1/refresh:
 *   post:
 *     summary: Manually trigger a refresh for all active sources
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Refresh task completed
 */
export const refreshArticles = catchAsync(async (req: Request, res: Response) => {
    const result = await ArticleService.refreshArticles();
    sendSuccess(res, result);
});
