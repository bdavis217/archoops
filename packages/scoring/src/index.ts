// Types for scoring
export interface PredictionData {
  predictionType: 'GAME_WINNER' | 'FINAL_SCORE' | 'PLAYER_STAT' | 'TEAM_THREES';
  predictedWinner?: string;
  predictedHomeScore?: number;
  predictedAwayScore?: number;
  playerStatPredictions?: Array<{
    playerName: string;
    statType: string;
    predictedValue: number;
  }>;
  // TEAM_THREES
  predictedHomeThrees?: number;
  predictedAwayThrees?: number;
}

export interface GameResult {
  status: 'COMPLETED';
  homeScore: number;
  awayScore: number;
  winner: string; // Team abbreviation
  playerStats?: Array<{
    playerName: string;
    statType: string;
    actualValue: number;
  }>;
  // TEAM_THREES actuals aggregated per team abbreviation
  homeTeamThrees?: number;
  awayTeamThrees?: number;
}

export interface PointsBreakdown {
  winnerPoints: number;
  scorePoints: number;
  playerStatPoints: number;
  teamThreesPoints: number;
  bonusPoints: number;
  totalPoints: number;
  details: {
    winnerCorrect: boolean;
    scoreDifferential?: number;
    playerStatAccuracy?: Array<{
      playerName: string;
      statType: string;
      predicted: number;
      actual: number;
      points: number;
    }>;
    teamThrees?: {
      homePredicted: number;
      homeActual: number;
      awayPredicted: number;
      awayActual: number;
      totalDifference: number;
      points: number;
    };
  };
}

export interface ScoringEngine {
  score(prediction: PredictionData, actual: GameResult): PointsBreakdown;
}

export class LinearScoringV1 implements ScoringEngine {
  score(prediction: PredictionData, actual: GameResult): PointsBreakdown {
    const breakdown: PointsBreakdown = {
      winnerPoints: 0,
      scorePoints: 0,
      playerStatPoints: 0,
      teamThreesPoints: 0,
      bonusPoints: 0,
      totalPoints: 0,
      details: {
        winnerCorrect: false,
        playerStatAccuracy: [],
      },
    };

    // Score winner prediction
    if (prediction.predictedWinner) {
      const winnerCorrect = prediction.predictedWinner === actual.winner;
      breakdown.details.winnerCorrect = winnerCorrect;
      breakdown.winnerPoints = winnerCorrect ? 100 : 0;
    }

    // Score point differential prediction
    if (prediction.predictedHomeScore !== undefined && prediction.predictedAwayScore !== undefined) {
      const predictedDiff = Math.abs(prediction.predictedHomeScore - prediction.predictedAwayScore);
      const actualDiff = Math.abs(actual.homeScore - actual.awayScore);
      const diffAccuracy = Math.abs(actualDiff - predictedDiff);
      
      breakdown.details.scoreDifferential = diffAccuracy;
      breakdown.scorePoints = Math.max(0, 50 - diffAccuracy);
    }

    // Score player stat predictions
    if (prediction.playerStatPredictions && actual.playerStats) {
      const playerStatAccuracy: Array<{
        playerName: string;
        statType: string;
        predicted: number;
        actual: number;
        points: number;
      }> = [];

      for (const predStat of prediction.playerStatPredictions) {
        const actualStat = actual.playerStats.find(
          stat => stat.playerName === predStat.playerName && stat.statType === predStat.statType
        );

        if (actualStat) {
          const difference = Math.abs(actualStat.actualValue - predStat.predictedValue);
          const points = Math.max(0, 25 - difference);
          
          playerStatAccuracy.push({
            playerName: predStat.playerName,
            statType: predStat.statType,
            predicted: predStat.predictedValue,
            actual: actualStat.actualValue,
            points,
          });

          breakdown.playerStatPoints += points;
        }
      }

      breakdown.details.playerStatAccuracy = playerStatAccuracy;
    }

    // Score TEAM_THREES predictions
    if (
      prediction.predictionType === 'TEAM_THREES' &&
      prediction.predictedHomeThrees !== undefined &&
      prediction.predictedAwayThrees !== undefined &&
      actual.homeTeamThrees !== undefined &&
      actual.awayTeamThrees !== undefined
    ) {
      const homeDifference = Math.abs(actual.homeTeamThrees - prediction.predictedHomeThrees);
      const awayDifference = Math.abs(actual.awayTeamThrees - prediction.predictedAwayThrees);
      const totalDifference = homeDifference + awayDifference;
      
      const points = Math.max(0, 25 - totalDifference);
      breakdown.teamThreesPoints = points;
      breakdown.details.teamThrees = {
        homePredicted: prediction.predictedHomeThrees,
        homeActual: actual.homeTeamThrees,
        awayPredicted: prediction.predictedAwayThrees,
        awayActual: actual.awayTeamThrees,
        totalDifference,
        points,
      };
    }

    // Calculate total with cap
    const uncappedTotal = breakdown.winnerPoints + breakdown.scorePoints + breakdown.playerStatPoints + breakdown.teamThreesPoints + breakdown.bonusPoints;
    breakdown.totalPoints = Math.min(uncappedTotal, 200);

    return breakdown;
  }

  // Helper method for legacy compatibility
  computePointsForPrediction({ isCorrect, confidence }: { predictionId: string; isCorrect: boolean; confidence: number; }): number {
    if (!isCorrect) return 0;
    const base = 100;
    return Math.round(base + confidence * 100);
  }
}
