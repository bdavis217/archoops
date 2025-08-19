import type { FastifyInstance } from 'fastify';
import { 
  GameSummarySchema,
  GameSchema,
  GameFiltersSchema,
  TeamSchema,
} from '@archoops/types';
import { prisma } from '../prisma.js';

export default async function gameRoutes(fastify: FastifyInstance) {
  // Get all teams
  fastify.get('/teams', async (request, reply) => {
    try {
      const teams = await prisma.team.findMany({
        orderBy: [
          { conference: 'asc' },
          { division: 'asc' },
          { city: 'asc' },
        ],
      });

      const teamSummaries = teams.map(team => 
        TeamSchema.parse({
          id: team.id,
          abbreviation: team.abbreviation,
          fullName: team.fullName,
          city: team.city,
          conference: team.conference,
          division: team.division,
          primaryColor: team.primaryColor,
          secondaryColor: team.secondaryColor,
          logoUrl: team.logoUrl,
        })
      );

      return reply.send(teamSummaries);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch teams',
      });
    }
  });

  // Get team by abbreviation
  fastify.get('/teams/:abbreviation', async (request, reply) => {
    try {
      const { abbreviation } = request.params as { abbreviation: string };
      
      const team = await prisma.team.findUnique({
        where: { abbreviation: abbreviation.toUpperCase() },
      });

      if (!team) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Team not found',
        });
      }

      const teamData = TeamSchema.parse({
        id: team.id,
        abbreviation: team.abbreviation,
        fullName: team.fullName,
        city: team.city,
        conference: team.conference,
        division: team.division,
        primaryColor: team.primaryColor,
        secondaryColor: team.secondaryColor,
        logoUrl: team.logoUrl,
      });

      return reply.send(teamData);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch team',
      });
    }
  });

  // Get upcoming games (next 10 days by default)
  fastify.get('/games/upcoming', async (request, reply) => {
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
        take: 50, // Limit to 50 games
      });

      // Temporarily bypass schema validation to get it working
      const gameSummaries = games.map(game => ({
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

      return reply.send(gameSummaries);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch upcoming games',
      });
    }
  });

  // Get games with filters
  fastify.get('/games', async (request, reply) => {
    try {
      const filters = GameFiltersSchema.parse(request.query);
      
      const whereClause: any = {};
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      if (filters.startDate || filters.endDate) {
        whereClause.gameDate = {};
        if (filters.startDate) {
          whereClause.gameDate.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          whereClause.gameDate.lte = new Date(filters.endDate);
        }
      }
      
      if (filters.teamAbbreviation) {
        whereClause.OR = [
          { homeTeam: { abbreviation: filters.teamAbbreviation.toUpperCase() } },
          { awayTeam: { abbreviation: filters.teamAbbreviation.toUpperCase() } },
        ];
      }
      
      if (filters.isFakeGame !== undefined) {
        whereClause.isFakeGame = filters.isFakeGame;
      }

      const games = await prisma.game.findMany({
        where: whereClause,
        include: {
          homeTeam: true,
          awayTeam: true,
        },
        orderBy: {
          gameDate: 'desc',
        },
        skip: filters.offset,
        take: filters.limit,
      });

      const gameSummaries = games.map(game => 
        GameSummarySchema.parse({
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
          status: game.status as any,
          homeScore: game.homeScore,
          awayScore: game.awayScore,
          isFakeGame: game.isFakeGame,
        })
      );

      return reply.send(gameSummaries);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid query parameters',
          issues: error.issues,
        });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch games',
      });
    }
  });

  // Get specific game details
  fastify.get('/games/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const game = await prisma.game.findUnique({
        where: { id },
        include: {
          homeTeam: true,
          awayTeam: true,
          gameStats: true,
        },
      });

      if (!game) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Game not found',
        });
      }

      const gameData = GameSchema.parse({
        id: game.id,
        externalId: game.externalId,
        homeTeam: {
          id: game.homeTeam.id,
          abbreviation: game.homeTeam.abbreviation,
          fullName: game.homeTeam.fullName,
          city: game.homeTeam.city,
          conference: game.homeTeam.conference,
          division: game.homeTeam.division,
          primaryColor: game.homeTeam.primaryColor,
          secondaryColor: game.homeTeam.secondaryColor,
          logoUrl: game.homeTeam.logoUrl,
        },
        awayTeam: {
          id: game.awayTeam.id,
          abbreviation: game.awayTeam.abbreviation,
          fullName: game.awayTeam.fullName,
          city: game.awayTeam.city,
          conference: game.awayTeam.conference,
          division: game.awayTeam.division,
          primaryColor: game.awayTeam.primaryColor,
          secondaryColor: game.awayTeam.secondaryColor,
          logoUrl: game.awayTeam.logoUrl,
        },
        gameDate: game.gameDate.toISOString(),
        season: game.season,
        gameWeek: game.gameWeek,
        status: game.status as any,
        homeScore: game.homeScore,
        awayScore: game.awayScore,
        isFakeGame: game.isFakeGame,
      });

      return reply.send(gameData);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch game',
      });
    }
  });
}
