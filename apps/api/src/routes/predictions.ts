import type { FastifyInstance } from 'fastify';
import { 
  CreatePredictionSchema,
  UpdatePredictionSchema,
  PredictionSchema,
  LeaderboardSchema,
  LeaderboardEntrySchema,
} from '@archoops/types';
import { prisma } from '../prisma.js';

export default async function predictionRoutes(fastify: FastifyInstance) {
  // Create a new prediction
  fastify.post('/predictions', {
    preHandler: fastify.ensureAuth()
  }, async (request, reply) => {
    try {
      const data = CreatePredictionSchema.parse(request.body);
      const userId = request.user.userId;

      // Check if game exists and is not locked
      const game = await prisma.game.findUnique({
        where: { id: data.gameId },
      });

      if (!game) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Game not found',
        });
      }

      // Check if game has already started (is locked)
      const now = new Date();
      if (game.gameDate <= now || game.status !== 'SCHEDULED') {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Cannot make predictions for games that have already started',
        });
      }

      // Check if user already has a prediction for this game
      const existingPrediction = await prisma.prediction.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId: data.gameId,
          },
        },
      });

      if (existingPrediction) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'You already have a prediction for this game',
        });
      }

      // Create the prediction
      const prediction = await prisma.prediction.create({
        data: {
          userId,
          gameId: data.gameId,
          predictionType: data.predictionType,
          predictedWinner: data.predictedWinner,
          predictedHomeScore: data.predictedHomeScore,
          predictedAwayScore: data.predictedAwayScore,
          playerStatPredictions: data.playerStatPredictions ? JSON.stringify(data.playerStatPredictions) : null,
          isLocked: false,
        },
      });

      const predictionResponse = PredictionSchema.parse({
        id: prediction.id,
        userId: prediction.userId,
        gameId: prediction.gameId,
        predictionType: prediction.predictionType,
        predictedWinner: prediction.predictedWinner,
        predictedHomeScore: prediction.predictedHomeScore,
        predictedAwayScore: prediction.predictedAwayScore,
        playerStatPredictions: prediction.playerStatPredictions ? JSON.parse(prediction.playerStatPredictions) : undefined,
        submittedAt: prediction.submittedAt.toISOString(),
        isLocked: prediction.isLocked,
        accuracyScore: prediction.accuracyScore,
        pointsEarned: prediction.pointsEarned,
      });

      return reply.code(201).send(predictionResponse);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid prediction data',
          issues: error.issues,
        });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create prediction',
      });
    }
  });

  // Get user's predictions
  fastify.get('/predictions/my', {
    preHandler: fastify.ensureAuth()
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { limit = 20, offset = 0 } = request.query as { limit?: number; offset?: number };

      const predictions = await prisma.prediction.findMany({
        where: { userId },
        include: {
          game: {
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
        skip: offset,
        take: limit,
      });

      const predictionResponses = predictions.map(prediction => ({
        ...PredictionSchema.parse({
          id: prediction.id,
          userId: prediction.userId,
          gameId: prediction.gameId,
          predictionType: prediction.predictionType,
          predictedWinner: prediction.predictedWinner,
          predictedHomeScore: prediction.predictedHomeScore,
          predictedAwayScore: prediction.predictedAwayScore,
          playerStatPredictions: prediction.playerStatPredictions ? JSON.parse(prediction.playerStatPredictions) : undefined,
          submittedAt: prediction.submittedAt.toISOString(),
          isLocked: prediction.isLocked,
          accuracyScore: prediction.accuracyScore,
          pointsEarned: prediction.pointsEarned,
        }),
        game: {
          id: prediction.game.id,
          homeTeam: {
            abbreviation: prediction.game.homeTeam.abbreviation,
            fullName: prediction.game.homeTeam.fullName,
          },
          awayTeam: {
            abbreviation: prediction.game.awayTeam.abbreviation,
            fullName: prediction.game.awayTeam.fullName,
          },
          gameDate: prediction.game.gameDate.toISOString(),
          status: prediction.game.status,
          homeScore: prediction.game.homeScore,
          awayScore: prediction.game.awayScore,
        },
      }));

      return reply.send(predictionResponses);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch predictions',
      });
    }
  });

  // Update a prediction (before game starts)
  fastify.put('/predictions/:id', {
    preHandler: fastify.ensureAuth()
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = UpdatePredictionSchema.parse(request.body);
      const userId = request.user.userId;

      // Check if prediction exists and belongs to user
      const existingPrediction = await prisma.prediction.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          game: true,
        },
      });

      if (!existingPrediction) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Prediction not found',
        });
      }

      // Check if game is still open for predictions
      const now = new Date();
      if (existingPrediction.game.gameDate <= now || existingPrediction.game.status !== 'SCHEDULED') {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Cannot update predictions for games that have already started',
        });
      }

      // Update the prediction
      const updatedPrediction = await prisma.prediction.update({
        where: { id },
        data: {
          predictionType: data.predictionType || existingPrediction.predictionType,
          predictedWinner: data.predictedWinner !== undefined ? data.predictedWinner : existingPrediction.predictedWinner,
          predictedHomeScore: data.predictedHomeScore !== undefined ? data.predictedHomeScore : existingPrediction.predictedHomeScore,
          predictedAwayScore: data.predictedAwayScore !== undefined ? data.predictedAwayScore : existingPrediction.predictedAwayScore,
          playerStatPredictions: data.playerStatPredictions ? JSON.stringify(data.playerStatPredictions) : existingPrediction.playerStatPredictions,
        },
      });

      const predictionResponse = PredictionSchema.parse({
        id: updatedPrediction.id,
        userId: updatedPrediction.userId,
        gameId: updatedPrediction.gameId,
        predictionType: updatedPrediction.predictionType,
        predictedWinner: updatedPrediction.predictedWinner,
        predictedHomeScore: updatedPrediction.predictedHomeScore,
        predictedAwayScore: updatedPrediction.predictedAwayScore,
        playerStatPredictions: updatedPrediction.playerStatPredictions ? JSON.parse(updatedPrediction.playerStatPredictions) : undefined,
        submittedAt: updatedPrediction.submittedAt.toISOString(),
        isLocked: updatedPrediction.isLocked,
        accuracyScore: updatedPrediction.accuracyScore,
        pointsEarned: updatedPrediction.pointsEarned,
      });

      return reply.send(predictionResponse);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid prediction data',
          issues: error.issues,
        });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update prediction',
      });
    }
  });

  // Delete a prediction (before game starts)
  fastify.delete('/predictions/:id', {
    preHandler: fastify.ensureAuth()
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.userId;

      // Check if prediction exists and belongs to user
      const existingPrediction = await prisma.prediction.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          game: true,
        },
      });

      if (!existingPrediction) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Prediction not found',
        });
      }

      // Check if game is still open for predictions
      const now = new Date();
      if (existingPrediction.game.gameDate <= now || existingPrediction.game.status !== 'SCHEDULED') {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Cannot delete predictions for games that have already started',
        });
      }

      await prisma.prediction.delete({
        where: { id },
      });

      return reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete prediction',
      });
    }
  });

  // Get class leaderboard
  fastify.get('/predictions/leaderboard/:classId', {
    preHandler: fastify.ensureAuth()
  }, async (request, reply) => {
    try {
      const { classId } = request.params as { classId: string };
      const userId = request.user.userId;

      // Check if user has access to this class
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          classId,
          OR: [
            { userId }, // User is enrolled as student
            { class: { teacherId: userId } }, // User is the teacher
          ],
        },
        include: {
          class: true,
        },
      });

      if (!enrollment) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'You do not have access to this class',
        });
      }

      // Get all students in the class
      const enrollments = await prisma.enrollment.findMany({
        where: { classId },
        include: {
          user: true,
        },
      });

      // Calculate leaderboard entries
      const leaderboardEntries = await Promise.all(
        enrollments.map(async (enrollment) => {
          const predictions = await prisma.prediction.findMany({
            where: { userId: enrollment.userId },
            include: {
              game: true,
            },
          });

          const totalPredictions = predictions.length;
          const correctPredictions = predictions.filter(p => p.accuracyScore && p.accuracyScore > 50).length;
          const totalPoints = predictions.reduce((sum, p) => sum + (p.pointsEarned || 0), 0);
          const accuracyPercentage = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;

          // Calculate current streak
          let currentStreak = 0;
          const sortedPredictions = predictions
            .filter(p => p.game.status === 'COMPLETED' && p.accuracyScore !== null)
            .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

          for (const prediction of sortedPredictions) {
            if (prediction.accuracyScore && prediction.accuracyScore > 50) {
              currentStreak++;
            } else {
              break;
            }
          }

          // Calculate best streak (simplified - would need more complex logic for actual implementation)
          const bestStreak = currentStreak; // Placeholder

          return LeaderboardEntrySchema.parse({
            userId: enrollment.userId,
            displayName: enrollment.user.displayName,
            totalPoints,
            totalPredictions,
            correctPredictions,
            accuracyPercentage: Math.round(accuracyPercentage * 100) / 100,
            currentStreak,
            bestStreak,
          });
        })
      );

      // Sort by total points (descending)
      leaderboardEntries.sort((a, b) => b.totalPoints - a.totalPoints);

      const leaderboard = LeaderboardSchema.parse({
        classId,
        entries: leaderboardEntries,
        generatedAt: new Date().toISOString(),
      });

      return reply.send(leaderboard);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate leaderboard',
      });
    }
  });
}
