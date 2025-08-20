import { PrismaClient } from '@prisma/client';
import { PointsService } from './pointsService.js';

export class GameCompletionService {
  private prisma: PrismaClient;
  private pointsService: PointsService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.pointsService = new PointsService(prisma);
  }

  /**
   * Check for newly completed games and score their predictions
   */
  async processCompletedGames(): Promise<void> {
    try {
      // Find games that are completed but haven't been processed for scoring
      const completedGames = await this.prisma.game.findMany({
        where: {
          status: 'COMPLETED',
          homeScore: { not: null },
          awayScore: { not: null },
          predictions: {
            some: {
              pointsEarned: null, // Has unscored predictions
            },
          },
        },
        include: {
          predictions: {
            where: {
              pointsEarned: null,
            },
          },
        },
      });

      console.log(`Found ${completedGames.length} completed games with unscored predictions`);

      for (const game of completedGames) {
        console.log(`Processing game ${game.id} with ${game.predictions.length} unscored predictions`);
        
        try {
          const breakdowns = await this.pointsService.scoreGamePredictions(game.id);
          console.log(`Scored ${breakdowns.length} predictions for game ${game.id}`);
        } catch (error) {
          console.error(`Failed to score predictions for game ${game.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing completed games:', error);
    }
  }

  /**
   * Manually mark a game as completed and trigger scoring
   */
  async completeGame(gameId: string, homeScore: number, awayScore: number): Promise<void> {
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'COMPLETED',
        homeScore,
        awayScore,
        updatedAt: new Date(),
      },
    });

    // Score all predictions for this game
    await this.pointsService.scoreGamePredictions(gameId);
  }

  /**
   * Update game status and scores, trigger scoring if completed
   */
  async updateGameStatus(gameId: string, status: string, homeScore?: number, awayScore?: number): Promise<void> {
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status,
        homeScore: homeScore ?? undefined,
        awayScore: awayScore ?? undefined,
        updatedAt: new Date(),
      },
    });

    // If game is completed, score predictions
    if (status === 'COMPLETED' && homeScore !== undefined && awayScore !== undefined) {
      await this.pointsService.scoreGamePredictions(gameId);
    }
  }

  /**
   * Get games that need completion status updates
   */
  async getGamesNeedingUpdates(): Promise<any[]> {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));

    return await this.prisma.game.findMany({
      where: {
        status: { in: ['SCHEDULED', 'LIVE'] },
        gameDate: { lt: twoHoursAgo }, // Games that started more than 2 hours ago
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        predictions: {
          select: { id: true },
        },
      },
    });
  }

  /**
   * Simulate completion of any game for testing (fake or mock games)
   */
  async simulateGameCompletion(gameId: string): Promise<void> {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status === 'COMPLETED') {
      throw new Error('Game is already completed');
    }

    // Generate random realistic scores
    const homeScore = Math.floor(Math.random() * 30) + 90; // 90-120
    const awayScore = Math.floor(Math.random() * 30) + 90; // 90-120

    await this.completeGame(gameId, homeScore, awayScore);
    
    console.log(`Simulated completion of game ${gameId}: ${game.homeTeam?.abbreviation || 'HOME'} ${homeScore} - ${awayScore} ${game.awayTeam?.abbreviation || 'AWAY'}`);
  }

  /**
   * Simulate completion of fake games for testing (legacy - kept for compatibility)
   */
  async simulateFakeGameCompletion(gameId: string): Promise<void> {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    if (!game || !game.isFakeGame) {
      throw new Error('Game not found or not a fake game');
    }

    // Generate random scores for simulation
    const homeScore = Math.floor(Math.random() * 30) + 90; // 90-120
    const awayScore = Math.floor(Math.random() * 30) + 90; // 90-120

    await this.completeGame(gameId, homeScore, awayScore);
    
    console.log(`Simulated completion of fake game ${gameId}: ${game.homeTeam.abbreviation} ${homeScore} - ${awayScore} ${game.awayTeam.abbreviation}`);
  }
}
