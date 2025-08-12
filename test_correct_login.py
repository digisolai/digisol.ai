#!/usr/bin/env python3
"""
Test the correct login endpoint
"""

import requests
import json

def test_correct_login():
    """Test the correct login endpoint"""
    base_url = "https://digisol-backend.onrender.com"
    
    # Test the correct token endpoint with email
    data = {
        "email": "admin@digisolai.ca",
        "password": "admin123456"
    }
    
    print("🔑 Testing correct login endpoint...")
    print(f"URL: {base_url}/api/accounts/token/")
    print(f"Data: {data}")
    
    try:
        response = requests.post(f"{base_url}/api/accounts/token/", json=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print("❌ Login failed")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_correct_login()
