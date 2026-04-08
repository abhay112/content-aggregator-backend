import { prisma } from '@config/database';
import { ArticleType, ArticleQueryParams } from '@appTypes/article.types';

export const findMany = async (params: ArticleQueryParams) => {
    const {
        page = 1,
        limit = 20,
        source,
        sortBy = 'publishedAt',
        order = 'desc',
        saved
    } = params;
    const skip = (page - 1) * limit;

    const where: any = { AND: [] };
    if (source) {
        where.AND.push({ source });
    }

    if (saved !== undefined) {
        where.AND.push({ isBookmarked: saved });
    }

    if (params.q) {
        where.AND.push({
            OR: [
                { title: { contains: params.q, mode: 'insensitive' } },
                { author: { contains: params.q, mode: 'insensitive' } },
                { summary: { contains: params.q, mode: 'insensitive' } },
            ]
        });
    }

    const [total, data] = await Promise.all([
        prisma.article.count({ where }),
        prisma.article.findMany({
            where,
            orderBy: { [sortBy]: order },
            skip,
            take: limit,
        }),
    ]);

    return { data, total, page, limit };
};

export const findById = async (id: string): Promise<ArticleType | null> => {
    return prisma.article.findUnique({
        where: { id },
    });
};

export const toggleBookmark = async (id: string): Promise<ArticleType | null> => {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return null;

    return prisma.article.update({
        where: { id },
        data: { isBookmarked: !article.isBookmarked },
    });
};

export const upsertMany = async (articles: any[]) => {

    // Prisma doesn't support Bulk Upsert directly with unique constraint and transaction conveniently in some cases
    // Using a manual batch loop or createMany skip duplicates
    return prisma.article.createMany({
        data: articles,
        skipDuplicates: true,
    });
};
