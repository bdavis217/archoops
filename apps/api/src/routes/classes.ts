import type { FastifyInstance } from 'fastify';
import { 
  CreateClassInputSchema, 
  JoinClassInputSchema, 
  ClassSummarySchema,
  RotateCodeResponseSchema 
} from '@archoops/types';
import { prisma } from '../prisma.js';
import { generateJoinCode } from '../utils/joinCode.js';

export default async function classRoutes(fastify: FastifyInstance) {
  // Get student's enrolled classes
  fastify.get('/student/classes', {
    preHandler: fastify.ensureAuth('STUDENT')
  }, async (request, reply) => {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: request.user.userId },
        include: {
          class: true,
        },
        orderBy: {
          joinedAt: 'desc',
        },
      });

      // Get class statistics for each enrollment
      const classSummariesWithStats = await Promise.all(
        enrollments.map(async (enrollment) => {
          const classId = enrollment.class.id;
          const joinedAt = enrollment.joinedAt;
          
          // Count predictions made since joining this class
          const predictionCount = await prisma.prediction.count({
            where: {
              userId: request.user.userId,
              submittedAt: {
                gte: joinedAt
              }
            }
          });
          
          // Count completed lessons since joining this class
          const completedLessonCount = await prisma.lessonProgress.count({
            where: {
              userId: request.user.userId,
              completed: true,
              updatedAt: {
                gte: joinedAt
              }
            }
          });
          
          return {
            id: enrollment.class.id,
            name: enrollment.class.name,
            joinCode: enrollment.class.joinCode,
            createdAt: enrollment.class.createdAt,
            predictionCount,
            completedLessonCount,
          };
        })
      );

      return reply.send(classSummariesWithStats);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Get teacher's classes
  fastify.get('/teacher/classes', {
    preHandler: fastify.ensureAuth('TEACHER')
  }, async (request, reply) => {
    try {
      const classes = await prisma.class.findMany({
        where: { teacherId: request.user.userId },
        include: {
          enrollments: true, // Include enrollments to count students
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get class statistics for each class
      const classSummariesWithStats = await Promise.all(
        classes.map(async (cls) => {
          const classId = cls.id;
          const studentIds = cls.enrollments.map(e => e.userId);
          
          // Count total predictions made by students in this class
          const totalPredictions = await prisma.prediction.count({
            where: {
              userId: { in: studentIds }
            }
          });
          
          // Count total completed lessons by students in this class
          const totalCompletedLessons = await prisma.lessonProgress.count({
            where: {
              userId: { in: studentIds },
              completed: true
            }
          });
          
          return {
            id: cls.id,
            name: cls.name,
            joinCode: cls.joinCode,
            createdAt: cls.createdAt,
            studentCount: cls.enrollments.length,
            predictionCount: totalPredictions,
            completedLessonCount: totalCompletedLessons,
          };
        })
      );

      return reply.send(classSummariesWithStats);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Create class (teacher only)
  fastify.post('/classes', {
    preHandler: fastify.ensureAuth('TEACHER')
  }, async (request, reply) => {
    try {
      const data = CreateClassInputSchema.parse(request.body);
      const joinCode = await generateJoinCode();

      const newClass = await prisma.class.create({
        data: {
          name: data.name,
          teacherId: request.user.userId,
          joinCode,
        },
      });

      const classSummary = ClassSummarySchema.parse({
        id: newClass.id,
        name: newClass.name,
        joinCode: newClass.joinCode,
        createdAt: newClass.createdAt,
      });

      return reply.code(201).send(classSummary);
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

  // Delete class (teacher only)
  fastify.delete('/classes/:classId', {
    preHandler: fastify.ensureAuth('TEACHER')
  }, async (request, reply) => {
    try {
      const { classId } = request.params as { classId: string };

      // Verify teacher owns the class
      const cls = await prisma.class.findFirst({
        where: {
          id: classId,
          teacherId: request.user.userId,
        },
      });

      if (!cls) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Class not found or you do not have permission to delete it',
        });
      }

      // Delete enrollments first (due to foreign key constraints)
      await prisma.enrollment.deleteMany({
        where: { classId },
      });

      // Delete the class
      await prisma.class.delete({
        where: { id: classId },
      });

      return reply.send({ ok: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Rotate join code (teacher only)
  fastify.post('/classes/:classId/rotate-code', {
    preHandler: fastify.ensureAuth('TEACHER')
  }, async (request, reply) => {
    try {
      const { classId } = request.params as { classId: string };

      // Verify teacher owns the class
      const cls = await prisma.class.findFirst({
        where: {
          id: classId,
          teacherId: request.user.userId,
        },
      });

      if (!cls) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Class not found or you do not have permission to modify it',
        });
      }

      const newJoinCode = await generateJoinCode();

      await prisma.class.update({
        where: { id: classId },
        data: { joinCode: newJoinCode },
      });

      const response = RotateCodeResponseSchema.parse({
        joinCode: newJoinCode,
      });

      return reply.send(response);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Get class roster (teacher only)
  fastify.get('/classes/:classId/roster', {
    preHandler: fastify.ensureAuth('TEACHER')
  }, async (request, reply) => {
    try {
      const { classId } = request.params as { classId: string };

      // Verify teacher owns the class and get class with students
      const cls = await prisma.class.findFirst({
        where: {
          id: classId,
          teacherId: request.user.userId,
        },
        include: {
          enrollments: {
            include: {
              user: true,
            },
            orderBy: {
              joinedAt: 'desc',
            },
          },
        },
      });

      if (!cls) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Class not found or you do not have permission to view it',
        });
      }

      const roster = {
        id: cls.id,
        name: cls.name,
        joinCode: cls.joinCode,
        students: cls.enrollments.map(enrollment => ({
          id: enrollment.user.id,
          displayName: enrollment.user.displayName,
          email: enrollment.user.email,
          joinedAt: enrollment.joinedAt,
        })),
      };

      return reply.send(roster);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });

  // Join class (student only)
  fastify.post('/classes/join', {
    preHandler: fastify.ensureAuth('STUDENT')
  }, async (request, reply) => {
    try {
      const data = JoinClassInputSchema.parse(request.body);
      const joinCode = data.code.toUpperCase();

      // Find class by join code
      const cls = await prisma.class.findUnique({
        where: { joinCode },
      });

      if (!cls) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Invalid join code',
        });
      }

      // Check if student is already enrolled
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_classId: {
            userId: request.user.userId,
            classId: cls.id,
          },
        },
      });

      if (existingEnrollment) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'You are already enrolled in this class',
        });
      }

      // Create enrollment
      await prisma.enrollment.create({
        data: {
          userId: request.user.userId,
          classId: cls.id,
        },
      });

      const classSummary = ClassSummarySchema.parse({
        id: cls.id,
        name: cls.name,
        joinCode: cls.joinCode,
        createdAt: cls.createdAt,
      });

      return reply.code(201).send(classSummary);
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

  // Leave class (student only)
  fastify.delete('/classes/:classId/leave', {
    preHandler: fastify.ensureAuth('STUDENT')
  }, async (request, reply) => {
    try {
      const { classId } = request.params as { classId: string };

      // Check if student is enrolled in the class
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_classId: {
            userId: request.user.userId,
            classId: classId,
          },
        },
      });

      if (!enrollment) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'You are not enrolled in this class',
        });
      }

      // Remove enrollment
      await prisma.enrollment.delete({
        where: {
          userId_classId: {
            userId: request.user.userId,
            classId: classId,
          },
        },
      });

      return reply.send({ ok: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  });
}
