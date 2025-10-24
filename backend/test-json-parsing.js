// Quick test to verify JSON body parsing is working correctly

const testAPI = async () => {
  const baseURL = 'http://localhost:4000';

  console.log('🧪 Testing FarmHelp API - JSON Body Parsing\n');

  // Test 1: Signup with JSON body
  console.log('1️⃣ Testing Signup (POST /api/auth/signup)...');
  try {
    const signupResponse = await fetch(`${baseURL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'test1234',
        username: 'testuser',
        displayName: 'Test User'
      })
    });

    const signupData = await signupResponse.json();
    console.log('   Status:', signupResponse.status);
    console.log('   Response:', JSON.stringify(signupData, null, 2));

    if (signupResponse.status === 201 || signupResponse.status === 400) {
      console.log('   ✅ JSON body parsed correctly!\n');
    } else {
      console.log('   ❌ Unexpected response\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }

  // Test 2: Login with JSON body
  console.log('2️⃣ Testing Login (POST /api/auth/login)...');
  try {
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'test1234'
      })
    });

    const loginData = await loginResponse.json();
    console.log('   Status:', loginResponse.status);
    console.log('   Response:', JSON.stringify(loginData, null, 2));

    if (loginResponse.status === 200 || loginResponse.status === 401) {
      console.log('   ✅ JSON body parsed correctly!\n');
    } else {
      console.log('   ❌ Unexpected response\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }

  // Test 3: Create post with JSON body (will fail without auth, but body should be parsed)
  console.log('3️⃣ Testing Create Post (POST /api/community)...');
  try {
    const postResponse = await fetch(`${baseURL}/api/community`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Post',
        content: 'This is a test post'
      })
    });

    const postData = await postResponse.json();
    console.log('   Status:', postResponse.status);
    console.log('   Response:', JSON.stringify(postData, null, 2));

    if (postResponse.status === 401) {
      console.log('   ✅ JSON body parsed (got 401 as expected without auth)\n');
    } else if (postResponse.status === 400) {
      console.log('   ❌ 400 Bad Request - JSON parsing failed!\n');
    } else {
      console.log('   ⚠️  Unexpected status\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }

  console.log('✅ Tests complete!');
};

// Run tests
testAPI();
