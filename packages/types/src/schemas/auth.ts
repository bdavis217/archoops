import { z } from 'zod';

// Input schemas
export const SignupInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(10, 'Password must be at least 10 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  role: z.enum(['teacher', 'student']),
  classJoinCode: z.union([
    z.string().length(0),
    z.string().length(6, 'Class code must be exactly 6 characters')
  ]).optional(),
});

export const LoginInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RequestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(10, 'Password must be at least 10 characters'),
});

// Output schemas
export const PublicUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  role: z.enum(['teacher', 'student']),
});

// Inferred types
export type SignupInput = z.infer<typeof SignupInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
