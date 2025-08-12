#!/usr/bin/env python3
"""
Test production login with the correct password
"""
import requests
import json

# Production API configuration
PRODUCTION_API_URL = "https://digisol-backend.onrender.com/api"

def test_production_login():
    """Test login with the correct production password"""
    
    email = "admin@digisolai.ca"
    password = "admin123456"  # The original password
    
    print(f"🔍 Testing production login: {email}")
    
    login_url = f"{PRODUCTION_API_URL}/accounts/token/"
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        print("🔐 Attempting login...")
        response = requests.post(login_url, json=login_data)
        
        if response.status_code == 200:
            response_data = response.json()
            print("✅ Login successful!")
            print(f"📧 Email: {email}")
            print(f"🔑 Password: {password}")
            print(f"👤 User: {response_data.get('user', {}).get('first_name', '')} {response_data.get('user', {}).get('last_name', '')}")
            print(f"🏢 Tenant: {response_data.get('user', {}).get('tenant', {}).get('name', 'N/A')}")
            print(f"🔑 Access Token: {response_data.get('access', 'Not found')[:50]}...")
            return True
        else:
            print(f"❌ Login failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {error_data}")
            except:
                print(f"Error text: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during login test: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Production Login Test")
    print("=" * 50)
    
    success = test_production_login()
    
    if success:
        print("\n" + "=" * 50)
        print("✅ Production login successful!")
        print("\n💡 Use these credentials in your frontend:")
        print(f"   Email: admin@digisolai.ca")
        print(f"   Password: admin123456")
    else:
        print("\n" + "=" * 50)
        print("❌ Production login failed!")
        print("The password might be different or the user doesn't exist.")
