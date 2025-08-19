import type { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';

export default async function debugGameRoutes(fastify: FastifyInstance) {
  // Simple debug endpoint without schema validation
  fastify.get('/debug/games', async (request, reply) => {
    try {
      const now = new Date();
      const tenDaysFromNow = new Date();
      tenDaysFromNow.setDate(now.getDate() + 10);

      const games = await prisma.game.findMany({
        where: {
          gameDate: {
            gte: now,
            lte: tenDaysFromNow,
          },
          status: 'SCHEDULED',
        },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
        orderBy: {
          gameDate: 'asc',
        },
        take: 5, // Just get 5 for testing
      });

      // Return raw data without schema validation
      const simplifiedGames = games.map(game => ({
        id: game.id,
        homeTeam: {
          abbreviation: game.homeTeam.abbreviation,
          fullName: game.homeTeam.fullName,
          primaryColor: game.homeTeam.primaryColor,
        },
        awayTeam: {
          abbreviation: game.awayTeam.abbreviation,
          fullName: game.awayTeam.fullName,
          primaryColor: game.awayTeam.primaryColor,
        },
        gameDate: game.gameDate.toISOString(),
        status: game.status,
        homeScore: game.homeScore,
        awayScore: game.awayScore,
        isFakeGame: game.isFakeGame,
      }));

      return reply.send({
        count: games.length,
        games: simplifiedGames
      });
    } catch (error) {
      fastify.log.error('Debug games error:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message,
        stack: error.stack,
      });
    }
  });
}
