import { createClient } from 'redis';
import { SearchResults } from '@/types/search';
import { SEARCH_CONSTANTS } from './constant';
import prisma from "@/lib/prisma";
import { calculateJaccardSimilarity } from './jaccord';

const SIMILARITY_THRESHOLD = 0.2;

const LOG_COLORS = {
    BG_BLUE: '\x1b[44m',    
    FG_WHITE: '\x1b[37m',   
    RESET: '\x1b[0m'        
  } as const;

const client = createClient({
    password: process.env.REDIS_PASSWORD || '',
    socket: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '10950')
    }
});

client.connect().catch((err) => {
    console.error('Redis connection error:', err);
});

client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

const generateCacheKey = (query: string, type: string): string => {
    return `search:${type}:${query.toLowerCase()}`;
};

function logSimilarityScore(itemType: string, itemTitle: string, matchField: string, query: string, score: number) {
    console.log(
        `${LOG_COLORS.BG_BLUE}${LOG_COLORS.FG_WHITE}[Jaccard]${LOG_COLORS.RESET} ${itemType} - "${itemTitle}" ${matchField} score: ${score.toFixed(3)} for query "${query}"`
    );
}

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

export async function clearSearchCache(query: string, type: string): Promise<void> {
    const cacheKey = generateCacheKey(query, type);

    try {
        await client.del(cacheKey);
    } catch (error) {
        console.error('Redis delete error:', error);
    }
}

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

export async function getSearchResults(
    query: string,
    type: string
): Promise<SearchResults> {
    if (!query) return { movies: [], tvSeries: [], episodes: [] };

    try {
        const cachedResults = await getCachedSearchResults(query, type);
        if (cachedResults) {
            console.log('Cache hit for:', query, type);
            return cachedResults;
        }

        console.log('Cache miss for:', query, type);

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

        // <--- Simple Query results--->
        // const searchResults = {
        //     movies: results[0],
        //     tvSeries: results[1],
        //     episodes: results[2]
        // };

        // <--- Jaccobe Similarity Query results--->
        const filteredResults = {
            movies: results[0].filter(movie => {
                const titleScore = calculateJaccardSimilarity(movie.title, query);
                const directorScore = calculateJaccardSimilarity(movie.director || '', query);
                logSimilarityScore('Movie', movie.title, 'title', query, titleScore);
                logSimilarityScore('Movie', movie.title, 'director', query, directorScore);
                return titleScore > SIMILARITY_THRESHOLD || directorScore > SIMILARITY_THRESHOLD;
            }).sort((a, b) =>
                calculateJaccardSimilarity(b.title, query) -
                calculateJaccardSimilarity(a.title, query)
            ),

            tvSeries: results[1].filter(series => {
                const titleScore = calculateJaccardSimilarity(series.title, query);
                const directorScore = calculateJaccardSimilarity(series.director || '', query);
                logSimilarityScore('TV Series', series.title, 'title', query, titleScore);
                logSimilarityScore('TV Series', series.title, 'director', query, directorScore);
                return titleScore > SIMILARITY_THRESHOLD || directorScore > SIMILARITY_THRESHOLD;
            }).sort((a, b) =>
                calculateJaccardSimilarity(b.title, query) -
                calculateJaccardSimilarity(a.title, query)
            ),

            episodes: results[2].filter(episode => {
                const titleScore = calculateJaccardSimilarity(episode.title, query);
                const seriesTitleScore = calculateJaccardSimilarity(episode.tvSeries.title, query);
                logSimilarityScore('Episode', episode.title, 'title', query, titleScore);
                logSimilarityScore('Episode', episode.title, 'series title', query, seriesTitleScore);
                return titleScore > SIMILARITY_THRESHOLD || seriesTitleScore > SIMILARITY_THRESHOLD;
            }).sort((a, b) =>
                calculateJaccardSimilarity(b.title, query) -
                calculateJaccardSimilarity(a.title, query)
            )
        };

        // await setCachedSearchResults(query, type, searchResults);
        // console.log('Cached results for:', query, type);

        // return searchResults;

        await setCachedSearchResults(query, type, filteredResults);
        console.log('Cached results for:', query, type);

        return filteredResults;
    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
}

export async function closeRedisConnection(): Promise<void> {
    try {
        await client.quit();
    } catch (error) {
        console.error('Redis disconnect error:', error);
    }
}