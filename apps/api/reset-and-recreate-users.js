import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function resetAndRecreateUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Resetting and recreating users...\n');
    
    // 1. Delete all existing users
    console.log('1. Deleting all existing users...');
    const deleteResult = await prisma.user.deleteMany({});
    console.log(`Deleted ${deleteResult.count} users`);
    
    // 2. Create fresh users with correct roles
    console.log('\n2. Creating fresh users...');
    
    const users = [
      {
        email: 'admin@archoops.com',
        password: 'admin123',
        displayName: 'System Admin',
        role: 'ADMIN'
      },
      {
        email: 'teacher@archoops.com',
        password: 'teacher123',
        displayName: 'Demo Teacher',
        role: 'TEACHER'
      },
      {
        email: 'student@archoops.com',
        password: 'student123',
        displayName: 'Demo Student',
        role: 'STUDENT'
      }
    ];
    
    for (const userData of users) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash,
          displayName: userData.displayName,
          role: userData.role
        }
      });
      
      console.log(`✅ Created: ${user.email} (${user.role})`);
    }
    
    // 3. Verify the users were created correctly
    console.log('\n3. Verifying created users...');
    const allUsers = await prisma.user.findMany({
      select: { email: true, role: true, displayName: true }
    });
    
    allUsers.forEach(user => {
      console.log(`- ${user.email}: "${user.role}" (${user.displayName})`);
    });
    
    console.log('\n✅ User reset complete!');
    console.log('Try logging in with:');
    console.log('Admin: admin@archoops.com / admin123');
    console.log('Teacher: teacher@archoops.com / teacher123');
    console.log('Student: student@archoops.com / student123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndRecreateUsers();
