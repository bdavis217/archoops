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

      // Only calculate teacher stats for teachers and admins
      if (user.role === 'TEACHER' || user.role === 'ADMIN') {
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

  // Get user preferences
  fastify.get('/profile/preferences', {
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

      // Get user preferences, or return defaults if none exist
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId }
      });

      // Return preferences or defaults
      const result = preferences || {
        emailGameResults: true,
        emailStudentActivity: true,
        emailNewLessons: false,
        inAppNotifications: true,
        shareUsageData: true,
        allowAnalytics: true,
      };

      return reply.send({
        preferences: {
          emailGameResults: result.emailGameResults,
          emailStudentActivity: result.emailStudentActivity,
          emailNewLessons: result.emailNewLessons,
          inAppNotifications: result.inAppNotifications,
          shareUsageData: result.shareUsageData,
          allowAnalytics: result.allowAnalytics,
        }
      });
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

  // Update notification preferences
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

      const {
        emailGameResults,
        emailStudentActivity,
        emailNewLessons,
        inAppNotifications
      } = request.body as {
        emailGameResults: boolean;
        emailStudentActivity: boolean;
        emailNewLessons: boolean;
        inAppNotifications: boolean;
      };

      // Upsert user preferences (create if doesn't exist, update if it does)
      const preferences = await prisma.userPreferences.upsert({
        where: { userId },
        update: {
          emailGameResults,
          emailStudentActivity,
          emailNewLessons,
          inAppNotifications,
        },
        create: {
          userId,
          emailGameResults,
          emailStudentActivity,
          emailNewLessons,
          inAppNotifications,
        }
      });
      
      return reply.send({
        message: 'Notification preferences updated successfully',
        preferences: {
          emailGameResults: preferences.emailGameResults,
          emailStudentActivity: preferences.emailStudentActivity,
          emailNewLessons: preferences.emailNewLessons,
          inAppNotifications: preferences.inAppNotifications,
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Update privacy settings
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

      const {
        shareUsageData,
        allowAnalytics
      } = request.body as {
        shareUsageData: boolean;
        allowAnalytics: boolean;
      };

      // Upsert user preferences (create if doesn't exist, update if it does)
      const preferences = await prisma.userPreferences.upsert({
        where: { userId },
        update: {
          shareUsageData,
          allowAnalytics,
        },
        create: {
          userId,
          shareUsageData,
          allowAnalytics,
        }
      });
      
      return reply.send({
        message: 'Privacy settings updated successfully',
        settings: {
          shareUsageData: preferences.shareUsageData,
          allowAnalytics: preferences.allowAnalytics,
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Delete account permanently
  fastify.delete('/profile/delete-account', {
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

      // Get user to verify they exist
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          role: true,
          email: true,
          displayName: true
        }
      });

      if (!user) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      // Use a transaction to ensure all deletions succeed or fail together
      await prisma.$transaction(async (tx) => {
        // 1. Delete user preferences
        await tx.userPreferences.deleteMany({
          where: { userId }
        });

        // 2. Delete lesson progress records
        await tx.lessonProgress.deleteMany({
          where: { userId }
        });

        // 3. Delete points transactions
        await tx.pointsTransaction.deleteMany({
          where: { userId }
        });

        // 4. Delete predictions
        await tx.prediction.deleteMany({
          where: { userId }
        });

        // 5. Delete enrollments (student memberships)
        await tx.enrollment.deleteMany({
          where: { userId }
        });

        // 6. If teacher or admin, handle classes and lessons they created
        if (user.role === 'TEACHER' || user.role === 'ADMIN') {
          // Get all classes created by this teacher
          const teacherClasses = await tx.class.findMany({
            where: { teacherId: userId },
            select: { id: true }
          });

          // Delete enrollments for all classes created by this teacher
          if (teacherClasses.length > 0) {
            await tx.enrollment.deleteMany({
              where: {
                classId: {
                  in: teacherClasses.map(c => c.id)
                }
              }
            });
          }

          // Delete all classes created by this teacher
          await tx.class.deleteMany({
            where: { teacherId: userId }
          });

          // Get all lessons created by this teacher
          const teacherLessons = await tx.lesson.findMany({
            where: { authorId: userId },
            select: { id: true }
          });

          // Delete lesson progress for all lessons created by this teacher
          if (teacherLessons.length > 0) {
            await tx.lessonProgress.deleteMany({
              where: {
                lessonId: {
                  in: teacherLessons.map(l => l.id)
                }
              }
            });
          }

          // Delete all lessons created by this teacher
          await tx.lesson.deleteMany({
            where: { authorId: userId }
          });
        }

        // 7. Finally, delete the user account
        await tx.user.delete({
          where: { id: userId }
        });
      });

      fastify.log.info(`Account deleted for user: ${user.email} (${user.displayName})`);

      return reply.send({
        message: 'Account deleted successfully'
      });
    } catch (error) {
      fastify.log.error({ error }, 'Account deletion error');
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete account. Please try again.',
      });
    }
  });
}
