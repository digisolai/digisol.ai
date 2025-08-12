#!/usr/bin/env python3
"""
Test production login functionality
"""

import requests
import json

def test_production_login():
    """Test login to production backend"""
    
    # Production backend URL
    base_url = "https://digisol-backend.onrender.com"
    
    # Test credentials
    credentials = {
        "email": "admin@digisolai.ca",
        "password": "admin123456"
    }
    
    print("🧪 Testing production login...")
    print(f"URL: {base_url}")
    print(f"Credentials: {credentials['email']}")
    
    try:
        # Test 1: Health check
        print("\n1. Testing health endpoint...")
        health_response = requests.get(f"{base_url}/health/")
        print(f"   Status: {health_response.status_code}")
        print(f"   Response: {health_response.text}")
        
        # Test 2: Login endpoint
        print("\n2. Testing login endpoint...")
        login_url = f"{base_url}/api/accounts/token/"
        login_response = requests.post(
            login_url,
            json=credentials,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"   Status: {login_response.status_code}")
        print(f"   Response: {login_response.text}")
        
        if login_response.status_code == 200:
            data = login_response.json()
            print("✅ Login successful!")
            print(f"   Access token: {data.get('access', 'Not found')[:50]}...")
            print(f"   Refresh token: {data.get('refresh', 'Not found')[:50]}...")
            
            # Test 3: User profile with token
            print("\n3. Testing user profile...")
            headers = {
                'Authorization': f"Bearer {data.get('access')}",
                'Content-Type': 'application/json'
            }
            
            profile_response = requests.get(
                f"{base_url}/api/accounts/me/",
                headers=headers
            )
            
            print(f"   Status: {profile_response.status_code}")
            print(f"   Response: {profile_response.text}")
            
            if profile_response.status_code == 200:
                print("✅ Profile access successful!")
            else:
                print("❌ Profile access failed!")
                
        else:
            print("❌ Login failed!")
            
        # Test 4: Admin interface
        print("\n4. Testing admin interface...")
        admin_response = requests.get(f"{base_url}/admin/")
        print(f"   Status: {admin_response.status_code}")
        
        if admin_response.status_code == 200:
            print("✅ Admin interface accessible!")
        else:
            print("❌ Admin interface not accessible!")
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_production_login()
