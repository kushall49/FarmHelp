const axios = require('axios');
const jwt = require('jsonwebtoken');

async function checkToken() {
  try {
    console.log('\n=== CHECKING JWT TOKEN ===\n');
    
    // Login
    console.log('1. Logging in...');
    const loginResp = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'kushal@gmail.com',
      password: 'test123'
    });
    const token = loginResp.data.token;
    console.log('✅ Login successful\n');
    
    // Decode token
    console.log('2. Decoding token...');
    const decoded = jwt.decode(token);
    console.log('Token payload:');
    console.log(JSON.stringify(decoded, null, 2));
    
    if (decoded.id) {
      console.log('\n✅ Token HAS "id" field:', decoded.id);
    } else {
      console.log('\n❌ Token MISSING "id" field!');
      console.log('Only has:', Object.keys(decoded));
    }
    
    if (decoded.userId) {
      console.log('✅ Token HAS "userId" field:', decoded.userId);
    }
    
    console.log('\n=== TOKEN CHECK COMPLETE ===\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
  }
}

checkToken();
