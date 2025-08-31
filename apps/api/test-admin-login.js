import fetch from 'node-fetch';

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login...');
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@archoops.com',
        password: 'admin123'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('User data:', data.user);
      console.log('Token present:', !!data.token);
    } else {
      const errorData = await response.text();
      console.log('❌ Login failed:');
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('Make sure the API server is running on http://localhost:3001');
  }
}

testAdminLogin();
