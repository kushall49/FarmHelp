"""
Simple Flask ML Service - Fallback for Testing
Returns mock predictions when TensorFlow is not available
"""
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Mock disease predictions
MOCK_PREDICTIONS = [
    {"crop": "Tomato", "disease": "Early Blight", "confidence": 0.92},
    {"crop": "Potato", "disease": "Late Blight", "confidence": 0.88},
    {"crop": "Corn", "disease": "Healthy", "confidence": 0.95},
]

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ml-service-mock',
        'version': '1.0.0'
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze plant image - returns mock data"""
    try:
        if 'image' not in request.files:
            return jsonify({
                'error': 'No image file provided'
            }), 400
        
        # Get a mock prediction
        import random
        prediction = random.choice(MOCK_PREDICTIONS)
        
        return jsonify({
            'success': True,
            'prediction': f"{prediction['crop']} - {prediction['disease']}",
            'crop': prediction['crop'],
            'disease': prediction['disease'],
            'confidence': prediction['confidence'],
            'confidence_percentage': f"{prediction['confidence'] * 100:.1f}%",
            'model_version': 'mock-1.0',
            'predictions': [
                {
                    'class': prediction['disease'],
                    'confidence': prediction['confidence']
                }
            ],
            'recommendation': f"This appears to be {prediction['disease']}. Please consult a local agricultural expert for treatment.",
            'fertilizers': []
        })
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"\n{'='*60}")
    print(f"🚀 ML Service (Mock Mode) Starting on Port {port}")
    print(f"{'='*60}\n")
    app.run(host='0.0.0.0', port=port, debug=False)
