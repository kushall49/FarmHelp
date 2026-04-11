const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

function buildFallbackResult(filePath) {
  const lowerName = String(filePath || '').toLowerCase();
  let disease = 'Healthy';
  let crop = 'Unknown';

  if (lowerName.includes('tomato')) {
    crop = 'Tomato';
  } else if (lowerName.includes('potato')) {
    crop = 'Potato';
  } else if (lowerName.includes('corn') || lowerName.includes('maize')) {
    crop = 'Maize';
  }

  if (lowerName.includes('blight')) {
    disease = 'Late Blight';
  } else if (lowerName.includes('spot')) {
    disease = 'Leaf Spot';
  } else if (lowerName.includes('rust')) {
    disease = 'Rust';
  } else if (lowerName.includes('powdery')) {
    disease = 'Powdery Mildew';
  }

  return {
    prediction: disease,
    crop,
    confidence: 0.62,
    confidence_percentage: '62.00%',
    model_version: 'fallback-offline',
    predictions: [
      { class: disease, confidence: 0.62 },
      { class: 'Healthy', confidence: 0.25 },
      { class: 'Unknown', confidence: 0.13 }
    ],
    recommendation: 'ML service is temporarily unavailable, so this is a fallback estimate. Please retry after ML service is restored for accurate diagnosis.',
    fertilizers: [],
    gradcam: null
  };
}

function resolveAnalyzeUrl() {
  const candidates = [
    process.env.MODEL_SERVICE_URL,
    process.env.FLASK_ML_SERVICE_URL,
    process.env.FLASK_SERVICE_URL,
  ].filter(Boolean);
  let base = String(candidates[0] || 'http://127.0.0.1:5000').trim().replace(/\/+$/, '');
  if (/\/analyze$/i.test(base)) return base;
  return `${base}/analyze`;
}

async function callModelService(filePath) {
  const MODEL_SERVICE_URL = resolveAnalyzeUrl();

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
    const message = String(error.message || '');
    const code = String(error.code || '');
    const isServiceUnavailable =
      code === 'ECONNREFUSED' ||
      code === 'ECONNRESET' ||
      code === 'ETIMEDOUT' ||
      message.includes('ECONNREFUSED') ||
      message.includes('timeout') ||
      message.includes('Network Error');

    if (isServiceUnavailable) {
      console.warn('[MODEL] Falling back to offline estimate because ML service is unreachable.');
      return buildFallbackResult(filePath);
    }

    throw new Error(`Model service error: ${error.message}`);
  }
}

module.exports = { callModelService };
