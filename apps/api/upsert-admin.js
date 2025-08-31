import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function upsertAdmin() {
  const prisma = new PrismaClient();
  try {
    const email = 'admin@archoops.com';
    const password = 'admin123';
    const displayName = 'System Admin';
    const role = 'ADMIN';

    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Update password, role, and display name to ensure correctness
      await prisma.user.update({
        where: { email },
        data: { passwordHash, role, displayName },
      });
      console.log('✅ Updated existing admin account');
    } else {
      await prisma.user.create({
        data: { email, passwordHash, displayName, role },
      });
      console.log('✅ Created admin account');
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { email: true, role: true, displayName: true } });
    console.log('Admin state:', user);
  } catch (err) {
    console.error('❌ Error upserting admin:', err);
  } finally {
    await prisma.$disconnect();
  }
}

upsertAdmin();


