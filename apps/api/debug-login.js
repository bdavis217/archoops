import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function debugLogin() {
  const prisma = new PrismaClient();
  
  try {
    const testEmail = 'admin@archoops.com';
    const testPassword = 'admin123';
    
    console.log('🔍 Debugging login process...');
    console.log('Test email:', testEmail);
    console.log('Test password:', testPassword);
    
    // Step 1: Check if user exists with exact email
    console.log('\n1. Checking user with exact email...');
    const userExact = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    console.log('User found (exact):', !!userExact);
    if (userExact) {
      console.log('  - Email:', userExact.email);
      console.log('  - Role:', userExact.role);
    }
    
    // Step 2: Check with normalized (lowercase) email
    console.log('\n2. Checking user with normalized email...');
    const normalizedEmail = testEmail.toLowerCase();
    console.log('Normalized email:', normalizedEmail);
    
    const userNormalized = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    console.log('User found (normalized):', !!userNormalized);
    if (userNormalized) {
      console.log('  - Email:', userNormalized.email);
      console.log('  - Role:', userNormalized.role);
      
      // Step 3: Test password verification
      console.log('\n3. Testing password verification...');
      const isValidPassword = await bcrypt.compare(testPassword, userNormalized.passwordHash);
      console.log('Password valid:', isValidPassword);
      
      if (isValidPassword) {
        console.log('✅ All checks passed - login should work!');
      } else {
        console.log('❌ Password verification failed');
      }
    }
    
    // Step 4: Check all users to see if there are any issues
    console.log('\n4. All users in database:');
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        displayName: true,
        role: true
      }
    });
    allUsers.forEach(user => {
      console.log(`  - ${user.email} | ${user.displayName} | ${user.role}`);
    });
    
  } catch (error) {
    console.error('Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();
