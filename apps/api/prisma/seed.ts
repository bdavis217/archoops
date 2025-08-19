import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { MockNbaService } from '../src/services/mockNbaService.js';

const prisma = new PrismaClient();

async function generateJoinCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Check if code already exists
  const existing = await prisma.class.findUnique({
    where: { joinCode: result }
  });
  
  if (existing) {
    return generateJoinCode(); // Recursively generate new code
  }
  
  return result;
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create a teacher user
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@archoops.com' },
    update: {},
    create: {
      email: 'teacher@archoops.com',
      passwordHash: teacherPassword,
      displayName: 'Demo Teacher',
      role: 'teacher',
    },
  });

  // Create a student user
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@archoops.com' },
    update: {},
    create: {
      email: 'student@archoops.com',
      passwordHash: studentPassword,
      displayName: 'Demo Student',
      role: 'student',
    },
  });

  // Create a demo class
  const joinCode = await generateJoinCode();
  const existingClass = await prisma.class.findFirst({
    where: {
      teacherId: teacher.id,
      name: 'Demo Basketball Analytics Class'
    }
  });

  const demoClass = existingClass || await prisma.class.create({
    data: {
      name: 'Demo Basketball Analytics Class',
      teacherId: teacher.id,
      joinCode,
    },
  });

  // Enroll the student in the demo class
  await prisma.enrollment.upsert({
    where: {
      userId_classId: {
        userId: student.id,
        classId: demoClass.id,
      }
    },
    update: {},
    create: {
      userId: student.id,
      classId: demoClass.id,
    },
  });

  // Seed NBA teams and games
  console.log('🏀 Seeding NBA data...');
  await MockNbaService.seedDatabase();

  console.log('✅ Seeding completed!');
  console.log(`Teacher: teacher@archoops.com / teacher123`);
  console.log(`Student: student@archoops.com / student123`);
  console.log(`Demo Class Join Code: ${joinCode}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
