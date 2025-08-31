import type { FastifyInstance } from 'fastify';
import { 
  SignupInputSchema, 
  LoginInputSchema, 
  RequestPasswordResetSchema, 
  ResetPasswordSchema,
  PublicUserSchema 
} from '@archoops/types';
import { hashPassword, verifyPassword } from '../plugins/hash.js';
import { prisma } from '../prisma.js';
import { generateResetToken, isTokenExpired, getTokenExpiration } from '../utils/resetToken.js';
import { config } from '@archoops/config';

export default async function authRoutes(fastify: FastifyInstance) {
  // Signup
  fastify.post('/auth/signup', async (request, reply) => {
    try {
      const data = SignupInputSchema.parse(request.body);
      
      // Normalize email to lowercase
      const normalizedEmail = data.email.toLowerCase();
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
      
      if (existingUser) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const passwordHash = await hashPassword(data.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          displayName: data.displayName,
          role: data.role,
        },
      });

      // If student with class code, auto-enroll
      if (data.role === 'STUDENT' && data.classJoinCode) {
        const classToJoin = await prisma.class.findUnique({
          where: { joinCode: data.classJoinCode.toUpperCase() }
        });

        if (classToJoin) {
          await prisma.enrollment.create({
            data: {
              userId: user.id,
              classId: classToJoin.id,
            },
          });
        }
      }

      // Sign JWT and set cookie
      const token = fastify.jwt.sign({ 
        userId: user.id, 
        role: user.role 
      });

      reply.setCookie('ah_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: config.auth.jwtExpiryDays() * 24 * 60 * 60 * 1000, // Convert days to milliseconds
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
        path: '/',
      });

      const publicUser = PublicUserSchema.parse({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      });

      return reply.code(201).send({ user: publicUser });
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid input data',
          issues: error.issues,
        });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Login
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const data = LoginInputSchema.parse(request.body);
      
      // Normalize email to lowercase
      const normalizedEmail = data.email.toLowerCase();
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
      }

      // Sign JWT and set cookie
      const token = fastify.jwt.sign({ 
        userId: user.id, 
        role: user.role 
      });

      reply.setCookie('ah_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: config.auth.jwtExpiryDays() * 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
        path: '/',
      });

      const publicUser = PublicUserSchema.parse({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      });

      return reply.send({ user: publicUser });
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid input data',
          issues: error.issues,
        });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Logout
  fastify.post('/auth/logout', async (request, reply) => {
    reply.clearCookie('ah_session');
    return reply.send({ ok: true });
  });

  // Request password reset
  fastify.post('/auth/request-password-reset', async (request, reply) => {
    try {
      const data = RequestPasswordResetSchema.parse(request.body);
      
      // In development, just log a fake token
      if (process.env.NODE_ENV !== 'production') {
        const fakeToken = Math.random().toString(36).substring(2, 15);
        fastify.log.info(`Password reset token for ${data.email}: ${fakeToken}`);
      }
      
      // Always return success to prevent email enumeration
      return reply.send({ ok: true });
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid input data',
          issues: error.issues,
        });
      }
      
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });



  // Get current user
  fastify.get('/me', {
    preHandler: fastify.ensureAuth()
  }, async (request, reply) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.user.userId }
      });

      if (!user) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      const publicUser = PublicUserSchema.parse({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      });

      return reply.send(publicUser);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Request password reset
  fastify.post('/auth/forgot-password', async (request, reply) => {
    try {
      const data = RequestPasswordResetSchema.parse(request.body);
      const normalizedEmail = data.email.toLowerCase();

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      // Always return success to prevent email enumeration
      // but only actually process if user exists
      if (user) {
        const resetToken = generateResetToken();
        const resetTokenExpires = getTokenExpiration();

        // Save reset token to database
        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetToken,
            resetTokenExpires,
          },
        });

        // In development, log the reset token to console
        // In production, you would send this via email
        console.log('🔑 Password Reset Token for', user.email);
        console.log('Token:', resetToken);
        console.log('Expires:', resetTokenExpires.toISOString());
        console.log('Reset URL: http://localhost:5173/reset-password?token=' + resetToken);
        console.log('---');
      }

      return reply.send({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid email address',
          issues: error.issues,
        });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Reset password with token
  fastify.post('/auth/reset-password', async (request, reply) => {
    try {
      const data = ResetPasswordSchema.parse(request.body);

      // Find user by reset token
      const user = await prisma.user.findFirst({
        where: {
          resetToken: data.token,
          resetTokenExpires: {
            gt: new Date(), // Token must not be expired
          },
        },
      });

      if (!user) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Invalid or expired reset token',
        });
      }

      // Hash new password
      const passwordHash = await hashPassword(data.newPassword);

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpires: null,
        },
      });

      return reply.send({
        message: 'Password has been reset successfully. You can now log in with your new password.',
      });
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid reset data',
          issues: error.issues,
        });
      }
      
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });
}
