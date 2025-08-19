import { z } from 'zod';

// Re-export all schemas
export * from './schemas/auth';
export * from './schemas/class';
export * from './schemas/game';
export * from './schemas/prediction';

// Legacy schemas (keeping for backward compatibility)
export const UserSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	role: z.enum(['Teacher', 'Student']),
	createdAt: z.string().datetime().optional(),
	updatedAt: z.string().datetime().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const ClassSchema = z.object({
	id: z.string(),
	name: z.string(),
	teacherId: z.string(),
	createdAt: z.string().datetime().optional(),
	updatedAt: z.string().datetime().optional(),
});
export type Class = z.infer<typeof ClassSchema>;

export const PredictionSchema = z.object({
	id: z.string(),
	userId: z.string(),
	gameId: z.string(),
	predictedWinnerTeamId: z.string(),
	confidence: z.number().min(0).max(1),
	createdAt: z.string().datetime().optional(),
});
export type Prediction = z.infer<typeof PredictionSchema>;

export type { z };
