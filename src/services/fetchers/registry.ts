import { NormalizedArticle } from '@appTypes/article.types';
import { genericFetcher } from '@utils/fetcher.utils';


export const fetchHN = (apiUrl: string): Promise<NormalizedArticle[]> => {
    return genericFetcher(apiUrl, 'hacker-news', (data: any) =>
        (data.hits || []).map((hit: any) => ({
            externalId: hit.objectID,
            title: hit.title,
            url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
            source: 'hacker-news',
            author: hit.author || 'Unknown',
            summary: '',
            publishedAt: new Date(hit.created_at).toISOString(),
            tags: hit._tags || [],
        }))
    );
};

export const fetchDevTo = (apiUrl: string): Promise<NormalizedArticle[]> => {
    return genericFetcher(apiUrl, 'devto', (data: any[]) =>
        data.map((article: any) => ({
            externalId: article.id.toString(),
            title: article.title,
            url: article.url,
            source: 'devto',
            author: article.user?.name || 'Unknown',
            summary: article.description || '',
            publishedAt: article.published_at || new Date().toISOString(),
            tags: article.tag_list || [],
        }))
    );
};

export const fetchReddit = (apiUrl: string): Promise<NormalizedArticle[]> => {
    return genericFetcher(apiUrl, 'reddit-programming', (data: any) =>
        (data.data?.children || []).map((post: any) => ({
            externalId: post.data.id,
            title: post.data.title,
            url: `https://reddit.com${post.data.permalink}`,
            source: `reddit-programming`,
            author: post.data.author || 'Unknown',
            summary: '',
            publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
            tags: ['programming'],
        }))
    );
};

export const fetchLobsters = (apiUrl: string): Promise<NormalizedArticle[]> => {
    return genericFetcher(apiUrl, 'lobsters', (data: any[]) =>
        data.map((story: any) => ({
            externalId: story.short_id,
            title: story.title,
            url: story.url || story.comments_url,
            source: 'lobsters',
            author: story.submitter_user?.username || 'Unknown',
            summary: story.description || '',
            publishedAt: story.created_at || new Date().toISOString(),
            tags: story.tags || [],
        }))
    );
};
