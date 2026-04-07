import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const DEFAULT_SOURCES = [
        {
            name: 'Hacker News',
            slug: 'hacker-news',
            apiUrl: 'https://hn.algolia.com/api/v1/search?tags=front_page'
        },
        {
            name: 'Dev.to',
            slug: 'devto',
            apiUrl: 'https://dev.to/api/articles'
        },
        {
            name: 'Reddit Programming',
            slug: 'reddit-programming',
            apiUrl: 'https://www.reddit.com/r/programming/top.json?limit=25'
        },
        {
            name: 'Lobste.rs',
            slug: 'lobsters',
            apiUrl: 'https://lobste.rs/hottest.json'
        }
    ];

    console.log('🚀 Seeding initial content sources...');

    for (const source of DEFAULT_SOURCES) {
        await prisma.source.upsert({
            where: { slug: source.slug },
            update: {},
            create: source,
        });
    }

    console.log('✅ Seeding complete. Your sources are now in the database.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
