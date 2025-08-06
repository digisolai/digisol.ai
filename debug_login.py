#!/usr/bin/env python3
"""
Debug script to test login functionality
"""
import requests
import json
import sys

def test_backend_connectivity():
    """Test if backend is reachable"""
    print("1. Testing backend connectivity...")
    try:
        response = requests.get("http://localhost:8000/api/accounts/me/", timeout=5)
        print(f"   Backend response status: {response.status_code}")
        if response.status_code == 401:
            print("   ✅ Backend is reachable (401 expected for unauthenticated request)")
            return True
        else:
            print(f"   ⚠️  Unexpected status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Backend connectivity failed: {e}")
        return False

def test_login():
    """Test login functionality"""
    print("\n2. Testing login...")
    try:
        login_data = {
            "email": "test@example.com",
            "password": "testpass123"
        }
        
        response = requests.post(
            "http://localhost:8000/api/accounts/token/",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"   Login response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Login successful")
            print(f"   Access token: {data.get('access', '')[:20]}...")
            print(f"   Refresh token: {data.get('refresh', '')[:20]}...")
            return data.get('access')
        else:
            print(f"   ❌ Login failed")
            print(f"   Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Login request failed: {e}")
        return None

def test_authenticated_request(access_token):
    """Test authenticated request"""
    print("\n3. Testing authenticated request...")
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            "http://localhost:8000/api/accounts/me/",
            headers=headers,
            timeout=10
        )
        
        print(f"   Authenticated request status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Authenticated request successful")
            print(f"   User: {data.get('email', 'Unknown')}")
            print(f"   Name: {data.get('first_name', '')} {data.get('last_name', '')}")
            return True
        else:
            print(f"   ❌ Authenticated request failed")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Authenticated request failed: {e}")
        return False

def test_frontend_proxy():
    """Test if frontend proxy is working"""
    print("\n4. Testing frontend proxy...")
    try:
        response = requests.get("http://localhost:5173/api/accounts/me/", timeout=5)
        print(f"   Frontend proxy response status: {response.status_code}")
        if response.status_code == 401:
            print("   ✅ Frontend proxy is working (401 expected for unauthenticated request)")
            return True
        else:
            print(f"   ⚠️  Unexpected status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Frontend proxy failed: {e}")
        return False

def main():
    print("=== Login Debug Test ===\n")
    
    # Test backend connectivity
    if not test_backend_connectivity():
        print("\n❌ Backend is not reachable. Please check if Django server is running on port 8000.")
        sys.exit(1)
    
    # Test login
    access_token = test_login()
    if not access_token:
        print("\n❌ Login failed. Please check credentials and backend configuration.")
        sys.exit(1)
    
    # Test authenticated request
    if not test_authenticated_request(access_token):
        print("\n❌ Authenticated request failed. Please check JWT configuration.")
        sys.exit(1)
    
    # Test frontend proxy
    if not test_frontend_proxy():
        print("\n❌ Frontend proxy is not working. Please check if Vite dev server is running on port 5173.")
        sys.exit(1)
    
    print("\n✅ All tests passed! The login system should be working.")
    print("\nIf you're still having issues logging in through the website:")
    print("1. Check browser console for JavaScript errors")
    print("2. Check browser network tab for failed requests")
    print("3. Clear browser cache and localStorage")
    print("4. Try accessing http://localhost:5173/login directly")

if __name__ == "__main__":
    main() 