import { z } from 'zod';

// Prediction types
export const PredictionTypeSchema = z.enum(['GAME_WINNER', 'FINAL_SCORE', 'PLAYER_STAT', 'TEAM_THREES']);

export const PlayerStatPredictionSchema = z.object({
  playerName: z.string(),
  statType: z.string(), // 'points', 'rebounds', 'assists', etc.
  predictedValue: z.number(),
});

export const CreatePredictionSchema = z.object({
  gameId: z.string(),
  predictionType: PredictionTypeSchema,
  predictedWinner: z.string().optional(), // Team abbreviation
  predictedHomeScore: z.number().min(0).optional(),
  predictedAwayScore: z.number().min(0).optional(),
  playerStatPredictions: z.array(PlayerStatPredictionSchema).optional(),
  // TEAM_THREES fields
  predictedHomeThrees: z.number().int().min(0).max(99).optional(),
  predictedAwayThrees: z.number().int().min(0).max(99).optional(),
});

export type CreatePrediction = z.infer<typeof CreatePredictionSchema>;

export const PredictionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  gameId: z.string(),
  predictionType: PredictionTypeSchema,
  predictedWinner: z.string().optional(),
  predictedHomeScore: z.number().optional(),
  predictedAwayScore: z.number().optional(),
  playerStatPredictions: z.array(PlayerStatPredictionSchema).optional(),
  // TEAM_THREES fields
  predictedHomeThrees: z.number().optional(),
  predictedAwayThrees: z.number().optional(),
  submittedAt: z.string().datetime(),
  isLocked: z.boolean(),
  accuracyScore: z.number().min(0).max(100).nullable().optional(),
  pointsEarned: z.number().nullable().optional(),
});

export type Prediction = z.infer<typeof PredictionSchema>;

export const UpdatePredictionSchema = CreatePredictionSchema.partial().omit({ gameId: true });

export type UpdatePrediction = z.infer<typeof UpdatePredictionSchema>;

// Prediction results and scoring
export const PredictionResultSchema = z.object({
  predictionId: z.string(),
  isCorrect: z.boolean(),
  accuracyScore: z.number().min(0).max(100),
  pointsEarned: z.number(),
  details: z.object({
    winnerCorrect: z.boolean().optional(),
    scoreAccuracy: z.number().optional(),
    playerStatAccuracy: z.array(z.object({
      playerName: z.string(),
      statType: z.string(),
      predicted: z.number(),
      actual: z.number(),
      accuracy: z.number(),
    })).optional(),
  }),
});

export type PredictionResult = z.infer<typeof PredictionResultSchema>;

// Leaderboard
export const LeaderboardEntrySchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  totalPoints: z.number(),
  totalPredictions: z.number(),
  correctPredictions: z.number(),
  accuracyPercentage: z.number(),
  currentStreak: z.number(),
  bestStreak: z.number(),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

export const LeaderboardSchema = z.object({
  classId: z.string(),
  entries: z.array(LeaderboardEntrySchema),
  generatedAt: z.string().datetime(),
});

export type Leaderboard = z.infer<typeof LeaderboardSchema>;
