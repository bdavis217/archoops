import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function verifyAdmin() {
  const prisma = new PrismaClient();
  try {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@archoops.com' } });
    console.log('Admin exists:', !!admin);
    if (!admin) return;
    console.log('Role:', admin.role, 'Display:', admin.displayName);
    const ok = await bcrypt.compare('admin123', admin.passwordHash);
    console.log('Password matches admin123:', ok);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdmin();


