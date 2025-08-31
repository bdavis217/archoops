import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function completeDatabaseReset() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 COMPLETE DATABASE RESET...\n');
    
    // 1. Delete all data in dependency order
    console.log('1. Deleting all data...');
    
    await prisma.lessonProgress.deleteMany({});
    console.log('   ✅ Deleted lesson progress');
    
    await prisma.lesson.deleteMany({});
    console.log('   ✅ Deleted lessons');
    
    await prisma.pointsTransaction.deleteMany({});
    console.log('   ✅ Deleted points transactions');
    
    await prisma.prediction.deleteMany({});
    console.log('   ✅ Deleted predictions');
    
    await prisma.gameStat.deleteMany({});
    console.log('   ✅ Deleted game stats');
    
    await prisma.game.deleteMany({});
    console.log('   ✅ Deleted games');
    
    await prisma.team.deleteMany({});
    console.log('   ✅ Deleted teams');
    
    await prisma.enrollment.deleteMany({});
    console.log('   ✅ Deleted enrollments');
    
    await prisma.class.deleteMany({});
    console.log('   ✅ Deleted classes');
    
    await prisma.userPreferences.deleteMany({});
    console.log('   ✅ Deleted user preferences');
    
    await prisma.user.deleteMany({});
    console.log('   ✅ Deleted users');
    
    // 2. Create fresh users with correct roles
    console.log('\n2. Creating fresh users with correct roles...');
    
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
      
      console.log(`   ✅ Created: ${user.email} (${user.role})`);
    }
    
    // 3. Verify the users
    console.log('\n3. Verifying created users...');
    const allUsers = await prisma.user.findMany({
      select: { email: true, role: true, displayName: true }
    });
    
    allUsers.forEach(user => {
      console.log(`   - ${user.email}: "${user.role}" (${user.displayName})`);
    });
    
    console.log('\n✅ COMPLETE DATABASE RESET SUCCESSFUL!');
    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin@archoops.com / admin123');
    console.log('Teacher: teacher@archoops.com / teacher123');
    console.log('Student: student@archoops.com / student123');
    console.log('\n🔄 Please restart your development server and try logging in.');
    
  } catch (error) {
    console.error('❌ Error during database reset:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeDatabaseReset();
