#!/usr/bin/env python3
"""
Deployment verification script
"""
import requests
import time
import sys

def check_health():
    """Check if the backend is healthy"""
    try:
        response = requests.get("https://digisol-backend.onrender.com/health/", timeout=10)
        if response.status_code == 200:
            print("✅ Backend is healthy")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend health check error: {e}")
        return False

def test_cors_endpoint():
    """Test the CORS test endpoint"""
    try:
        response = requests.get(
            "https://digisol-backend.onrender.com/api/accounts/cors-test/",
            headers={'Origin': 'https://digisolai.ca'},
            timeout=10
        )
        print(f"✅ CORS test endpoint: {response.status_code}")
        print(f"   Response: {response.text}")
        
        # Check for CORS headers
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Credentials',
            'Access-Control-Allow-Methods'
        ]
        
        for header in cors_headers:
            if header in response.headers:
                print(f"   ✅ {header}: {response.headers[header]}")
            else:
                print(f"   ❌ {header}: Missing")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ CORS test endpoint error: {e}")
        return False

def test_token_preflight():
    """Test token endpoint preflight request"""
    try:
        response = requests.options(
            "https://digisol-backend.onrender.com/api/accounts/token/",
            headers={
                'Origin': 'https://digisolai.ca',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=10
        )
        print(f"✅ Token preflight: {response.status_code}")
        
        # Check for CORS headers
        cors_headers = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Credentials',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers'
        ]
        
        for header in cors_headers:
            if header in response.headers:
                print(f"   ✅ {header}: {response.headers[header]}")
            else:
                print(f"   ❌ {header}: Missing")
        
        return response.status_code in [200, 204]
    except Exception as e:
        print(f"❌ Token preflight error: {e}")
        return False

def main():
    print("🚀 Verifying deployment...")
    print("=" * 50)
    
    # Wait a bit for deployment to complete
    print("⏳ Waiting 30 seconds for deployment to stabilize...")
    time.sleep(30)
    
    # Check health
    if not check_health():
        print("❌ Deployment verification failed - backend not healthy")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    
    # Test CORS endpoint
    if not test_cors_endpoint():
        print("❌ CORS test endpoint failed")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    
    # Test token preflight
    if not test_token_preflight():
        print("❌ Token preflight test failed")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("✅ All tests passed! Deployment appears to be working correctly.")
    print("🎉 CORS should now be working for your frontend.")

if __name__ == "__main__":
    main()
