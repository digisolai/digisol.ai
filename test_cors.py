#!/usr/bin/env python3
"""
Simple CORS test script
"""
import requests
import json

def test_cors():
    base_url = "https://digisol-backend.onrender.com"
    
    # Test 1: CORS test endpoint
    print("Testing CORS test endpoint...")
    try:
        response = requests.get(f"{base_url}/api/accounts/cors-test/", 
                              headers={'Origin': 'https://digisolai.ca'})
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Token endpoint OPTIONS (preflight)
    print("Testing token endpoint OPTIONS (preflight)...")
    try:
        response = requests.options(f"{base_url}/api/accounts/token/",
                                  headers={
                                      'Origin': 'https://digisolai.ca',
                                      'Access-Control-Request-Method': 'POST',
                                      'Access-Control-Request-Headers': 'Content-Type'
                                  })
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 3: Token endpoint POST
    print("Testing token endpoint POST...")
    try:
        response = requests.post(f"{base_url}/api/accounts/token/",
                               headers={
                                   'Origin': 'https://digisolai.ca',
                                   'Content-Type': 'application/json'
                               },
                               json={
                                   'email': 'admin@digisolai.ca',
                                   'password': 'test123'
                               })
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_cors()
