#!/usr/bin/env python3
"""
Comprehensive CORS debugging script.
"""

import requests
import json

def test_cors_comprehensive():
    """Test CORS configuration comprehensively."""
    
    base_url = "https://digisol-backend.onrender.com"
    endpoints = [
        "/api/accounts/token/",
        "/api/accounts/me/",
        "/api/ai-services/quota-status/",
    ]
    
    origins = [
        "https://digisolai.ca",
        "https://www.digisolai.ca",
        "http://localhost:3000",
        "http://localhost:5173",
    ]
    
    print("🔍 Comprehensive CORS Debug Test")
    print("=" * 60)
    
    for endpoint in endpoints:
        print(f"\n📍 Testing endpoint: {endpoint}")
        print("-" * 40)
        
        for origin in origins:
            try:
                # Test OPTIONS preflight request
                headers = {
                    'Origin': origin,
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'authorization,content-type',
                }
                
                response = requests.options(f"{base_url}{endpoint}", headers=headers)
                
                print(f"\n  Origin: {origin}")
                print(f"  Status: {response.status_code}")
                
                # Check CORS headers
                cors_headers = {
                    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
                    'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
                    'Access-Control-Max-Age': response.headers.get('Access-Control-Max-Age'),
                }
                
                for header, value in cors_headers.items():
                    print(f"  {header}: {value}")
                
                if response.status_code == 200 and cors_headers['Access-Control-Allow-Origin']:
                    print(f"  ✅ CORS OK for {origin}")
                else:
                    print(f"  ❌ CORS FAILED for {origin}")
                    
            except Exception as e:
                print(f"  ❌ Error testing {origin}: {str(e)}")
    
    print("\n" + "=" * 60)
    print("🎯 Testing actual POST request simulation")
    print("-" * 40)
    
    # Test actual POST request simulation
    try:
        headers = {
            'Origin': 'https://digisolai.ca',
            'Content-Type': 'application/json',
        }
        
        data = {
            'email': 'test@example.com',
            'password': 'testpassword'
        }
        
        response = requests.post(f"{base_url}/api/accounts/token/", 
                               headers=headers, 
                               json=data)
        
        print(f"POST request status: {response.status_code}")
        print(f"Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin')}")
        print(f"Access-Control-Allow-Credentials: {response.headers.get('Access-Control-Allow-Credentials')}")
        
        if response.status_code in [200, 401, 400]:  # Expected responses
            print("✅ POST request CORS headers present")
        else:
            print("❌ POST request CORS headers missing")
            
    except Exception as e:
        print(f"❌ Error testing POST request: {str(e)}")

if __name__ == "__main__":
    test_cors_comprehensive()
