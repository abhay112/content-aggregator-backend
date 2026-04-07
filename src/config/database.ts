import { PrismaClient } from '@prisma/client';
import { logger } from '@utils/logger';

/**
 * ✅ PRISMA SINGLETON
 * Prevents multiple instances of Prisma Client being created in development (hot-reloading).
 */

const prismaClientSingleton = () => {
    const client = new PrismaClient({
        log: [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'info' },
            { emit: 'event', level: 'warn' },
        ],
    });

    client.$on('query', (e) => {
        logger.trace({ query: e.query, params: e.params, duration: e.duration }, 'Database Query');
    });

    client.$on('error', (e) => {
        logger.error({ error: e.message }, 'Prisma Error');
    });

    client.$on('info', (e) => {
        logger.info({ message: e.message }, 'Prisma Info');
    });

    client.$on('warn', (e) => {
        logger.warn({ message: e.message }, 'Prisma Warning');
    });

    return client;
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}
