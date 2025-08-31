import { FastifyInstance } from 'fastify';
import { PointsService } from '../services/pointsService.js';
import { GameCompletionService } from '../services/gameCompletionService.js';
import { PointsHistoryQuerySchema } from '@archoops/types';
import { prisma } from '../prisma.js';
import { z } from 'zod';

export default async function pointsRoutes(fastify: FastifyInstance) {
  const pointsService = new PointsService(prisma);
  const gameCompletionService = new GameCompletionService(prisma);

  // Get current user's points summary
  fastify.get('/me/points/summary', {
    preHandler: fastify.ensureAuth(),
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      const summary = await pointsService.getUserPointsSummary(userId);
      return reply.send(summary);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch points summary' });
    }
  });

  // Get current user's points history
  fastify.get('/me/points', {
    preHandler: fastify.ensureAuth(),
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      // Transform query parameters (HTTP query params are always strings)
      const rawQuery = request.query as any;
      const query = {
        cursor: rawQuery.cursor,
        limit: rawQuery.limit ? parseInt(rawQuery.limit) : 20,
        reason: rawQuery.reason,
        gameId: rawQuery.gameId,
      };
      
      const history = await pointsService.getUserPointsHistory(userId, query);
      return reply.send(history);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch points history' });
    }
  });

  // Get points earned for a specific game
  fastify.get('/games/:gameId/my-points', {
    preHandler: fastify.ensureAuth(),
  }, async (request, reply) => {
    try {
      const { gameId } = request.params as { gameId: string };
      const userId = request.user.userId;
      const gamePoints = await pointsService.getGamePointsSummary(gameId, userId);
      
      if (!gamePoints) {
        return reply.status(404).send({ error: 'No points found for this game' });
      }
      
      return reply.send(gamePoints);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch game points' });
    }
  });

  // Score a specific prediction (internal use)
  fastify.post('/scoring/prediction/:predictionId', {
    preHandler: fastify.ensureAuth(),
  }, async (request, reply) => {
    try {
      const { predictionId } = request.params as { predictionId: string };
      
      // Only allow admins to trigger manual scoring
      if (request.user.role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
      
      const breakdown = await pointsService.scorePrediction(predictionId);
      
      if (!breakdown) {
        return reply.status(400).send({ error: 'Prediction cannot be scored or already scored' });
      }
      
      return reply.send(breakdown);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to score prediction' });
    }
  });

  // Score all predictions for a game (internal use)
  fastify.post('/scoring/game/:gameId', {
    preHandler: fastify.ensureAuth(),
  }, async (request, reply) => {
    try {
      const { gameId } = request.params as { gameId: string };
      
      // Only allow admins to trigger manual scoring
      if (request.user.role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
      
      const breakdowns = await pointsService.scoreGamePredictions(gameId);
      
      return reply.send({
        gameId,
        predictionsScored: breakdowns.length,
        breakdowns,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to score game predictions' });
    }
  });

  // Manual points adjustment (admin only)
  fastify.post('/admin/points/adjust', {
    preHandler: fastify.ensureAuth(),
  }, async (request, reply) => {
    try {
      // Only allow admins to adjust points
      if (request.user.role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
      
      const { userId, points, reason, description } = request.body as {
        userId: string;
        points: number;
        reason: string;
        description?: string;
      };
      
      const transaction = await pointsService.createPointsTransaction({
        userId,
        points,
        reason: reason as any,
        breakdown: description ? { 
          winnerPoints: 0,
          scorePoints: 0, 
          playerStatPoints: 0,
          bonusPoints: points,
          totalPoints: points,
          details: { 
            winnerCorrect: false,
          }
        } : undefined,
      });
      
      return reply.send(transaction);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to adjust points' });
    }
  });

  // Process all completed games (admin endpoint)
  fastify.post('/admin/scoring/process-completed', {
    preHandler: fastify.ensureAuth(),
  }, async (request, reply) => {
    try {
      // Only allow admins to trigger batch processing
      if (request.user.role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
      
      await gameCompletionService.processCompletedGames();
      
      return reply.send({ message: 'Completed games processed successfully' });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to process completed games' });
    }
  });

  // Manually complete a game (admin endpoint)
  fastify.post('/admin/games/:gameId/complete', {
    preHandler: fastify.ensureAuth(),
  }, async (request, reply) => {
    try {
      // Only allow admins to manually complete games
      if (request.user.role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
      
      const { gameId } = request.params as { gameId: string };
      const { homeScore, awayScore } = request.body as { homeScore: number; awayScore: number };
      
      await gameCompletionService.completeGame(gameId, homeScore, awayScore);
      
      return reply.send({ 
        message: 'Game completed and predictions scored',
        gameId,
        homeScore,
        awayScore,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to complete game' });
    }
  });

  // Simulate game completion (testing endpoint)
  fastify.post('/admin/games/:gameId/simulate-completion', {
    preHandler: fastify.ensureAuth(),
  }, async (request, reply) => {
    try {
      // Only allow admins to simulate completions
      if (request.user.role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
      
      const { gameId } = request.params as { gameId: string };
      
      await gameCompletionService.simulateGameCompletion(gameId);
      
      return reply.send({ 
        message: 'Game completion simulated and predictions scored',
        gameId,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to simulate game completion' });
    }
  });

  // Get games needing status updates
  fastify.get('/admin/games/needing-updates', {
    preHandler: fastify.ensureAuth(),
  }, async (request, reply) => {
    try {
      // Only allow admins to view this
      if (request.user.role !== 'ADMIN') {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
      
      const games = await gameCompletionService.getGamesNeedingUpdates();
      
      return reply.send(games);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch games needing updates' });
    }
  });
}
