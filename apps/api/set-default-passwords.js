import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function setDefaultPasswords() {
  const prisma = new PrismaClient();
  try {
    console.log('🔑 Resetting default user passwords...');
    const users = [
      { email: 'admin@archoops.com', password: 'admin123' },
      { email: 'teacher@archoops.com', password: 'teacher123' },
      { email: 'student@archoops.com', password: 'student123' },
    ];

    for (const { email, password } of users) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.update({ where: { email }, data: { passwordHash } });
      console.log(`✅ Password reset: ${email}`);
    }

    console.log('✅ Done.');
  } catch (err) {
    console.error('❌ Error resetting passwords:', err);
  } finally {
    await prisma.$disconnect();
  }
}

setDefaultPasswords();


