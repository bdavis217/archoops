import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Test the complete login flow
async function comprehensiveLoginTest() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔬 COMPREHENSIVE LOGIN TEST\n');
    
    // Test data
    const testCredentials = {
      email: 'teacher@archoops.com',
      password: 'teacher123'
    };
    
    console.log('Testing with:', testCredentials);
    
    // Step 1: Database lookup
    console.log('\n1. DATABASE LOOKUP:');
    const normalizedEmail = testCredentials.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      roleType: typeof user.role
    });
    
    // Step 2: Password verification
    console.log('\n2. PASSWORD VERIFICATION:');
    const isPasswordValid = await bcrypt.compare(testCredentials.password, user.passwordHash);
    console.log('✅ Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      return;
    }
    
    // Step 3: JWT Payload creation
    console.log('\n3. JWT PAYLOAD CREATION:');
    const jwtPayload = {
      userId: user.id,
      role: user.role
    };
    console.log('JWT Payload:', jwtPayload);
    
    // Step 4: PublicUser schema validation simulation
    console.log('\n4. PUBLIC USER SCHEMA VALIDATION:');
    const publicUserData = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    };
    
    console.log('PublicUser data:', publicUserData);
    
    // Check against expected schema
    const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
    const isRoleValid = validRoles.includes(user.role);
    console.log('Role validation:', {
      userRole: user.role,
      validRoles,
      isValid: isRoleValid
    });
    
    // Step 5: Test what the frontend is sending
    console.log('\n5. FRONTEND REQUEST SIMULATION:');
    
    // Simulate what the frontend AuthForm would send
    const frontendLoginData = {
      email: testCredentials.email,
      password: testCredentials.password
    };
    
    console.log('Frontend would send:', frontendLoginData);
    
    // Check if this matches LoginInputSchema expectations
    const hasRequiredFields = frontendLoginData.email && frontendLoginData.password;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(frontendLoginData.email);
    const isPasswordValid2 = frontendLoginData.password.length >= 1;
    
    console.log('Frontend validation:', {
      hasRequiredFields,
      isEmailValid,
      isPasswordValid: isPasswordValid2,
      wouldPassValidation: hasRequiredFields && isEmailValid && isPasswordValid2
    });
    
    // Step 6: Check for any remaining old role references
    console.log('\n6. CHECKING FOR OLD ROLE REFERENCES:');
    
    // This would help us identify if there are any hardcoded old roles
    const oldRolePatterns = ['teacher', 'student'];
    const hasOldRolePattern = oldRolePatterns.some(pattern => 
      user.role.toLowerCase() === pattern
    );
    
    console.log('Old role pattern check:', {
      userRole: user.role,
      oldPatterns: oldRolePatterns,
      hasOldPattern: hasOldRolePattern
    });
    
    if (hasOldRolePattern) {
      console.log('❌ FOUND OLD ROLE PATTERN - this might be the issue!');
    } else {
      console.log('✅ No old role patterns found');
    }
    
    console.log('\n🎯 SUMMARY:');
    if (isPasswordValid && isRoleValid && !hasOldRolePattern) {
      console.log('✅ All checks passed - login SHOULD work');
      console.log('❓ If login still fails, the issue is in the HTTP request/response layer');
    } else {
      console.log('❌ Found issues that would prevent login');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveLoginTest();
