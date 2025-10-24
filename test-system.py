"""
Test script to verify plant disease analysis end-to-end
"""
import requests
import os
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:4000"
FLASK_URL = "http://127.0.0.1:5000"  # Use 127.0.0.1 for IPv4 (localhost may resolve to IPv6)

def test_services():
    """Test if both services are running"""
    print("=" * 80)
    print("  FarmHelp System Test")
    print("=" * 80)
    
    print("\n[1/4] Checking Services...")
    
    # Check Flask
    try:
        flask_health = requests.get(f"{FLASK_URL}/health", timeout=5)
        if flask_health.status_code == 200:
            health_data = flask_health.json()
            print(f"  ✅ Flask ML Service: Healthy")
            print(f"     Model: {health_data.get('model_info', {}).get('classes', 'N/A')} classes")
        else:
            print(f"  ❌ Flask ML Service: Status {flask_health.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Flask ML Service: {e}")
        return False
    
    # Check Backend
    try:
        backend_resp = requests.get(f"{BACKEND_URL}/", timeout=5)
        if backend_resp.status_code == 200:
            print(f"  ✅ Node.js Backend: Running")
        else:
            print(f"  ❌ Node.js Backend: Status {backend_resp.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Node.js Backend: {e}")
        return False
    
    return True

def test_flask_direct():
    """Test Flask service directly"""
    print("\n[2/4] Testing Flask ML Service...")
    
    # Find test image
    dataset_path = Path("C:/Users/kusha/OneDrive/Desktop/FarmHelp/model-service/data/PlantVillage/Tomato_Late_blight")
    
    if not dataset_path.exists():
        print(f"  ❌ Dataset not found at {dataset_path}")
        return None
    
    # Get first image
    images = list(dataset_path.glob("*.JPG"))
    if not images:
        images = list(dataset_path.glob("*.jpg"))
    
    if not images:
        print(f"  ❌ No images found in {dataset_path}")
        return None
    
    test_image = images[0]
    print(f"  Using image: {test_image.name}")
    print(f"  Size: {test_image.stat().st_size / 1024:.2f} KB")
    
    # Upload to Flask
    try:
        with open(test_image, 'rb') as f:
            files = {'file': (test_image.name, f, 'image/jpeg')}
            data = {
                'return_gradcam': 'true',
                'top_k': '3'
            }
            
            response = requests.post(f"{FLASK_URL}/analyze", files=files, data=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"  ✅ Flask Analysis Successful!")
                print(f"\n  Results:")
                print(f"    Crop:       {result['crop']}")
                print(f"    Disease:    {result['disease']}")
                
                # Validate confidence is between 0 and 100
                confidence_val = result.get('confidence', 0)
                confidence_raw = result.get('confidence_raw', 0)
                
                print(f"    Confidence: {confidence_val:.2f}%")
                print(f"    Confidence (raw): {confidence_raw:.4f}")
                print(f"    Time:       {result['total_processing_time_ms']} ms")
                
                # ✅ TEST ASSERTION: Validate confidence range
                if not (0 <= confidence_val <= 100):
                    print(f"\n  ❌ VALIDATION FAILED: Confidence {confidence_val}% is out of range [0, 100]!")
                    return None
                else:
                    print(f"  ✅ Confidence validation passed: {confidence_val}% ∈ [0, 100]")
                
                if result.get('predictions'):
                    print(f"\n  Top 3 Predictions:")
                    for i, pred in enumerate(result['predictions'][:3], 1):
                        # Handle different possible formats
                        class_name = pred.get('class_name', pred.get('class', 'Unknown'))
                        confidence_pct = pred.get('confidence_percent', pred.get('confidence', 0))
                        print(f"    {i}. {class_name} - {confidence_pct:.2f}%")
                
                if result.get('gradcam'):
                    print(f"  ✅ GradCAM visualization generated")
                
                return test_image
            else:
                print(f"  ❌ Flask returned unsuccessful: {result}")
                return None
        else:
            print(f"  ❌ Flask returned status {response.status_code}")
            print(f"  Response: {response.text[:200]}")
            return None
            
    except Exception as e:
        print(f"  ❌ Error testing Flask: {e}")
        return None

def test_backend_integration(test_image):
    """Test backend integration with Flask"""
    print("\n[3/4] Testing Backend Integration...")
    
    try:
        with open(test_image, 'rb') as f:
            files = {'image': (test_image.name, f, 'image/jpeg')}
            data = {'userId': 'test-user'}
            
            response = requests.post(
                f"{BACKEND_URL}/api/plant/upload-plant",
                files=files,
                data=data,
                timeout=60
            )
        
        if response.status_code == 200:
            result = response.json()
            print(f"  ✅ Backend Integration Successful!")
            
            if result.get('result'):
                r = result['result']
                print(f"\n  ========================================")
                print(f"    COMPLETE ANALYSIS")
                print(f"  ========================================")
                print(f"  Crop:        {r.get('crop', 'N/A')}")
                print(f"  Disease:     {r.get('disease', 'N/A')}")
                print(f"  Confidence:  {r.get('confidence_percentage', 'N/A')}")
                print(f"  Processing:  {r.get('processing_time_ms', 'N/A')} ms")
                
                if r.get('recommendation'):
                    print(f"\n  Recommendation:")
                    print(f"    {r['recommendation']}")
                
                if r.get('fertilizers'):
                    print(f"\n  Recommended Fertilizers:")
                    for fert in r['fertilizers']:
                        # Handle both string and dict fertilizers
                        if isinstance(fert, dict):
                            print(f"    - {fert.get('name', 'N/A')}")
                            if fert.get('npk_ratio'):
                                print(f"      NPK: {fert['npk_ratio']}")
                        else:
                            print(f"    - {fert}")
                
                if r.get('gradcam'):
                    print(f"\n  ✅ GradCAM: Generated (base64 data available)")
                
                print(f"\n  Record ID: {result.get('id', 'N/A')}")
                return True
            else:
                print(f"  ❌ No result in response")
                print(f"  Response: {result}")
                return False
        else:
            print(f"  ❌ Backend returned status {response.status_code}")
            print(f"  Response: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"  ❌ Error testing backend: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    if not test_services():
        print("\n❌ Services not running. Please start Flask and Backend first.")
        return
    
    test_image = test_flask_direct()
    if not test_image:
        print("\n❌ Flask test failed")
        return
    
    if not test_backend_integration(test_image):
        print("\n❌ Backend integration test failed")
        return
    
    print("\n[4/4] Summary")
    print("  ✅ Flask ML Service: Operational")
    print("  ✅ Backend API: Operational")
    print("  ✅ End-to-End Flow: Working")
    print("\n" + "=" * 80)
    print("  🎉 All Tests Passed! FarmHelp is ready!")
    print("=" * 80)

if __name__ == "__main__":
    main()
