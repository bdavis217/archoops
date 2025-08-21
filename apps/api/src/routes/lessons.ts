import type { FastifyInstance } from 'fastify';
import { 
  CreateLessonSchema,
  UpdateLessonSchema,
  LessonSchema,
  LessonSummarySchema,
  CreateLessonProgressSchema,
  UpdateLessonProgressSchema,
  LessonProgressSchema,
  LessonWithProgressSchema,
} from '@archoops/types';
import { prisma } from '../prisma.js';
import * as path from 'path';
import { mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export default async function lessonRoutes(fastify: FastifyInstance) {
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads', 'lessons');
  await mkdir(uploadsDir, { recursive: true }).catch(() => {
    // Directory might already exist, ignore error
  });

  // Upload video for a lesson (teachers only)
  fastify.post('/lessons/:id/upload', {
    preHandler: (fastify as any).ensureAuth()
  }, async (request, reply) => {
    try {
      const { id: lessonId } = request.params as { id: string };
      const userId = (request as any).user.userId;
      const userRole = (request as any).user.role;

      if (userRole !== 'teacher') {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Only teachers can upload lesson videos',
        });
      }

      // Check if lesson exists and belongs to the teacher
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
      });

      if (!lesson) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Lesson not found',
        });
      }

      if (lesson.authorId !== userId) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'You can only upload videos to your own lessons',
        });
      }

      const data = await (request as any).file();
      
      if (!data) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'No file uploaded',
        });
      }

      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Only video files (MP4, WebM, OGG) are allowed',
        });
      }

      // Generate unique filename
      const fileExtension = data.filename?.split('.').pop() || 'mp4';
      const fileName = `${lessonId}-${Date.now()}.${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Save file
      await pipeline(data.file, createWriteStream(filePath));

      // Update lesson with video URL
      const videoUrl = `/uploads/lessons/${fileName}`;
      await prisma.lesson.update({
        where: { id: lessonId },
        data: { videoUrl },
      });

      return reply.send({
        message: 'Video uploaded successfully',
        videoUrl,
      });
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to upload video',
      });
    }
  });

  // Get all lessons (with optional progress for students)
  fastify.get('/lessons', {
    preHandler: (fastify as any).ensureAuth()
  }, async (request, reply) => {
    try {
      const userId = (request as any).user.userId;
      const userRole = (request as any).user.role;

      if (userRole === 'teacher') {
        // Teachers see all lessons they created with progress data
        const lessons = await prisma.lesson.findMany({
          where: { authorId: userId },
          orderBy: { createdAt: 'desc' },
          include: {
            progresses: {
              select: {
                completed: true,
              }
            }
          }
        });

        const lessonSummaries = lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          createdAt: lesson.createdAt.toISOString(),
          progresses: lesson.progresses || []
        }));

        return reply.send(lessonSummaries);
      } else {
        // Students see all lessons with their progress
        const lessons = await prisma.lesson.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            progresses: {
              where: { userId },
              take: 1,
            },
          },
        });

        const lessonSummaries = lessons.map(lesson => {
          const progress = lesson.progresses[0];
          return LessonSummarySchema.parse({
            id: lesson.id,
            title: lesson.title,
            description: lesson.content,
            videoUrl: lesson.videoUrl || null, // Convert empty string to null
            embedCode: lesson.embedCode || null,
            createdBy: lesson.authorId,
            createdAt: lesson.createdAt.toISOString(),
            progress: progress ? progress.progress / 100 : 0, // Convert from 0-100 to 0-1
            completed: progress?.completed || false,
          });
        });

        return reply.send(lessonSummaries);
      }
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch lessons',
      });
    }
  });

  // Get a specific lesson by ID
  fastify.get('/lessons/:id', {
    preHandler: (fastify as any).ensureAuth()
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request as any).user.userId;
      const userRole = (request as any).user.role;

      const lesson = await prisma.lesson.findUnique({
        where: { id },
        include: {
          progresses: userRole === 'student' ? {
            where: { userId },
            take: 1,
          } : false,
        },
      });

      if (!lesson) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Lesson not found',
        });
      }

      if (userRole === 'student') {
        const progress = lesson.progresses?.[0];
        const lessonWithProgress = LessonWithProgressSchema.parse({
          id: lesson.id,
          title: lesson.title,
          description: lesson.content,
          videoUrl: lesson.videoUrl || null,
          embedCode: lesson.embedCode || null,
          interactions: lesson.interactions ? JSON.parse(lesson.interactions) : undefined,
          createdBy: lesson.authorId,
          createdAt: lesson.createdAt.toISOString(),
          updatedAt: lesson.updatedAt.toISOString(),
          progress: progress ? {
            id: progress.id,
            userId: progress.userId,
            lessonId: progress.lessonId,
            progress: progress.progress / 100, // Convert from 0-100 to 0-1
            lastCheckpoint: progress.lastCheckpoint,
            completed: progress.completed,
            updatedAt: progress.updatedAt.toISOString(),
          } : undefined,
        });

        return reply.send(lessonWithProgress);
      } else {
        // Teachers see full lesson details
        const lessonData = LessonSchema.parse({
          id: lesson.id,
          title: lesson.title,
          description: lesson.content,
          videoUrl: lesson.videoUrl || null,
          embedCode: lesson.embedCode || null,
          interactions: lesson.interactions ? JSON.parse(lesson.interactions) : undefined,
          createdBy: lesson.authorId,
          createdAt: lesson.createdAt.toISOString(),
          updatedAt: lesson.updatedAt.toISOString(),
        });

        return reply.send(lessonData);
      }
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch lesson',
      });
    }
  });

  // Create a new lesson (teachers only)
  fastify.post('/lessons', {
    preHandler: (fastify as any).ensureAuth()
  }, async (request, reply) => {
    try {
      const userId = (request as any).user.userId;
      const userRole = (request as any).user.role;

      if (userRole !== 'teacher') {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Only teachers can create lessons',
        });
      }

      const data = CreateLessonSchema.parse(request.body);

      const lesson = await prisma.lesson.create({
        data: {
          title: data.title,
          content: data.description, // Store description in content field
          embedCode: data.embedCode, // Store the embed code
          videoUrl: null, // Legacy field for existing video lessons
          interactions: data.interactions ? JSON.stringify(data.interactions) : null,
          authorId: userId,
        },
      });

      const lessonResponse = LessonSchema.parse({
        id: lesson.id,
        title: lesson.title,
        description: lesson.content,
        videoUrl: lesson.videoUrl || null,
        embedCode: lesson.embedCode || null,
        interactions: lesson.interactions ? JSON.parse(lesson.interactions) : undefined,
        createdBy: lesson.authorId,
        createdAt: lesson.createdAt.toISOString(),
        updatedAt: lesson.updatedAt.toISOString(),
      });

      return reply.code(201).send(lessonResponse);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid lesson data',
          issues: error.issues,
        });
      }
      
      console.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create lesson',
      });
    }
  });

  // Update a lesson (teachers only)
  fastify.put('/lessons/:id', {
    preHandler: (fastify as any).ensureAuth()
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request as any).user.userId;
      const userRole = (request as any).user.role;

      if (userRole !== 'teacher') {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Only teachers can update lessons',
        });
      }

      // Check if lesson exists and belongs to the teacher
      const existingLesson = await prisma.lesson.findUnique({
        where: { id },
      });

      if (!existingLesson) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Lesson not found',
        });
      }

      if (existingLesson.authorId !== userId) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'You can only update your own lessons',
        });
      }

      const data = UpdateLessonSchema.parse(request.body);

      const lesson = await prisma.lesson.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description && { content: data.description }),
          ...(data.embedCode && { embedCode: data.embedCode }),
          ...(data.interactions && { interactions: JSON.stringify(data.interactions) }),
        },
      });

      const lessonResponse = LessonSchema.parse({
        id: lesson.id,
        title: lesson.title,
        description: lesson.content,
        videoUrl: lesson.videoUrl || null,
        embedCode: lesson.embedCode || null,
        interactions: lesson.interactions ? JSON.parse(lesson.interactions) : undefined,
        createdBy: lesson.authorId,
        createdAt: lesson.createdAt.toISOString(),
        updatedAt: lesson.updatedAt.toISOString(),
      });

      return reply.send(lessonResponse);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid lesson data',
          issues: error.issues,
        });
      }
      
      console.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update lesson',
      });
    }
  });

  // Delete a lesson (teachers only)
  fastify.delete('/lessons/:id', {
    preHandler: (fastify as any).ensureAuth()
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request as any).user.userId;
      const userRole = (request as any).user.role;

      if (userRole !== 'teacher') {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Only teachers can delete lessons',
        });
      }

      // Check if lesson exists and belongs to the teacher
      const existingLesson = await prisma.lesson.findUnique({
        where: { id },
      });

      if (!existingLesson) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Lesson not found',
        });
      }

      if (existingLesson.authorId !== userId) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'You can only delete your own lessons',
        });
      }

      // Use a transaction to ensure both operations succeed or fail together
      await prisma.$transaction([
        // Delete all lesson progress records first
        prisma.lessonProgress.deleteMany({
          where: { lessonId: id },
        }),
        // Then delete the lesson
        prisma.lesson.delete({
          where: { id },
        })
      ]);

      return reply.code(204).send();
    } catch (error) {
      console.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete lesson',
      });
    }
  });

  // Update lesson progress (students only)
  fastify.post('/lessons/:id/progress', {
    preHandler: (fastify as any).ensureAuth()
  }, async (request, reply) => {
    try {
      const { id: lessonId } = request.params as { id: string };
      const userId = (request as any).user.userId;
      const data = UpdateLessonProgressSchema.parse(request.body);

      // Check if lesson exists
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
      });

      if (!lesson) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Lesson not found',
        });
      }

      // Convert progress from 0-1 to 0-100 for database storage
      const progressPercent = Math.round(data.progress * 100);
      const isCompleted = data.progress >= 1.0;

      const progress = await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
        update: {
          progress: progressPercent,
          lastCheckpoint: data.lastCheckpoint || null,
          completed: isCompleted,
        },
        create: {
          userId,
          lessonId,
          progress: progressPercent,
          lastCheckpoint: data.lastCheckpoint || null,
          completed: isCompleted,
        },
      });

      const progressResponse = LessonProgressSchema.parse({
        id: progress.id,
        userId: progress.userId,
        lessonId: progress.lessonId,
        progress: progress.progress / 100, // Convert back to 0-1
        lastCheckpoint: progress.lastCheckpoint,
        completed: progress.completed,
        updatedAt: progress.updatedAt.toISOString(),
      });

      return reply.send(progressResponse);
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid progress data',
          issues: error.issues,
        });
      }
      
      console.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update progress',
      });
    }
  });
}