#!/usr/bin/env python3
"""
Test the complete frontend authentication flow
"""
import requests
import json

# Production API configuration
PRODUCTION_API_URL = "https://digisol-backend.onrender.com/api"

def test_complete_auth_flow():
    """Test the complete authentication flow that the frontend uses"""
    
    email = "admin@digisolai.ca"
    password = "admin123456"
    
    print("🚀 Testing Complete Frontend Auth Flow")
    print("=" * 50)
    
    # Step 1: Login to get tokens
    print("1️⃣  Step 1: Login to get tokens")
    login_url = f"{PRODUCTION_API_URL}/accounts/token/"
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        
        if response.status_code == 200:
            response_data = response.json()
            access_token = response_data.get('access')
            refresh_token = response_data.get('refresh')
            
            print("✅ Login successful!")
            print(f"🔑 Access Token: {access_token[:50]}...")
            print(f"🔄 Refresh Token: {refresh_token[:50]}...")
            
            # Step 2: Test /accounts/me/ endpoint with token
            print("\n2️⃣  Step 2: Test /accounts/me/ endpoint")
            me_url = f"{PRODUCTION_API_URL}/accounts/me/"
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # Test with proper headers
            me_response = requests.get(me_url, headers=headers)
            
            print(f"📡 /me/ Response Status: {me_response.status_code}")
            print(f"📡 /me/ Response Headers:")
            for header, value in me_response.headers.items():
                if 'cors' in header.lower() or 'access-control' in header.lower():
                    print(f"   {header}: {value}")
            
            if me_response.status_code == 200:
                me_data = me_response.json()
                print("✅ /me/ endpoint successful!")
                print(f"👤 User: {me_data.get('first_name', '')} {me_data.get('last_name', '')}")
                print(f"📧 Email: {me_data.get('email', '')}")
                return True
            else:
                print(f"❌ /me/ endpoint failed!")
                try:
                    error_data = me_response.json()
                    print(f"Error details: {error_data}")
                except:
                    print(f"Error text: {me_response.text}")
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
        print(f"❌ Error during auth flow: {e}")
        return False

def test_cors_preflight():
    """Test CORS preflight request specifically"""
    
    print("\n🌐 Testing CORS Preflight Request")
    print("=" * 30)
    
    me_url = f"{PRODUCTION_API_URL}/accounts/me/"
    
    # Test OPTIONS request (preflight)
    headers = {
        'Origin': 'https://digisolai.ca',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type'
    }
    
    try:
        response = requests.options(me_url, headers=headers)
        
        print(f"📡 Preflight Response Status: {response.status_code}")
        print(f"📡 Preflight Response Headers:")
        for header, value in response.headers.items():
            if 'cors' in header.lower() or 'access-control' in header.lower():
                print(f"   {header}: {value}")
        
        if response.status_code == 200:
            print("✅ CORS preflight successful!")
            return True
        else:
            print(f"❌ CORS preflight failed!")
            print(f"Response text: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during CORS preflight: {e}")
        return False

if __name__ == "__main__":
    # Test the complete flow
    auth_success = test_complete_auth_flow()
    
    # Test CORS preflight
    cors_success = test_cors_preflight()
    
    print("\n" + "=" * 50)
    print("🏁 Test Results")
    print("=" * 50)
    
    if auth_success and cors_success:
        print("✅ All tests passed! The backend is working correctly.")
        print("\n💡 The issue might be in the frontend token handling.")
    elif auth_success and not cors_success:
        print("⚠️  Authentication works but CORS preflight fails.")
        print("This suggests a CORS configuration issue.")
    elif not auth_success and cors_success:
        print("⚠️  CORS works but authentication fails.")
        print("This suggests a token or endpoint issue.")
    else:
        print("❌ Both authentication and CORS are failing.")
        print("This suggests a broader backend issue.")
