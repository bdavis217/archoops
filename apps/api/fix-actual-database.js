import { PrismaClient } from '@prisma/client';

async function fixActualDatabase() {
  // Use the exact same DATABASE_URL that the server uses
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./apps/api/prisma/dev.db'
      }
    }
  });
  
  try {
    console.log('🔧 Fixing the ACTUAL database that the server uses...\n');
    
    // Check current users in the server's database
    console.log('Current users in server database:');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, displayName: true }
    });
    
    users.forEach(user => {
      console.log(`- ${user.email}: "${user.role}" (${user.displayName})`);
    });
    
    console.log('\n🔄 Updating roles to correct uppercase values...');
    
    // Update each user to have the correct uppercase role
    const updates = [
      { email: 'admin@archoops.com', correctRole: 'ADMIN' },
      { email: 'teacher@archoops.com', correctRole: 'TEACHER' },
      { email: 'student@archoops.com', correctRole: 'STUDENT' }
    ];
    
    for (const update of updates) {
      const result = await prisma.user.updateMany({
        where: { email: update.email },
        data: { role: update.correctRole }
      });
      
      if (result.count > 0) {
        console.log(`✅ Updated ${update.email} to role "${update.correctRole}"`);
      } else {
        console.log(`❌ No user found with email ${update.email}`);
      }
    }
    
    // Verify the updates
    console.log('\n📋 Final verification:');
    const updatedUsers = await prisma.user.findMany({
      select: { email: true, role: true, displayName: true }
    });
    
    updatedUsers.forEach(user => {
      console.log(`- ${user.email}: "${user.role}" (${user.displayName})`);
    });
    
    console.log('\n✅ Database fix complete!');
    console.log('The server should now work with the correct roles.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixActualDatabase();
