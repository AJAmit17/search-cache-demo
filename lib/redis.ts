// lib/redis.ts
import { createClient } from 'redis';
import { SearchResults } from '@/types/search';
import { SEARCH_CONSTANTS } from './constant';
import prisma from "@/lib/prisma";

// Initialize Redis client
const client = createClient({
    password: process.env.REDIS_PASSWORD || '',
    socket: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '10950')
    }
});

// Connect to Redis
client.connect().catch((err) => {
    console.error('Redis connection error:', err);
});

// Handle Redis errors
client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Generate cache key for search results
const generateCacheKey = (query: string, type: string): string => {
    return `search:${type}:${query.toLowerCase()}`;
};

// Get cached search results from Redis
export async function getCachedSearchResults(query: string, type: string): Promise<SearchResults | null> {
    const cacheKey = generateCacheKey(query, type);
    
    try {
        const cachedData = await client.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        return null;
    } catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
}

// Set search results in Redis cache
export async function setCachedSearchResults(
    query: string, 
    type: string, 
    results: SearchResults
): Promise<void> {
    const cacheKey = generateCacheKey(query, type);
    
    try {
        await client.set(
            cacheKey, 
            JSON.stringify(results), 
            {
                EX: SEARCH_CONSTANTS.CACHE_TIME
            }
        );
    } catch (error) {
        console.error('Redis set error:', error);
    }
}

// Clear cache for a specific search query
export async function clearSearchCache(query: string, type: string): Promise<void> {
    const cacheKey = generateCacheKey(query, type);
    
    try {
        await client.del(cacheKey);
    } catch (error) {
        console.error('Redis delete error:', error);
    }
}

// Clear all search caches
export async function clearAllSearchCaches(): Promise<void> {
    try {
        const keys = await client.keys('search:*');
        if (keys.length > 0) {
            await client.del(keys);
        }
    } catch (error) {
        console.error('Redis clear all error:', error);
    }
}

// Get search results with Redis caching
export async function getSearchResults(
    query: string,
    type: string
): Promise<SearchResults> {
    if (!query) return { movies: [], tvSeries: [], episodes: [] };

    try {
        // Try to get cached results first
        const cachedResults = await getCachedSearchResults(query, type);
        if (cachedResults) {
            console.log('Cache hit for:', query, type);
            return cachedResults;
        }

        console.log('Cache miss for:', query, type);

        // If no cached results, perform database search
        const searchCondition = {
            contains: query,
            mode: 'insensitive' as const
        };

        const results = await Promise.all([
            (type === "all" || type === "movie") ?
                prisma.movie.findMany({
                    where: {
                        OR: [
                            { title: searchCondition },
                            { director: searchCondition }
                        ]
                    },
                    take: SEARCH_CONSTANTS.RESULTS_PER_PAGE,
                    orderBy: { title: 'asc' }
                }) : Promise.resolve([]),

            (type === "all" || type === "tvSeries") ?
                prisma.tvSeries.findMany({
                    where: {
                        OR: [
                            { title: searchCondition },
                            { director: searchCondition }
                        ]
                    },
                    include: {
                        episodes: {
                            orderBy: [
                                { seasonNumber: 'asc' },
                                { episodeNumber: 'asc' }
                            ]
                        },
                        _count: {
                            select: { episodes: true }
                        }
                    },
                    take: SEARCH_CONSTANTS.RESULTS_PER_PAGE,
                    orderBy: { title: 'asc' }
                }) : Promise.resolve([]),

            (type === "all" || type === "episode") ?
                prisma.episode.findMany({
                    where: {
                        OR: [
                            { title: searchCondition },
                            {
                                tvSeries: {
                                    title: searchCondition
                                }
                            }
                        ]
                    },
                    include: {
                        tvSeries: {
                            select: {
                                title: true
                            }
                        }
                    },
                    take: SEARCH_CONSTANTS.RESULTS_PER_PAGE,
                    orderBy: [
                        { seasonNumber: 'asc' },
                        { episodeNumber: 'asc' }
                    ]
                }) : Promise.resolve([])
        ]);

        const searchResults = {
            movies: results[0],
            tvSeries: results[1],
            episodes: results[2]
        };

        // Cache the results
        await setCachedSearchResults(query, type, searchResults);
        console.log('Cached results for:', query, type);

        return searchResults;
    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
}

// Graceful shutdown
export async function closeRedisConnection(): Promise<void> {
    try {
        await client.quit();
    } catch (error) {
        console.error('Redis disconnect error:', error);
    }
}