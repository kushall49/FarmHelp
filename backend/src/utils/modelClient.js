const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function callModelService(filePath) {
  // Use Flask ML service (fixed to use IPv4)
  const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL || 'http://127.0.0.1:5000/analyze';
  
  try {
    console.log('[MODEL] Calling model service:', MODEL_SERVICE_URL);
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(MODEL_SERVICE_URL, form, {
      headers: form.getHeaders(),
      timeout: 30000 // 30 second timeout for ML processing
    });

    console.log('[MODEL] Response:', response.data);
    
    // Return formatted data matching our updated ML service with ALL details
    return {
      prediction: response.data.disease || 'Unknown',
      crop: response.data.crop || 'Unknown',
      confidence: response.data.confidence || 0,
      confidence_percentage: response.data.confidence_percentage || response.data.confidence || 0,
      model_version: 'MobileNetV2-15classes',
      predictions: response.data.predictions || [],
      // Include recommendations and fertilizers
      recommendation: response.data.recommendation || 'No recommendations available',
      fertilizers: response.data.fertilizers || [],
      // Include GradCAM if available
      gradcam: response.data.gradcam || null
    };
  } catch (error) {
    console.error('[MODEL] Error calling model service:', error.message);
    throw new Error(`Model service error: ${error.message}`);
  }
}

module.exports = { callModelService };
