// Test the API directly to see what's happening
async function testDirectAPI() {
  console.log('🧪 Testing API endpoints directly...\n');
  
  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const healthResponse = await fetch('http://localhost:3001/api/health');
    console.log('Health status:', healthResponse.status);
    const healthData = await healthResponse.text();
    console.log('Health response:', healthData);
  } catch (error) {
    console.log('Health error:', error.message);
  }
  
  // Test 2: Login with minimal data
  console.log('\n2. Testing login endpoint...');
  try {
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'student@archoops.com',
        password: 'student123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    console.log('Login headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    const loginText = await loginResponse.text();
    console.log('Login response:', loginText);
    
    if (!loginResponse.ok) {
      try {
        const errorData = JSON.parse(loginText);
        console.log('Parsed error:', errorData);
        
        if (errorData.issues) {
          console.log('Validation issues:');
          errorData.issues.forEach((issue, i) => {
            console.log(`  ${i+1}. Path: [${issue.path.join(', ')}]`);
            console.log(`     Code: ${issue.code}`);
            console.log(`     Message: ${issue.message}`);
            console.log(`     Received: "${issue.received}"`);
            console.log(`     Expected: ${JSON.stringify(issue.options)}`);
          });
        }
      } catch (parseError) {
        console.log('Could not parse error as JSON');
      }
    }
    
  } catch (error) {
    console.log('Login error:', error.message);
  }
}

testDirectAPI();
