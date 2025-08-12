#!/usr/bin/env python3
"""
Detailed CORS test to check headers in responses.
"""

import requests
import json

def test_cors_detailed():
    """Test CORS configuration with detailed header analysis."""
    
    url = "https://digisol-backend.onrender.com/api/accounts/token/"
    headers = {
        'Origin': 'https://digisolai.ca',
        'Content-Type': 'application/json'
    }
    data = {
        'username': 'test@example.com',
        'password': 'testpassword'
    }
    
    print("Testing CORS Configuration - Detailed Analysis")
    print("=" * 60)
    
    # Test 1: Preflight request
    print("\n1. Testing OPTIONS (preflight) request:")
    print("-" * 40)
    
    preflight_headers = {
        'Origin': 'https://digisolai.ca',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization'
    }
    
    try:
        response = requests.options(url, headers=preflight_headers)
        print(f"Status Code: {response.status_code}")
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
        }
        
        print("CORS Headers:")
        for header, value in cors_headers.items():
            print(f"  {header}: {value}")
        
        if response.status_code == 200 and cors_headers['Access-Control-Allow-Origin']:
            print("✅ Preflight request successful with CORS headers")
        else:
            print("❌ Preflight request failed or missing CORS headers")
            
    except Exception as e:
        print(f"❌ Error testing preflight: {e}")
    
    # Test 2: Actual POST request
    print("\n2. Testing POST request:")
    print("-" * 40)
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Status Code: {response.status_code}")
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
        }
        
        print("CORS Headers:")
        for header, value in cors_headers.items():
            print(f"  {header}: {value}")
        
        if cors_headers['Access-Control-Allow-Origin']:
            print("✅ POST request has CORS headers")
        else:
            print("❌ POST request missing CORS headers")
            
        # Show response content for debugging
        try:
            response_data = response.json()
            print(f"Response: {json.dumps(response_data, indent=2)}")
        except:
            print(f"Response text: {response.text[:200]}...")
            
    except Exception as e:
        print(f"❌ Error testing POST: {e}")
    
    # Test 3: Test with valid credentials (if available)
    print("\n3. Testing with minimal data:")
    print("-" * 40)
    
    try:
        # Test with just username to see if we get a different response
        minimal_data = {'username': 'test@example.com'}
        response = requests.post(url, headers=headers, json=minimal_data)
        print(f"Status Code: {response.status_code}")
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
        }
        
        print("CORS Headers:")
        for header, value in cors_headers.items():
            print(f"  {header}: {value}")
        
        if cors_headers['Access-Control-Allow-Origin']:
            print("✅ Request has CORS headers")
        else:
            print("❌ Request missing CORS headers")
            
    except Exception as e:
        print(f"❌ Error testing minimal data: {e}")
    
    print("\n" + "=" * 60)
    print("CORS Test Complete")

if __name__ == "__main__":
    test_cors_detailed()
