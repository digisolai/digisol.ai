#!/usr/bin/env python3
"""
Test login response to verify it includes user data
"""
import requests
import json

# Production API configuration
PRODUCTION_API_URL = "https://digisol-backend.onrender.com/api"

def test_login_response():
    """Test login response to see if it includes user data"""
    
    email = "admin@digisolai.ca"
    password = "admin123456"
    
    print("🔍 Testing login response structure")
    print("=" * 50)
    
    login_url = f"{PRODUCTION_API_URL}/accounts/token/"
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        
        if response.status_code == 200:
            response_data = response.json()
            print("✅ Login successful!")
            print("\n📋 Response structure:")
            print(json.dumps(response_data, indent=2))
            
            # Check if user data is included
            if 'user' in response_data:
                print("\n✅ User data found in login response!")
                user_data = response_data['user']
                print(f"👤 User: {user_data.get('first_name', '')} {user_data.get('last_name', '')}")
                print(f"📧 Email: {user_data.get('email', '')}")
                print(f"🏢 Tenant: {user_data.get('tenant', {}).get('name', 'N/A')}")
                return True
            else:
                print("\n❌ No user data in login response!")
                return False
                
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
    success = test_login_response()
    
    if success:
        print("\n" + "=" * 50)
        print("✅ Login response includes user data!")
        print("💡 Frontend can use this data instead of calling /accounts/me/")
    else:
        print("\n" + "=" * 50)
        print("❌ Login response test failed!")
