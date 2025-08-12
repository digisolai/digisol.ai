#!/usr/bin/env python3
"""
Test production database state
"""

import requests
import json

def test_production_state():
    """Test the production database state"""
    base_url = "https://digisol-backend.onrender.com"
    
    print("🔍 Testing Production Database State")
    print("=" * 50)
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/api/core/health/")
        print(f"🏥 Health endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"  Response: {response.json()}")
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
    
    # Test registration endpoint with complete data
    try:
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "test123456",
            "confirm_password": "test123456",
            "first_name": "Test",
            "last_name": "User"
        }
        response = requests.post(f"{base_url}/api/accounts/register/", json=data)
        print(f"\n📝 Registration endpoint: {response.status_code}")
        if response.status_code in [200, 201, 400]:
            print(f"  Response: {response.json()}")
    except Exception as e:
        print(f"❌ Registration endpoint failed: {e}")
    
    # Test login with the test user
    try:
        data = {
            "email": "test@example.com",
            "password": "test123456"
        }
        response = requests.post(f"{base_url}/api/accounts/token/", json=data)
        print(f"\n🔑 Test user login: {response.status_code}")
        if response.status_code in [200, 400, 401]:
            print(f"  Response: {response.json()}")
    except Exception as e:
        print(f"❌ Test user login failed: {e}")
    
    # Test admin login
    try:
        data = {
            "email": "admin@digisolai.ca",
            "password": "admin123456"
        }
        response = requests.post(f"{base_url}/api/accounts/token/", json=data)
        print(f"\n🔑 Admin login: {response.status_code}")
        if response.status_code in [200, 400, 401]:
            print(f"  Response: {response.json()}")
    except Exception as e:
        print(f"❌ Admin login failed: {e}")

if __name__ == "__main__":
    test_production_state()
