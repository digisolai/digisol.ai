#!/usr/bin/env python3
"""
Test script to verify login functionality with the correct field names
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/accounts/token/"

def test_login_with_email():
    """Test login with email field (correct)"""
    print("🔍 Testing login with email field...")
    
    # Test data with email field (correct)
    login_data = {
        "email": "admin@digisolai.ca",
        "password": "admin123"  # You'll need to set the actual password
    }
    
    try:
        response = requests.post(LOGIN_URL, json=login_data)
        
        print(f"📡 Response Status: {response.status_code}")
        print(f"📡 Response Headers:")
        for header, value in response.headers.items():
            if 'cors' in header.lower() or 'access-control' in header.lower():
                print(f"   {header}: {value}")
        
        print(f"📡 Response Body:")
        try:
            response_json = response.json()
            print(json.dumps(response_json, indent=2))
        except:
            print(response.text)
            
        if response.status_code == 200:
            print("✅ Login successful!")
            print(f"🔑 Access Token: {response_json.get('access', 'Not found')[:50]}...")
            print(f"🔄 Refresh Token: {response_json.get('refresh', 'Not found')[:50]}...")
        else:
            print("❌ Login failed!")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_login_with_username():
    """Test login with username field (incorrect for this setup)"""
    print("\n🔍 Testing login with username field (should fail)...")
    
    # Test data with username field (incorrect for this setup)
    login_data = {
        "username": "admin@digisolai.ca",
        "password": "admin123"
    }
    
    try:
        response = requests.post(LOGIN_URL, json=login_data)
        
        print(f"📡 Response Status: {response.status_code}")
        print(f"📡 Response Body:")
        try:
            response_json = response.json()
            print(json.dumps(response_json, indent=2))
        except:
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_registration():
    """Test user registration"""
    print("\n🔍 Testing user registration...")
    
    registration_url = f"{BASE_URL}/api/accounts/register/"
    
    # Test data for registration
    registration_data = {
        "email": "test@example.com",
        "password": "testpass123",
        "confirm_password": "testpass123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    try:
        response = requests.post(registration_url, json=registration_data)
        
        print(f"📡 Response Status: {response.status_code}")
        print(f"📡 Response Body:")
        try:
            response_json = response.json()
            print(json.dumps(response_json, indent=2))
        except:
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Starting login tests...")
    print("=" * 50)
    
    test_login_with_email()
    test_login_with_username()
    test_registration()
    
    print("\n" + "=" * 50)
    print("🏁 Tests completed!")
    print("\n💡 Note: If login fails, you may need to:")
    print("   1. Set the correct password for admin@digisolai.ca")
    print("   2. Check if the Django server is running on localhost:8000")
    print("   3. Verify the database has the user account")
