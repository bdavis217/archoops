import { z } from 'zod';

// Lesson schemas
export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  videoUrl: z.string().nullable(), // Can be relative path or null (legacy video files)
  embedCode: z.string().nullable().optional(), // iFrame embed code for external content
  interactions: z.record(z.any()).optional(), // JSON object for quiz checkpoints
  createdBy: z.string(), // User ID
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateLessonSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  embedCode: z.string()
    .min(1, "Embed code is required")
    .max(5000, "Embed code must be less than 5000 characters")
    .refine((code) => code.includes('<iframe'), "Only iframe embed codes are allowed")
    .refine((code) => !code.toLowerCase().includes('<script'), "Script tags are not allowed for security reasons"),
  interactions: z.record(z.any()).optional(),
});

export const UpdateLessonSchema = CreateLessonSchema.partial();

// Lesson Progress schemas
export const LessonProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  lessonId: z.string(),
  progress: z.number().min(0).max(1), // 0 to 1 (0% to 100%)
  lastCheckpoint: z.string().nullable().optional(),
  completed: z.boolean(),
  updatedAt: z.string().datetime(),
});

export const CreateLessonProgressSchema = z.object({
  lessonId: z.string(),
  progress: z.number().min(0).max(1),
  lastCheckpoint: z.string().optional(),
});

export const UpdateLessonProgressSchema = z.object({
  progress: z.number().min(0).max(1),
  lastCheckpoint: z.string().optional(),
});

// Lesson with progress (for student views)
export const LessonWithProgressSchema = LessonSchema.extend({
  progress: LessonProgressSchema.optional(),
});

// Lesson summary (for listings)
export const LessonSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  videoUrl: z.string().nullable().optional(), // For video status indication (can be relative path)
  embedCode: z.string().nullable().optional(), // For embed content indication
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  progress: z.number().min(0).max(1).optional(), // For student views
  completed: z.boolean().optional(), // For student views
});

// Type exports
export type Lesson = z.infer<typeof LessonSchema>;
export type CreateLesson = z.infer<typeof CreateLessonSchema>;
export type UpdateLesson = z.infer<typeof UpdateLessonSchema>;
export type LessonProgress = z.infer<typeof LessonProgressSchema>;
export type CreateLessonProgress = z.infer<typeof CreateLessonProgressSchema>;
export type UpdateLessonProgress = z.infer<typeof UpdateLessonProgressSchema>;
export type LessonWithProgress = z.infer<typeof LessonWithProgressSchema>;
export type LessonSummary = z.infer<typeof LessonSummarySchema>;
