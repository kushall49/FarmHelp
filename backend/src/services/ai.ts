import axios from 'axios';
import FormData from 'form-data';

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const FLASK_ML_SERVICE_URL = process.env.FLASK_ML_SERVICE_URL || 'http://localhost:5000';

const AIService = {
  // Analyze plant image using our Flask ML service
  async analyzePlant(buffer: Buffer) {
    try {
      // Create form data with image file
      const formData = new FormData();
      formData.append('file', buffer, {
        filename: 'plant_image.jpg',
        contentType: 'image/jpeg'
      });
      formData.append('return_gradcam', 'true');
      formData.append('top_k', '3');

      // Call Flask ML service
      const response = await axios.post(`${FLASK_ML_SERVICE_URL}/analyze`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 30000 // 30 second timeout
      });

      // Return the analysis result
      if (response.data.success) {
        return {
          crop: response.data.crop,
          disease: response.data.disease,
          confidence: response.data.confidence,
          confidence_percentage: response.data.confidence_percentage,
          predictions: response.data.predictions,
          recommendation: response.data.recommendation,
          recommendations: response.data.recommendations,
          fertilizers: response.data.fertilizers,
          gradcam: response.data.gradcam,
          processing_time_ms: response.data.total_processing_time_ms
        };
      } else {
        throw new Error('ML service returned unsuccessful response');
      }
    } catch (error: any) {
      console.error('Error calling Flask ML service:', error.message);
      
      // Return fallback response if ML service fails
      return {
        crop: 'Unknown',
        disease: 'Service Unavailable',
        confidence: 0.0,
        confidence_percentage: '0.00%',
        predictions: [],
        recommendation: 'Plant disease detection service is currently unavailable. Please try again later.',
        recommendations: {},
        fertilizers: [],
        error: error.message
      };
    }
  },

  async chat(message: string) {
    if (!OPENAI_KEY) return `Mock reply for: ${message}`;
    const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: process.env.AI_MODEL || 'gpt-4o',
      messages: [{ role: 'user', content: message }]
    }, { headers: { Authorization: `Bearer ${OPENAI_KEY}` } });
    return resp.data?.choices?.[0]?.message?.content || JSON.stringify(resp.data);
  }
};

export default AIService;
