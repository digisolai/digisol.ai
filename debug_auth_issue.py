#!/usr/bin/env python3
"""
Debug authentication issue without making changes
"""

import requests
import json

def debug_auth():
    """Debug the authentication issue"""
    base_url = "https://digisol-backend.onrender.com"
    
    print("🔍 Debugging Authentication Issue")
    print("=" * 50)
    
    # Test 1: Try with username instead of email
    print("\n1️⃣ Testing with username field:")
    data = {
        "username": "admin@digisolai.ca",
        "password": "admin123456"
    }
    try:
        response = requests.post(f"{base_url}/api/accounts/token/", json=data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Try with email field
    print("\n2️⃣ Testing with email field:")
    data = {
        "email": "admin@digisolai.ca",
        "password": "admin123456"
    }
    try:
        response = requests.post(f"{base_url}/api/accounts/token/", json=data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Try registration to see what users exist
    print("\n3️⃣ Testing registration to see existing users:")
    data = {
        "username": "debuguser",
        "email": "debug@example.com",
        "password": "debug123456",
        "confirm_password": "debug123456",
        "first_name": "Debug",
        "last_name": "User"
    }
    try:
        response = requests.post(f"{base_url}/api/accounts/register/", json=data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 4: Try login with the debug user
    print("\n4️⃣ Testing login with debug user:")
    data = {
        "email": "debug@example.com",
        "password": "debug123456"
    }
    try:
        response = requests.post(f"{base_url}/api/accounts/token/", json=data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")

if __name__ == "__main__":
    debug_auth()
