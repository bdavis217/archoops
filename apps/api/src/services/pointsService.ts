import { PrismaClient } from '@prisma/client';
import { LinearScoringV1, PredictionData, GameResult, PointsBreakdown } from '@archoops/scoring';
import { 
  CreatePointsTransaction, 
  PointsTransaction, 
  UserPointsSummary,
  PointsHistoryQuery,
  PointsHistoryResponse 
} from '@archoops/types';

export class PointsService {
  private prisma: PrismaClient;
  private scoringEngine: LinearScoringV1;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.scoringEngine = new LinearScoringV1();
  }

  /**
   * Calculate and award points for a completed prediction
   */
  async scorePrediction(predictionId: string): Promise<PointsBreakdown | null> {
    const prediction = await this.prisma.prediction.findUnique({
      where: { id: predictionId },
      include: {
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
            gameStats: true,
          },
        },
        user: true,
      },
    });

    if (!prediction || prediction.game.status !== 'COMPLETED') {
      return null;
    }

    // Skip if already scored
    if (prediction.pointsEarned !== null) {
      return null;
    }

    // Convert prediction to PredictionData format
    const predictionData: PredictionData = {
      predictionType: prediction.predictionType as any,
      predictedWinner: prediction.predictedWinner || undefined,
      predictedHomeScore: prediction.predictedHomeScore || undefined,
      predictedAwayScore: prediction.predictedAwayScore || undefined,
      playerStatPredictions: prediction.playerStatPredictions
        ? JSON.parse(prediction.playerStatPredictions)
        : undefined,
      predictedHomeThrees: prediction.predictedHomeThrees || undefined,
      predictedAwayThrees: prediction.predictedAwayThrees || undefined,
    };

    // Aggregate team three-pointers from game stats (statType '3pm')
    const teamThreePointers: Record<string, number> = {};
    for (const stat of prediction.game.gameStats) {
      const isThree = String(stat.statType).toLowerCase() === '3pm';
      if (isThree) {
        const team = stat.teamAbbreviation;
        teamThreePointers[team] = (teamThreePointers[team] || 0) + Number(stat.statValue || 0);
      }
    }

    const gameResult: GameResult = {
      status: 'COMPLETED',
      homeScore: prediction.game.homeScore!,
      awayScore: prediction.game.awayScore!,
      winner: prediction.game.homeScore! > prediction.game.awayScore! 
        ? prediction.game.homeTeam.abbreviation 
        : prediction.game.awayTeam.abbreviation,
      playerStats: prediction.game.gameStats.map(stat => ({
        playerName: stat.playerName || '',
        statType: stat.statType,
        actualValue: stat.statValue,
      })),
      homeTeamThrees: teamThreePointers[prediction.game.homeTeam.abbreviation] || 0,
      awayTeamThrees: teamThreePointers[prediction.game.awayTeam.abbreviation] || 0,
    };

    // Calculate points using scoring engine
    const breakdown = this.scoringEngine.score(predictionData, gameResult);

    // Update prediction with results
    await this.prisma.prediction.update({
      where: { id: predictionId },
      data: {
        pointsEarned: breakdown.totalPoints,
        accuracyScore: this.calculateAccuracyPercentage(breakdown),
        actualOutcome: JSON.stringify(gameResult),
      },
    });

    // Create points transaction
    await this.createPointsTransaction({
      userId: prediction.userId,
      gameId: prediction.gameId,
      predictionId: prediction.id,
      points: breakdown.totalPoints,
      reason: 'prediction',
      breakdown,
    });

    return breakdown;
  }

  /**
   * Score all predictions for a completed game
   */
  async scoreGamePredictions(gameId: string): Promise<PointsBreakdown[]> {
    const predictions = await this.prisma.prediction.findMany({
      where: { 
        gameId,
        pointsEarned: null, // Only unscored predictions
      },
    });

    const results: PointsBreakdown[] = [];
    
    for (const prediction of predictions) {
      const breakdown = await this.scorePrediction(prediction.id);
      if (breakdown) {
        results.push(breakdown);
      }
    }

    return results;
  }

  /**
   * Create a points transaction
   */
  async createPointsTransaction(data: CreatePointsTransaction): Promise<PointsTransaction> {
    const transaction = await this.prisma.pointsTransaction.create({
      data: {
        userId: data.userId,
        gameId: data.gameId,
        predictionId: data.predictionId,
        points: data.points,
        reason: data.reason,
        breakdown: data.breakdown ? JSON.stringify(data.breakdown) : null,
      },
    });

    return {
      id: transaction.id,
      userId: transaction.userId,
      gameId: transaction.gameId,
      predictionId: transaction.predictionId,
      points: transaction.points,
      reason: transaction.reason as any,
      breakdown: transaction.breakdown ? JSON.parse(transaction.breakdown) : null,
      createdAt: transaction.createdAt.toISOString(),
    };
  }

  /**
   * Get user's points summary
   */
  async getUserPointsSummary(userId: string): Promise<UserPointsSummary> {
    try {
      // Get total points
      const totalPointsResult = await this.prisma.pointsTransaction.aggregate({
        where: { userId },
        _sum: { points: true },
      });

      // Get points this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weekPointsResult = await this.prisma.pointsTransaction.aggregate({
        where: { 
          userId,
          createdAt: { gte: weekAgo },
        },
        _sum: { points: true },
      });

      // Get points this month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      const monthPointsResult = await this.prisma.pointsTransaction.aggregate({
        where: { 
          userId,
          createdAt: { gte: monthAgo },
        },
        _sum: { points: true },
      });

      // Get prediction stats
      const totalPredictions = await this.prisma.prediction.count({
        where: { userId },
      });

      const correctPredictions = await this.prisma.prediction.count({
        where: { 
          userId,
          pointsEarned: { gt: 0 },
        },
      });

      const accuracyPercentage = totalPredictions > 0 
        ? (correctPredictions / totalPredictions) * 100 
        : 0;

      // Calculate streaks (simplified for now)
      const currentStreak = await this.calculateCurrentStreak(userId);
      const bestStreak = await this.calculateBestStreak(userId);

      return {
        userId,
        totalPoints: totalPointsResult._sum.points || 0,
        pointsThisWeek: weekPointsResult._sum.points || 0,
        pointsThisMonth: monthPointsResult._sum.points || 0,
        totalPredictions,
        correctPredictions,
        accuracyPercentage: Math.round(accuracyPercentage * 100) / 100,
        currentStreak,
        bestStreak,
      };
    } catch (error) {
      console.error('Error getting user points summary:', error);
      // Return default values for new users
      return {
        userId,
        totalPoints: 0,
        pointsThisWeek: 0,
        pointsThisMonth: 0,
        totalPredictions: 0,
        correctPredictions: 0,
        accuracyPercentage: 0,
        currentStreak: 0,
        bestStreak: 0,
      };
    }
  }

  /**
   * Get user's points history with pagination
   */
  async getUserPointsHistory(userId: string, query: PointsHistoryQuery): Promise<PointsHistoryResponse> {
    const limit = parseInt(String(query.limit)) || 20;
    const where: any = { userId };
    
    if (query.reason) {
      where.reason = query.reason;
    }
    
    if (query.gameId) {
      where.gameId = query.gameId;
    }
    
    if (query.cursor) {
      where.createdAt = { lt: new Date(query.cursor) };
    }

    const transactions = await this.prisma.pointsTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Take one more to determine if there are more
    });

    const hasMore = transactions.length > limit;
    const results = hasMore ? transactions.slice(0, -1) : transactions;
    const nextCursor = hasMore ? results[results.length - 1].createdAt.toISOString() : null;

    return {
      transactions: results.map(t => ({
        id: t.id,
        userId: t.userId,
        gameId: t.gameId,
        predictionId: t.predictionId,
        points: t.points,
        reason: t.reason as any,
        breakdown: t.breakdown ? JSON.parse(t.breakdown) : null,
        createdAt: t.createdAt.toISOString(),
      })),
      nextCursor,
      hasMore,
    };
  }

  /**
   * Get points summary for a specific game
   */
  async getGamePointsSummary(gameId: string, userId: string) {
    const transaction = await this.prisma.pointsTransaction.findFirst({
      where: { gameId, userId },
    });

    if (!transaction) {
      return null;
    }

    return {
      gameId,
      userId,
      pointsEarned: transaction.points,
      breakdown: transaction.breakdown ? JSON.parse(transaction.breakdown) : null,
      earnedAt: transaction.createdAt.toISOString(),
    };
  }

  private calculateAccuracyPercentage(breakdown: PointsBreakdown): number {
    const maxPossible = 200; // Based on our scoring system cap
    return (breakdown.totalPoints / maxPossible) * 100;
  }

  private async calculateCurrentStreak(userId: string): Promise<number> {
    // Get recent predictions ordered by game date
    const recentPredictions = await this.prisma.prediction.findMany({
      where: { 
        userId,
        pointsEarned: { not: null },
      },
      include: { game: true },
      orderBy: { game: { gameDate: 'desc' } },
      take: 50, // Look at last 50 predictions
    });

    let streak = 0;
    for (const prediction of recentPredictions) {
      if (prediction.pointsEarned! > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private async calculateBestStreak(userId: string): Promise<number> {
    // This is a simplified implementation
    // In production, you might want to track streaks in a separate table for performance
    const predictions = await this.prisma.prediction.findMany({
      where: { 
        userId,
        pointsEarned: { not: null },
      },
      include: { game: true },
      orderBy: { game: { gameDate: 'asc' } },
    });

    let bestStreak = 0;
    let currentStreak = 0;

    for (const prediction of predictions) {
      if (prediction.pointsEarned! > 0) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return bestStreak;
  }
}
