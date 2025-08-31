import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function checkAdmin() {
  const prisma = new PrismaClient();
  
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@archoops.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('Email:', admin.email);
    console.log('Display Name:', admin.displayName);
    console.log('Role:', admin.role);
    console.log('Password Hash:', admin.passwordHash.substring(0, 20) + '...');
    
    // Test password verification
    const isValid = await bcrypt.compare('admin123', admin.passwordHash);
    console.log('Password verification:', isValid ? '✅ Valid' : '❌ Invalid');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
