import { cache } from 'react';
import prisma from "@/lib/prisma";
import { SearchResults } from '../types/search';
import { SEARCH_CONSTANTS } from './constant';

export const getCachedSearchResults = cache(async (
    query: string,
    type: string
): Promise<SearchResults> => {
    if (!query) return { movies: [], tvSeries: [], episodes: [] };

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

    return {
        movies: results[0],
        tvSeries: results[1],
        episodes: results[2]
    };
});