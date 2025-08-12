#!/usr/bin/env python3
"""
Test script to verify CORS middleware is working correctly.
"""

import requests
import json

def test_cors_preflight():
    """Test CORS preflight request to the token endpoint."""
    
    url = "https://digisol-backend.onrender.com/api/accounts/token/"
    headers = {
        'Origin': 'https://digisolai.ca',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization'
    }
    
    print(f"Testing CORS preflight request to: {url}")
    print(f"Origin: {headers['Origin']}")
    print("-" * 50)
    
    try:
        response = requests.options(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
        
        if response.status_code == 200:
            print("\n✅ CORS preflight request successful!")
            return True
        else:
            print(f"\n❌ CORS preflight request failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error testing CORS: {e}")
        return False

def test_actual_request():
    """Test actual POST request to the token endpoint."""
    
    url = "https://digisol-backend.onrender.com/api/accounts/token/"
    headers = {
        'Origin': 'https://digisolai.ca',
        'Content-Type': 'application/json'
    }
    data = {
        'username': 'test@example.com',
        'password': 'testpassword'
    }
    
    print(f"\nTesting actual POST request to: {url}")
    print(f"Origin: {headers['Origin']}")
    print("-" * 50)
    
    try:
        response = requests.post(url, headers=headers, json=data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
        
        if 'Access-Control-Allow-Origin' in response.headers:
            print(f"\n✅ CORS headers present in response!")
            return True
        else:
            print(f"\n❌ CORS headers missing from response")
            return False
            
    except Exception as e:
        print(f"\n❌ Error testing actual request: {e}")
        return False

if __name__ == "__main__":
    print("Testing CORS Configuration for DigiSol Backend")
    print("=" * 60)
    
    preflight_success = test_cors_preflight()
    actual_success = test_actual_request()
    
    print("\n" + "=" * 60)
    if preflight_success and actual_success:
        print("🎉 All CORS tests passed!")
    else:
        print("⚠️  Some CORS tests failed. Check the configuration.")
