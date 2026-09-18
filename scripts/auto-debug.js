#!/usr/bin/env node
/**
 * FarmHelp - Comprehensive Auto-Debugger
 * Tests all components and reports status
 */

const http = require('http');
const https = require('https');

console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║      FarmHelp - Automatic System Debugger            ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

let results = {
  backend: false,
  chatbot: false,
  groqAI: false,
  frontend: false,
  database: false
};

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = (options.protocol === 'https:' ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Test functions
async function testBackend() {
  console.log('[1/5] Testing Backend Server...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/',
      method: 'GET'
    });
    
    if (response.status === 200 && response.data.ok) {
      console.log('   ✅ Backend is RUNNING on port 4000');
      console.log(`   Database Status: ${response.data.db}`);
      results.backend = true;
      results.database = response.data.db === 'connected';
      return true;
    }
  } catch (error) {
    console.log('   ❌ Backend is NOT running!');
    console.log(`   Error: ${error.message}`);
    console.log('   → Run: START_BACKEND_GROQ.bat');
    return false;
  }
}

async function testChatbotAPI() {
  console.log('\n[2/5] Testing Chatbot API...');
  try {
    const postData = JSON.stringify({ message: 'Hello' });
    const response = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/chatbot',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, postData);
    
    if (response.status === 200 && response.data.reply) {
      console.log('   ✅ Chatbot API is responding!');
      console.log(`   Reply: "${response.data.reply.substring(0, 100)}..."`);
      console.log(`   Intent: ${response.data.intent || 'N/A'}`);
      results.chatbot = true;
      return response.data;
    }
  } catch (error) {
    console.log('   ❌ Chatbot API failed!');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

async function testGroqAI() {
  console.log('\n[3/5] Testing GROQ AI with Farming Question...');
  console.log('   Question: "What crops grow best in loamy soil?"');
  
  try {
    const postData = JSON.stringify({ 
      message: 'What crops grow best in loamy soil?' 
    });
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/chatbot',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, postData);
    
    if (response.status === 200 && response.data.reply) {
      console.log('   ✅ GROQ AI Response Received!');
      console.log('\n   ─────────────────────────────────────────────');
      console.log('   AI Reply:');
      console.log('   ─────────────────────────────────────────────');
      
      // Format the reply nicely
      const lines = response.data.reply.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          console.log(`   ${line}`);
        }
      });
      
      console.log('   ─────────────────────────────────────────────');
      console.log(`   Intent: ${response.data.intent || 'N/A'}`);
      console.log(`   Confidence: ${response.data.confidence || 'N/A'}`);
      
      // Check if response looks intelligent (not static)
      const isIntelligent = response.data.reply.length > 200 || 
                           response.data.reply.includes('loamy') ||
                           response.data.reply.includes('soil') ||
                           response.data.reply.includes('crop');
      
      if (isIntelligent) {
        console.log('\n   ✅ Response appears to be from GROQ AI (intelligent & detailed)');
        results.groqAI = true;
      } else {
        console.log('\n   ⚠️  Response may be from fallback service (short/generic)');
        results.groqAI = false;
      }
      
      return response.data;
    }
  } catch (error) {
    console.log('   ❌ GROQ AI test failed!');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

async function testFrontend() {
  console.log('\n[4/5] Testing Frontend...');
  
  const ports = [19000, 8081, 19001, 19006];
  
  for (const port of ports) {
    try {
      await makeRequest({
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET'
      });
      
      console.log(`   ✅ Frontend is RUNNING on port ${port}`);
      console.log(`   URL: http://localhost:${port}`);
      results.frontend = true;
      return true;
    } catch (error) {
      // Continue to next port
    }
  }
  
  console.log('   ⚠️  Frontend is NOT running');
  console.log('   → Run: start-web.ps1');
  return false;
}

async function checkEnvironment() {
  console.log('\n[5/5] Checking Environment Configuration...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, 'backend', '.env');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      if (envContent.includes('GROQ_API_KEY=gsk_')) {
        console.log('   ✅ GROQ_API_KEY is configured');
      } else {
        console.log('   ❌ GROQ_API_KEY is NOT configured!');
        console.log('   → Get free key from: https://console.groq.com/keys');
        console.log('   → Add to backend/.env: GROQ_API_KEY=gsk_your_key');
      }
      
      if (envContent.includes('MONGODB_URI=')) {
        console.log('   ✅ MONGODB_URI is configured');
      } else {
        console.log('   ❌ MONGODB_URI is NOT configured!');
      }
    } else {
      console.log('   ❌ .env file not found!');
    }
  } catch (error) {
    console.log(`   ⚠️  Error checking environment: ${error.message}`);
  }
}

// Main execution
async function runDiagnostics() {
  await testBackend();
  await testChatbotAPI();
  await testGroqAI();
  await testFrontend();
  await checkEnvironment();
  
  // Print summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                    SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('📊 System Status:');
  console.log(`   Backend:    ${results.backend ? '✅ RUNNING' : '❌ STOPPED'}`);
  console.log(`   Database:   ${results.database ? '✅ CONNECTED' : '❌ DISCONNECTED'}`);
  console.log(`   Chatbot:    ${results.chatbot ? '✅ WORKING' : '❌ NOT WORKING'}`);
  console.log(`   GROQ AI:    ${results.groqAI ? '✅ ENABLED' : '⚠️  FALLBACK MODE'}`);
  console.log(`   Frontend:   ${results.frontend ? '✅ RUNNING' : '⚠️  STOPPED'}`);
  
  console.log('\n🔗 Quick Links:');
  console.log('   Backend:  http://localhost:4000');
  console.log('   Frontend: http://localhost:19000');
  console.log('   API Test: http://localhost:4000/api/chatbot');
  
  console.log('\n💡 Next Steps:');
  if (!results.backend) {
    console.log('   1. Start backend: START_BACKEND_GROQ.bat');
  }
  if (!results.frontend) {
    console.log('   2. Start frontend: start-web.ps1');
  }
  if (results.backend && results.chatbot && !results.groqAI) {
    console.log('   → Check backend console for GROQ initialization errors');
    console.log('   → Verify GROQ_API_KEY is correct in .env file');
  }
  if (results.backend && results.chatbot && results.groqAI) {
    console.log('   ✅ Everything is working! Open AI Assistant in the app.');
  }
  
  console.log('\n═══════════════════════════════════════════════════════\n');
}

// Run diagnostics
runDiagnostics().catch(err => {
  console.error('\n❌ Fatal error during diagnostics:', err.message);
  process.exit(1);
});
