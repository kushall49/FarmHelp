const axios = require('axios');

async function testServicesAPI() {
  try {
    console.log('\n=== TESTING SERVICES API ===\n');
    
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResp = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'kushal@gmail.com',
      password: 'test123'
    });
    const token = loginResp.data.token;
    console.log('✅ Login successful');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Step 2: Get ALL services (no filter)
    console.log('\n2. GET /api/services (no params)');
    const allServices = await axios.get('http://localhost:4000/api/services', { headers });
    console.log(`   Total services: ${allServices.data.data.length}`);
    allServices.data.data.forEach((s, i) => {
      console.log(`   ${i+1}. ${s.title} - isAvailable: ${s.isAvailable}`);
    });
    
    // Step 3: Get with isAvailable=true (what frontend uses)
    console.log('\n3. GET /api/services?isAvailable=true (frontend filter)');
    const availServices = await axios.get('http://localhost:4000/api/services?isAvailable=true', { headers });
    console.log(`   Services with isAvailable=true: ${availServices.data.data.length}`);
    availServices.data.data.forEach((s, i) => {
      console.log(`   ${i+1}. ${s.title}`);
    });
    
    // Step 4: Create a NEW service
    console.log('\n4. Creating a NEW service...');
    const newService = {
      serviceType: 'Tractor',
      title: 'TEST SERVICE - Created Right Now',
      description: 'This is a test service to debug the issue',
      district: 'Ballari',
      taluk: 'TestTaluk',
      phoneNumber: '9999999999',
      rateAmount: 1500,
      rateUnit: 'per day'
    };
    
    const createResp = await axios.post('http://localhost:4000/api/services', newService, { headers });
    console.log(`✅ Service created! ID: ${createResp.data.data._id}`);
    console.log(`   Title: ${createResp.data.data.title}`);
    console.log(`   isAvailable: ${createResp.data.data.isAvailable}`);
    
    // Step 5: GET again to verify it appears
    console.log('\n5. GET /api/services again (should include new service)');
    const afterCreate = await axios.get('http://localhost:4000/api/services?isAvailable=true', { headers });
    console.log(`   Services now: ${afterCreate.data.data.length}`);
    afterCreate.data.data.forEach((s, i) => {
      console.log(`   ${i+1}. ${s.title}`);
    });
    
    console.log('\n=== TEST COMPLETE ===\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
  }
}

testServicesAPI();
