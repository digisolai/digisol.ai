#!/usr/bin/env python
"""
Test authentication for DigiSol.AI
"""
import requests
import json

def test_authentication():
    """Test the authentication system"""
    
    print("🔐 Testing DigiSol.AI Authentication")
    print("=" * 40)
    
    # Production backend URL
    base_url = "https://digisol-backend.onrender.com"
    login_url = f"{base_url}/api/accounts/token/"
    
    # Your credentials
    credentials = {
        "email": "cam.r.brown82@gmail.com",
        "password": "your_password_here"  # Replace with your actual password
    }
    
    try:
        print("1. Testing login endpoint...")
        response = requests.post(
            login_url,
            json=credentials,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Login successful!")
            print(f"   Access Token: {data.get('access', '')[:20]}...")
            print(f"   Refresh Token: {data.get('refresh', '')[:20]}...")
            
            # Test authenticated endpoint
            print("\n2. Testing authenticated endpoint...")
            headers = {"Authorization": f"Bearer {data['access']}"}
            me_response = requests.get(f"{base_url}/api/accounts/me/", headers=headers)
            
            if me_response.status_code == 200:
                user_data = me_response.json()
                print("   ✅ Authenticated request successful!")
                print(f"   User: {user_data.get('first_name', '')} {user_data.get('last_name', '')}")
                print(f"   Email: {user_data.get('email', '')}")
                print(f"   Tenant: {user_data.get('tenant', {}).get('name', 'N/A')}")
            else:
                print(f"   ❌ Authenticated request failed: {me_response.status_code}")
                print(f"   Response: {me_response.text}")
                
        else:
            print(f"   ❌ Login failed!")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request failed: {e}")
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_authentication()
