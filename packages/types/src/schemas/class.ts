import { z } from 'zod';

// Input schemas
export const CreateClassInputSchema = z.object({
  name: z.string().min(3, 'Class name must be at least 3 characters').max(50, 'Class name must be at most 50 characters'),
});

export const JoinClassInputSchema = z.object({
  code: z.string().length(6, 'Join code must be 6 characters'),
});

// Output schemas
export const ClassSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  joinCode: z.string(),
  createdAt: z.date(),
  studentCount: z.number().optional(), // For teacher views
});

export const ClassRosterSchema = z.object({
  id: z.string(),
  name: z.string(),
  joinCode: z.string(),
  students: z.array(z.object({
    id: z.string(),
    displayName: z.string(),
    email: z.string().email(),
    joinedAt: z.date(),
  })),
});

export const RotateCodeResponseSchema = z.object({
  joinCode: z.string(),
});

// Inferred types
export type CreateClassInput = z.infer<typeof CreateClassInputSchema>;
export type JoinClassInput = z.infer<typeof JoinClassInputSchema>;
export type ClassSummary = z.infer<typeof ClassSummarySchema>;
export type ClassRoster = z.infer<typeof ClassRosterSchema>;
export type RotateCodeResponse = z.infer<typeof RotateCodeResponseSchema>;
