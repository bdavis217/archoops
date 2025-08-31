import { PrismaClient } from '@prisma/client';

async function diagnoseRoleMismatch() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 DIAGNOSING ROLE MISMATCH...\n');
    
    // 1. Check what roles are actually in the database
    console.log('1. CURRENT DATABASE ROLES:');
    const users = await prisma.user.findMany({
      select: { email: true, role: true, displayName: true }
    });
    
    users.forEach(user => {
      console.log(`   ${user.email} -> "${user.role}" (${typeof user.role})`);
    });
    
    // 2. Check what the schema expects
    console.log('\n2. SCHEMA EXPECTATIONS:');
    console.log('   Frontend AuthForm expects: STUDENT, TEACHER, ADMIN');
    console.log('   Backend auth.ts expects: STUDENT, TEACHER, ADMIN');
    console.log('   Database schema allows: STUDENT, TEACHER, ADMIN');
    
    // 3. Check if there's a mismatch
    console.log('\n3. MISMATCH ANALYSIS:');
    const expectedRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
    const actualRoles = [...new Set(users.map(u => u.role))];
    
    console.log('   Expected roles:', expectedRoles);
    console.log('   Actual roles in DB:', actualRoles);
    
    const hasOldRoles = actualRoles.some(role => 
      ['student', 'teacher'].includes(role.toLowerCase()) && 
      !expectedRoles.includes(role)
    );
    
    if (hasOldRoles) {
      console.log('\n❌ FOUND THE PROBLEM!');
      console.log('   Database still contains old lowercase roles');
      console.log('   But frontend/backend now expect uppercase roles');
      console.log('\n💡 SOLUTION: Update database roles to match new schema');
    } else {
      console.log('\n✅ Roles match - problem is elsewhere');
    }
    
    // 4. Test a simple login simulation
    console.log('\n4. TESTING LOGIN SIMULATION:');
    const testUser = users.find(u => u.email === 'admin@archoops.com');
    if (testUser) {
      console.log(`   Admin user role: "${testUser.role}"`);
      console.log(`   Is role "ADMIN"? ${testUser.role === 'ADMIN'}`);
      console.log(`   Is role "admin"? ${testUser.role === 'admin'}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseRoleMismatch();
