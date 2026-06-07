// Save this as apitesting.js in your project root

// Import fetch differently based on Node.js version
let fetch;
try {
  // For Node.js 18+ which has built-in fetch
  fetch = global.fetch;
} catch (error) {
  // For older versions that need node-fetch
  try {
    // For node-fetch v3 (ESM only)
    // We need to use dynamic import for ESM modules
    import('node-fetch').then(module => {
      fetch = module.default;
      // Run the test function after import
      testAPI();
    });
  } catch (importError) {
    // Fallback to node-fetch v2 (CommonJS)
    try {
      fetch = require('node-fetch');
    } catch (requireError) {
      console.error('Could not import fetch. Please install node-fetch:');
      console.error('npm install node-fetch@2');
      process.exit(1);
    }
  }
}

async function testAPI() {
  console.log('Starting API tests...');
  
  try {
    // 1. Test the health endpoint
    console.log('\n🔍 Testing health endpoint...');
    const healthResponse = await fetch(`http://localhost:5000/api/health`);
    const healthData = await healthResponse.json();
    console.log('Health status:', healthData);
    
    // 2. Test the debug endpoint
    console.log('\n🔍 Testing debug endpoint...');
    const debugResponse = await fetch(`http://localhost:5000/api/debug`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        test: 'This is a test payload'
      })
    });
    const debugData = await debugResponse.json();
    console.log('Debug response:', debugData);
    
    // 3. Test user registration
    console.log('\n🔍 Testing registration endpoint...');
    const registerResponse = await fetch(`http://localhost:5000/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: `testuser_${Date.now()}`,  // Generate unique username
        email: `test_${Date.now()}@example.com`, // Generate unique email
        password: 'password123'
      })
    });
    const registerData = await registerResponse.json();
    console.log('Registration response:', registerData);
    
    if (registerResponse.ok) {
      // If registration succeeded, test login
      const { user } = registerData;
      
      console.log('\n🔍 Testing login endpoint...');
      const loginResponse = await fetch(`http://localhost:5000/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          password: 'password123'
        })
      });
      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);
    }
    
    console.log('\n✅ API tests completed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Run test if fetch is already available
if (typeof fetch === 'function') {
  testAPI();
}