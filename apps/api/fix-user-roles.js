import { PrismaClient } from '@prisma/client';

async function fixUserRoles() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing user roles...\n');
    
    // Check current users
    console.log('Current users:');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, displayName: true }
    });
    
    users.forEach(user => {
      console.log(`- ${user.email}: "${user.role}"`);
    });
    
    // Update any users that might have old role values
    console.log('\n🔄 Updating roles to ensure consistency...');
    
    const updates = [
      { email: 'admin@archoops.com', correctRole: 'ADMIN' },
      { email: 'teacher@archoops.com', correctRole: 'TEACHER' },
      { email: 'student@archoops.com', correctRole: 'STUDENT' }
    ];
    
    for (const update of updates) {
      const user = await prisma.user.findUnique({
        where: { email: update.email }
      });
      
      if (user) {
        if (user.role !== update.correctRole) {
          console.log(`Updating ${user.email}: "${user.role}" -> "${update.correctRole}"`);
          await prisma.user.update({
            where: { email: update.email },
            data: { role: update.correctRole }
          });
        } else {
          console.log(`✅ ${user.email}: already has correct role "${user.role}"`);
        }
      } else {
        console.log(`❌ User ${update.email} not found`);
      }
    }
    
    // Verify final state
    console.log('\n📋 Final user roles:');
    const finalUsers = await prisma.user.findMany({
      select: { email: true, role: true, displayName: true }
    });
    
    finalUsers.forEach(user => {
      console.log(`- ${user.email}: "${user.role}" (${user.displayName})`);
    });
    
    console.log('\n✅ Role fix complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserRoles();
