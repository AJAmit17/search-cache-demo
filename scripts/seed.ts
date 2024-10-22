// prisma/seed.ts
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting database seed...');

        // Clear existing data
        console.log('Clearing existing data...');
        await prisma.episode.deleteMany();
        await prisma.tvSeries.deleteMany();
        await prisma.movie.deleteMany();

        // Seed Movies
        console.log('Seeding movies...');
        const movies = [
            {
                title: "The Shawshank Redemption",
                director: "Frank Darabont",
                releaseYear: 1994,
                isReference: true
            },
            {
                title: "The Godfather",
                director: "Francis Ford Coppola",
                releaseYear: 1972,
                isReference: true
            },
            {
                title: "Inception",
                director: "Christopher Nolan",
                releaseYear: 2010,
                isReference: true
            },
            {
                title: "Pulp Fiction",
                director: "Quentin Tarantino",
                releaseYear: 1994,
                isReference: true
            },
            {
                title: "The Dark Knight",
                director: "Christopher Nolan",
                releaseYear: 2008,
                isReference: true
            }
        ];

        let movieCount = 0;
        for (const movie of movies) {
            await prisma.movie.create({
                data: movie
            });
            movieCount++;
        }

        console.log(`Created ${movieCount} movies`);

        // Seed TV Series with Episodes
        console.log('Seeding TV series and episodes...');
        const tvSeriesData = [
            {
                title: "Breaking Bad",
                director: "Vince Gilligan",
                isReference: true,
                episodes: [
                    { title: "Pilot", seasonNumber: 1, episodeNumber: 1, isReference: true },
                    { title: "Cat's in the Bag...", seasonNumber: 1, episodeNumber: 2, isReference: true },
                    { title: "...And the Bag's in the River", seasonNumber: 1, episodeNumber: 3, isReference: true },
                    { title: "Ozymandias", seasonNumber: 5, episodeNumber: 14, isReference: true }
                ]
            },
            {
                title: "Stranger Things",
                director: "The Duffer Brothers",
                isReference: true,
                episodes: [
                    { title: "Chapter One: The Vanishing of Will Byers", seasonNumber: 1, episodeNumber: 1, isReference: true },
                    { title: "Chapter Two: The Weirdo on Maple Street", seasonNumber: 1, episodeNumber: 2, isReference: true },
                    { title: "Chapter Four: Dear Billy", seasonNumber: 4, episodeNumber: 4, isReference: true }
                ]
            },
            {
                title: "Game of Thrones",
                director: "David Benioff & D.B. Weiss",
                isReference: true,
                episodes: [
                    { title: "Winter Is Coming", seasonNumber: 1, episodeNumber: 1, isReference: true },
                    { title: "The Rains of Castamere", seasonNumber: 3, episodeNumber: 9, isReference: true },
                    { title: "Battle of the Bastards", seasonNumber: 6, episodeNumber: 9, isReference: true }
                ]
            }
        ];

        let totalEpisodes = 0;

        for (const seriesData of tvSeriesData) {
            const { episodes, ...seriesInfo } = seriesData;

            console.log(`Creating TV series: ${seriesInfo.title}`);

            // First create the TV series
            const createdSeries = await prisma.tvSeries.create({
                data: seriesInfo
            });

            // Then create episodes with the correct tvSeriesId
            for (const episode of episodes) {
                await prisma.episode.create({
                    data: {
                        ...episode,
                        tvSeriesId: createdSeries.id
                    }
                });
                totalEpisodes++;
            }

            console.log(`Created ${episodes.length} episodes for ${seriesInfo.title}`);
        }

        console.log('\nSeeding completed successfully!');
        console.log('Summary:');
        console.log(`- Movies created: ${movieCount}`);
        console.log(`- TV Series created: ${tvSeriesData.length}`);
        console.log(`- Total episodes created: ${totalEpisodes}`);

    } catch (error) {
        console.error('Error during seeding:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((error) => {
        console.error('Fatal error during seeding:', error);
        process.exit(1);
    });