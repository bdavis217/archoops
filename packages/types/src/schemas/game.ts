import { z } from 'zod';

// Team schemas
export const TeamSchema = z.object({
  id: z.string(),
  abbreviation: z.string(),
  fullName: z.string(),
  city: z.string(),
  conference: z.enum(['EASTERN', 'WESTERN']),
  division: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  logoUrl: z.string().optional(),
});

export type Team = z.infer<typeof TeamSchema>;

// Game schemas
export const GameStatusSchema = z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'POSTPONED']);

export const GameSchema = z.object({
  id: z.string(),
  externalId: z.string().optional(),
  homeTeam: TeamSchema,
  awayTeam: TeamSchema,
  gameDate: z.string().datetime(),
  season: z.string(),
  gameWeek: z.number().optional(),
  status: GameStatusSchema,
  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
  isFakeGame: z.boolean().default(false),
});

export type Game = z.infer<typeof GameSchema>;

export const GameSummarySchema = z.object({
  id: z.string(),
  homeTeam: z.object({
    abbreviation: z.string(),
    fullName: z.string(),
    primaryColor: z.string(),
  }),
  awayTeam: z.object({
    abbreviation: z.string(),
    fullName: z.string(),
    primaryColor: z.string(),
  }),
  gameDate: z.string().datetime(),
  status: GameStatusSchema,
  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
  isFakeGame: z.boolean().default(false),
});

export type GameSummary = z.infer<typeof GameSummarySchema>;

// Game filters
export const GameFiltersSchema = z.object({
  status: GameStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  teamAbbreviation: z.string().optional(),
  isFakeGame: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type GameFilters = z.infer<typeof GameFiltersSchema>;
