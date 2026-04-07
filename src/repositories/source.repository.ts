import { prisma } from '@config/database';
import { CreateSourceInput, SourceType } from '@appTypes/source.types';

export const findAll = async (isActive?: boolean): Promise<SourceType[]> => {
    return prisma.source.findMany({
        where: isActive === undefined ? {} : { isActive },
    });
};

export const create = async (data: CreateSourceInput): Promise<SourceType> => {
    return prisma.source.create({
        data,
    });
};

export const updateLastFetched = async (id: string): Promise<SourceType> => {
    return prisma.source.update({
        where: { id },
        data: { lastFetchedAt: new Date() },
    });
};
