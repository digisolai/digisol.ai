#!/usr/bin/env python3
"""
Simple script to test CORS configuration.
"""

import requests
import json

def test_cors():
    """Test CORS configuration by making a request from the frontend domain."""
    
    # Test endpoints
    endpoints = [
        "https://digisol-backend.onrender.com/api/accounts/me/",
        "https://digisol-backend.onrender.com/api/accounts/token/",
        "https://digisol-backend.onrender.com/api/ai-services/quota-status/",
    ]
    
    print("🔍 Testing CORS Configuration:")
    print("=" * 50)
    
    for endpoint in endpoints:
        try:
            # Make a preflight OPTIONS request to test CORS
            headers = {
                'Origin': 'https://digisolai.ca',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'authorization,content-type',
            }
            
            response = requests.options(endpoint, headers=headers)
            
            print(f"\n📍 Testing: {endpoint}")
            print(f"Status Code: {response.status_code}")
            
            # Check for CORS headers
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
                print("✅ CORS configured correctly")
            else:
                print("❌ CORS not configured correctly")
                
        except Exception as e:
            print(f"❌ Error testing {endpoint}: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎯 CORS Test Complete!")

if __name__ == "__main__":
    test_cors()
