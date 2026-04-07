import { prisma } from '@config/database';
import { ArticleType, ArticleQueryParams } from '@appTypes/article.types';

export const findMany = async (params: ArticleQueryParams) => {
    const {
        page = 1,
        limit = 20,
        source,
        sortBy = 'publishedAt',
        order = 'desc',
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (source) {
        where.source = source;
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

export const upsertMany = async (articles: any[]) => {
    // Prisma doesn't support Bulk Upsert directly with unique constraint and transaction conveniently in some cases
    // Using a manual batch loop or createMany skip duplicates
    return prisma.article.createMany({
        data: articles,
        skipDuplicates: true,
    });
};
