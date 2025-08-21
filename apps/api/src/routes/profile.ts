import type { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';
import { hashPassword, verifyPassword } from '../plugins/hash.js';

export default async function profileRoutes(fastify: FastifyInstance) {
  // Get profile stats
  fastify.get('/profile/stats', {
    preHandler: fastify.ensureAuth()
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true, role: true }
      });

      if (!user) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      let stats = {
        totalClasses: 0,
        totalStudents: 0,
        totalLessons: 0,
        joinDate: user.createdAt.toISOString(),
      };

      // Only calculate teacher stats for teachers
      if (user.role === 'teacher') {
        // Get total classes created by this teacher
        const totalClasses = await prisma.class.count({
          where: { teacherId: userId }
        });

        // Get total students across all classes
        const totalStudents = await prisma.enrollment.count({
          where: {
            class: {
              teacherId: userId
            }
          }
        });

        // Get total lessons authored by this teacher
        const totalLessons = await prisma.lesson.count({
          where: { authorId: userId }
        });

        stats = {
          totalClasses,
          totalStudents,
          totalLessons,
          joinDate: user.createdAt.toISOString(),
        };
      }

      return reply.send(stats);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Update display name
  fastify.put('/profile/update-name', {
    preHandler: fastify.ensureAuth()
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const { displayName } = request.body as { displayName: string };

      if (!displayName || typeof displayName !== 'string' || displayName.trim().length < 2) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Display name must be at least 2 characters long',
        });
      }

      // Update user display name
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { displayName: displayName.trim() },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
        }
      });

      return reply.send({
        message: 'Display name updated successfully',
        user: updatedUser
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Change password
  fastify.put('/profile/change-password', {
    preHandler: fastify.ensureAuth()
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const { currentPassword, newPassword } = request.body as { 
        currentPassword: string; 
        newPassword: string; 
      };

      if (!currentPassword || !newPassword) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Current password and new password are required',
        });
      }

      if (newPassword.length < 10) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'New password must be at least 10 characters long',
        });
      }

      // Get user and verify current password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true }
      });

      if (!user) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Current password is incorrect',
        });
      }

      // Hash new password and update
      const newPasswordHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      return reply.send({
        message: 'Password changed successfully'
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Update notification preferences (placeholder - would need to extend user model)
  fastify.put('/profile/notifications', {
    preHandler: fastify.ensureAuth()
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // For now, just return success
      // In a real implementation, you'd save these preferences to the database
      const preferences = request.body;
      
      // TODO: Save notification preferences to database
      // This would require extending the User model or creating a UserPreferences table
      
      return reply.send({
        message: 'Notification preferences updated successfully',
        preferences
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Update privacy settings (placeholder - would need to extend user model)
  fastify.put('/profile/privacy', {
    preHandler: fastify.ensureAuth()
  }, async (request, reply) => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      // For now, just return success
      // In a real implementation, you'd save these settings to the database
      const settings = request.body;
      
      // TODO: Save privacy settings to database
      // This would require extending the User model or creating a UserPreferences table
      
      return reply.send({
        message: 'Privacy settings updated successfully',
        settings
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });
}
