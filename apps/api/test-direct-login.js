// Direct test of login endpoint
console.log('🧪 Testing direct login endpoint...');

const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teacher@archoops.com',
        password: 'teacher123'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed');
      
      // Try to parse as JSON for better error details
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Raw error response:', responseText);
      }
    }
    
  } catch (error) {
    console.error('❌ Network/fetch error:', error.message);
    console.log('Make sure the API server is running on http://localhost:3001');
  }
};

testLogin();
