"""
Test API endpoints
"""
import pytest
import json
import base64
import io
from PIL import Image
import numpy as np
from app import app


@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def create_test_image():
    """Create a test image as base64"""
    # Create random RGB image
    image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    pil_image = Image.fromarray(image)
    
    # Convert to base64
    buffer = io.BytesIO()
    pil_image.save(buffer, format='JPEG')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return f"data:image/jpeg;base64,{image_base64}"


def test_index(client):
    """Test root endpoint"""
    response = client.get('/')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert 'service' in data
    assert 'endpoints' in data


def test_health(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert 'status' in data
    assert 'uptime_seconds' in data
    assert 'model_loaded' in data


def test_analyze_missing_image(client):
    """Test analyze endpoint with missing image"""
    response = client.post('/analyze',
                          json={},
                          content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['success'] is False


def test_analyze_invalid_base64(client):
    """Test analyze endpoint with invalid base64"""
    response = client.post('/analyze',
                          json={'image': 'invalid-base64'},
                          content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['success'] is False


def test_retrain_placeholder(client):
    """Test retrain endpoint (placeholder)"""
    response = client.post('/retrain',
                          json={},
                          content_type='application/json')
    
    assert response.status_code == 501
    data = json.loads(response.data)
    assert 'not yet implemented' in data['message'].lower()


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
