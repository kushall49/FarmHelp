"""
Simple Flask ML Service - Fallback for Testing
Returns mock predictions when TensorFlow is not available.
Accepts both `file` and `image` multipart fields to match backend clients.
"""
import os
import hashlib
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

def _pick_prediction(file_bytes: bytes):
    """Pick deterministic mock prediction from file bytes."""
    if not file_bytes:
        return MOCK_PREDICTIONS[0]
    digest = hashlib.sha256(file_bytes).hexdigest()
    index = int(digest[:8], 16) % len(MOCK_PREDICTIONS)
    return MOCK_PREDICTIONS[index]


@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze plant image - returns deterministic mock data."""
    try:
        upload = request.files.get('file') or request.files.get('image')
        if upload is None:
            return jsonify({
                'error': 'No image file provided'
            }), 400

        file_bytes = upload.read()
        upload.seek(0)
        prediction = _pick_prediction(file_bytes)
        
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
            'recommendations': {
                'summary': f"Start treatment for {prediction['disease']} and monitor leaves for 3-5 days.",
                'organic': ['Neem oil spray every 5-7 days', 'Remove heavily affected leaves'],
                'chemical': ['Use a crop-safe fungicide/bactericide as per label'],
                'preventive': ['Avoid overwatering', 'Improve air circulation']
            },
            'fertilizers': []
        })
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"\n{'='*60}")
    print(f"ML Service (Mock Mode) Starting on Port {port}")
    print(f"{'='*60}\n")
    app.run(host='0.0.0.0', port=port, debug=False)
