import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function debugLoginStepByStep() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Debug login step by step...\n');
    
    const testEmail = 'teacher@archoops.com';
    const testPassword = 'teacher123';
    
    // Step 1: Simulate LoginInputSchema.parse
    console.log('1. LoginInputSchema.parse simulation:');
    const loginData = { email: testEmail, password: testPassword };
    console.log('Login data:', loginData);
    
    // Step 2: Normalize email
    console.log('\n2. Email normalization:');
    const normalizedEmail = testEmail.toLowerCase();
    console.log('Normalized email:', normalizedEmail);
    
    // Step 3: Database lookup
    console.log('\n3. Database lookup:');
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('Raw user from database:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- DisplayName:', user.displayName);
    console.log('- Role:', `"${user.role}" (type: ${typeof user.role})`);
    console.log('- Role length:', user.role.length);
    console.log('- Role char codes:', Array.from(user.role).map(c => c.charCodeAt(0)));
    
    // Step 4: Password verification
    console.log('\n4. Password verification:');
    const isPasswordValid = await bcrypt.compare(testPassword, user.passwordHash);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password invalid');
      return;
    }
    
    // Step 5: JWT payload creation
    console.log('\n5. JWT payload creation:');
    const jwtPayload = { userId: user.id, role: user.role };
    console.log('JWT payload:', jwtPayload);
    console.log('JWT payload role:', `"${jwtPayload.role}" (type: ${typeof jwtPayload.role})`);
    
    // Step 6: PublicUser data preparation
    console.log('\n6. PublicUser data preparation:');
    const publicUserData = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    };
    
    console.log('PublicUser data:');
    console.log('- ID:', publicUserData.id);
    console.log('- Email:', publicUserData.email);
    console.log('- DisplayName:', publicUserData.displayName);
    console.log('- Role:', `"${publicUserData.role}" (type: ${typeof publicUserData.role})`);
    
    // Step 7: Manual schema validation
    console.log('\n7. Manual schema validation:');
    const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
    const isRoleValid = validRoles.includes(publicUserData.role);
    
    console.log('Valid roles:', validRoles);
    console.log('User role:', `"${publicUserData.role}"`);
    console.log('Is role valid?', isRoleValid);
    
    if (!isRoleValid) {
      console.log('❌ Role validation would fail!');
      console.log('This explains the schema validation error.');
    } else {
      console.log('✅ Role validation should pass');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLoginStepByStep();
