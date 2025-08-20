import { z } from 'zod';

// Points transaction schemas
export const PointsTransactionReasonSchema = z.enum(['prediction', 'bonus', 'lesson', 'penalty']);

export const PointsBreakdownSchema = z.object({
  winnerPoints: z.number(),
  scorePoints: z.number(),
  playerStatPoints: z.number(),
  bonusPoints: z.number(),
  totalPoints: z.number(),
  details: z.object({
    winnerCorrect: z.boolean(),
    scoreDifferential: z.number().optional(),
    playerStatAccuracy: z.array(z.object({
      playerName: z.string(),
      statType: z.string(),
      predicted: z.number(),
      actual: z.number(),
      points: z.number(),
    })).optional(),
  }),
});

export type PointsBreakdown = z.infer<typeof PointsBreakdownSchema>;

export const PointsTransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  gameId: z.string().nullable().optional(),
  predictionId: z.string().nullable().optional(),
  points: z.number(),
  reason: PointsTransactionReasonSchema,
  breakdown: PointsBreakdownSchema.nullable().optional(),
  createdAt: z.string().datetime(),
});

export type PointsTransaction = z.infer<typeof PointsTransactionSchema>;

export const CreatePointsTransactionSchema = z.object({
  userId: z.string(),
  gameId: z.string().optional(),
  predictionId: z.string().optional(),
  points: z.number(),
  reason: PointsTransactionReasonSchema,
  breakdown: PointsBreakdownSchema.optional(),
});

export type CreatePointsTransaction = z.infer<typeof CreatePointsTransactionSchema>;

// Points summary schemas
export const UserPointsSummarySchema = z.object({
  userId: z.string(),
  totalPoints: z.number(),
  pointsThisWeek: z.number(),
  pointsThisMonth: z.number(),
  totalPredictions: z.number(),
  correctPredictions: z.number(),
  accuracyPercentage: z.number(),
  currentStreak: z.number(),
  bestStreak: z.number(),
  rank: z.number().optional(),
  rankChange: z.number().optional(),
});

export type UserPointsSummary = z.infer<typeof UserPointsSummarySchema>;

// Game points summary
export const GamePointsSummarySchema = z.object({
  gameId: z.string(),
  userId: z.string(),
  pointsEarned: z.number(),
  breakdown: PointsBreakdownSchema,
  earnedAt: z.string().datetime(),
});

export type GamePointsSummary = z.infer<typeof GamePointsSummarySchema>;

// Points history pagination
export const PointsHistoryQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  reason: PointsTransactionReasonSchema.optional(),
  gameId: z.string().optional(),
});

export type PointsHistoryQuery = z.infer<typeof PointsHistoryQuerySchema>;

export const PointsHistoryResponseSchema = z.object({
  transactions: z.array(PointsTransactionSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export type PointsHistoryResponse = z.infer<typeof PointsHistoryResponseSchema>;
