/**
 * Test script for REAL chatbot using existing AIService
 */

const AIService = require('./src/services/ai');

async function testChatbot() {
  console.log('═══════════════════════════════════════');
  console.log('Testing REAL AIService.chat()');
  console.log('═══════════════════════════════════════\n');

  const testMessages = [
    'Hello, what can you help me with?',
    'Tell me about rice farming',
    'What crops are good in monsoon?',
    'How do I deal with pests?',
    'Weather information needed'
  ];

  for (const message of testMessages) {
    console.log(`\n📝 USER: ${message}`);
    console.log('⏳ Processing...');
    
    try {
      const reply = await AIService.chat(message);
      console.log(`\n✅ BOT: ${reply}\n`);
      console.log('─'.repeat(60));
    } catch (error) {
      console.error(`\n❌ ERROR: ${error.message}\n`);
      console.log('─'.repeat(60));
    }
  }

  console.log('\n✅ Test completed!\n');
}

testChatbot();
