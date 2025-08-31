import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function testAllLogins() {
  const prisma = new PrismaClient();
  
  const accounts = [
    { email: 'admin@archoops.com', password: 'admin123', expectedRole: 'ADMIN' },
    { email: 'teacher@archoops.com', password: 'teacher123', expectedRole: 'TEACHER' },
    { email: 'student@archoops.com', password: 'student123', expectedRole: 'STUDENT' }
  ];
  
  try {
    console.log('🧪 Testing all login accounts...\n');
    
    for (const account of accounts) {
      console.log(`Testing ${account.email}:`);
      
      // 1. Check if user exists in database
      const user = await prisma.user.findUnique({
        where: { email: account.email }
      });
      
      if (!user) {
        console.log('❌ User not found in database');
        continue;
      }
      
      console.log(`✅ User found: ${user.displayName} (${user.role})`);
      
      // 2. Test password
      const isPasswordValid = await bcrypt.compare(account.password, user.passwordHash);
      console.log(`Password valid: ${isPasswordValid}`);
      
      // 3. Test role
      const isRoleCorrect = user.role === account.expectedRole;
      console.log(`Role correct: ${isRoleCorrect} (expected: ${account.expectedRole}, got: ${user.role})`);
      
      // 4. Test API login
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: account.email,
            password: account.password
          })
        });
        
        console.log(`API Response: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Login successful! User role: ${data.user?.role}`);
        } else {
          const errorText = await response.text();
          console.log(`❌ Login failed: ${errorText}`);
        }
        
      } catch (apiError) {
        console.log(`❌ API Error: ${apiError.message}`);
      }
      
      console.log('---');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllLogins();
