// Quick test to verify GROQ AI integration is working
const groqService = require('./src/chatbot/services/groqService');

async function testGroq() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║  GROQ AI Service Integration Test    ║');
  console.log('╚═══════════════════════════════════════╝\n');

  // Check status
  const status = groqService.getStatus();
  console.log('[STATUS CHECK]');
  console.log('  Ready:', status.ready ? '✅ YES' : '❌ NO');
  console.log('  API Key Found:', status.hasApiKey ? '✅ YES' : '❌ NO');
  console.log('  Models Initialized:', status.modelsInitialized ? '✅ YES' : '❌ NO');
  console.log('  Tools Available:', status.toolsCount, 'tools');
  console.log('');

  if (!status.ready) {
    console.log('❌ GROQ Service is not ready!');
    console.log('   Please add GROQ_API_KEY to backend/.env file');
    console.log('   Get free API key from: https://console.groq.com/keys');
    return;
  }

  // Test a simple farming question
  console.log('[TEST QUERY] "What crops grow best in loamy soil?"');
  console.log('Processing...\n');

  try {
    const response = await groqService.generateResponse('test_user', 'What crops grow best in loamy soil?');
    console.log('[GROQ RESPONSE]');
    console.log(response);
    console.log('');
    console.log('✅ GROQ AI is working correctly!');
  } catch (error) {
    console.error('❌ Error testing GROQ:', error.message);
  }
}

testGroq();
