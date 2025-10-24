const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function callModelService(filePath) {
  const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL;
  
  if (!MODEL_SERVICE_URL || MODEL_SERVICE_URL === 'REPLACE_ME') {
    throw new Error('MODEL_SERVICE_URL not configured');
  }

  try {
    console.log('[MODEL] Calling model service:', MODEL_SERVICE_URL);
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(MODEL_SERVICE_URL, form, {
      headers: form.getHeaders(),
      timeout: 5000 // 5 second timeout
    });

    console.log('[MODEL] Response:', response.data);
    return response.data; // { prediction, confidence, model_version }
  } catch (error) {
    console.error('[MODEL] Error calling model service:', error.message);
    throw new Error('Model service unavailable or timeout');
  }
}

module.exports = { callModelService };
