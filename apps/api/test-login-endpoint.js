import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Simulate the exact login logic from auth.ts
async function testLoginLogic() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing login logic step by step...');
    
    const testData = {
      email: 'admin@archoops.com',
      password: 'admin123'
    };
    
    console.log('Input data:', testData);
    
    // Step 1: Normalize email (from auth.ts line 110)
    const normalizedEmail = testData.email.toLowerCase();
    console.log('1. Normalized email:', normalizedEmail);
    
    // Step 2: Find user (from auth.ts line 113-115)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    
    console.log('2. User found:', !!user);
    if (!user) {
      console.log('❌ User not found - this would cause 401');
      return;
    }
    
    console.log('   User details:', {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    });
    
    // Step 3: Verify password (from auth.ts line 117)
    console.log('3. Testing password verification...');
    const isPasswordValid = await bcrypt.compare(testData.password, user.passwordHash);
    console.log('   Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password invalid - this would cause 401');
      return;
    }
    
    // Step 4: Test JWT payload creation (from auth.ts line 125-128)
    console.log('4. Testing JWT payload creation...');
    const jwtPayload = { 
      userId: user.id, 
      role: user.role
    };
    console.log('   JWT payload:', jwtPayload);
    
    // Step 5: Test PublicUser schema parsing (from auth.ts line 139-143)
    console.log('5. Testing PublicUser schema...');
    
    // Import the schema
    try {
      // We'll simulate the schema validation
      const publicUserData = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      };
      
      console.log('   PublicUser data:', publicUserData);
      
      // Check if role is valid for the new schema
      const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
      const isRoleValid = validRoles.includes(user.role);
      console.log('   Role is valid:', isRoleValid);
      
      if (!isRoleValid) {
        console.log('❌ Invalid role - this would cause schema validation error');
        console.log('   Expected one of:', validRoles);
        console.log('   Got:', user.role);
        return;
      }
      
      console.log('✅ All login steps would succeed!');
      
    } catch (schemaError) {
      console.log('❌ Schema validation error:', schemaError.message);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoginLogic();
