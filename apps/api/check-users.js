import { PrismaClient } from '@prisma/client';

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
      }
    });
    
    console.log('All users in database:');
    users.forEach(user => {
      console.log(`- Email: ${user.email} | Display: ${user.displayName} | Role: ${user.role}`);
    });
    
    // Check specifically for brian@3wrkz.com
    const brianUser = await prisma.user.findUnique({
      where: { email: 'brian@3wrkz.com' }
    });
    
    console.log('\nChecking for brian@3wrkz.com:');
    if (brianUser) {
      console.log('❌ User EXISTS:', brianUser.email, '|', brianUser.displayName);
    } else {
      console.log('✅ User does NOT exist - should be able to create account');
    }
    
    // Also check with lowercase normalization
    const brianUserLower = await prisma.user.findUnique({
      where: { email: 'brian@3wrkz.com'.toLowerCase() }
    });
    
    console.log('\nChecking with lowercase normalization:');
    if (brianUserLower) {
      console.log('❌ User EXISTS (lowercase):', brianUserLower.email, '|', brianUserLower.displayName);
    } else {
      console.log('✅ User does NOT exist (lowercase) - should be able to create account');
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();