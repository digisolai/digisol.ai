#!/usr/bin/env python3
"""
Check production database state
"""

import requests
import json

def check_production_database():
    """Check production database state"""
    
    base_url = "https://digisol-backend.onrender.com"
    
    print("🔍 Checking production database state...")
    print(f"URL: {base_url}")
    print()
    
    # Test 1: Health endpoint
    print("1. Health Check:")
    try:
        health_response = requests.get(f"{base_url}/health/")
        print(f"   Status: {health_response.status_code}")
        print(f"   Response: {health_response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Admin interface
    print("\n2. Admin Interface:")
    try:
        admin_response = requests.get(f"{base_url}/admin/")
        print(f"   Status: {admin_response.status_code}")
        if admin_response.status_code == 200:
            print("   ✅ Admin interface accessible")
        else:
            print("   ❌ Admin interface not accessible")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Try to access database-related endpoints
    print("\n3. Database-related endpoints:")
    
    # Test if we can access any API endpoints
    endpoints_to_test = [
        "/api/accounts/register/",
        "/api/accounts/token/",
        "/api/accounts/me/",
        "/api/core/",
        "/api/campaigns/",
    ]
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            print(f"   {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"   {endpoint}: Error - {e}")
    
    # Test 4: Try to create a user via registration
    print("\n4. Test User Registration:")
    try:
        registration_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User"
        }
        
        reg_response = requests.post(
            f"{base_url}/api/accounts/register/",
            json=registration_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"   Registration Status: {reg_response.status_code}")
        print(f"   Response: {reg_response.text}")
        
        if reg_response.status_code == 201:
            print("   ✅ User registration successful - database is working!")
        else:
            print("   ❌ User registration failed")
            
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 5: Check if there are any existing users
    print("\n5. Test Login with Different Credentials:")
    
    test_credentials = [
        {"email": "admin@digisolai.ca", "password": "admin123456"},
        {"email": "admin@digisolai.ca", "password": "admin"},
        {"email": "admin", "password": "admin123456"},
        {"email": "test@example.com", "password": "testpass123"},
    ]
    
    for creds in test_credentials:
        try:
            login_response = requests.post(
                f"{base_url}/api/accounts/token/",
                json=creds,
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"   {creds['email']}: {login_response.status_code}")
            if login_response.status_code == 200:
                print(f"   ✅ SUCCESS with {creds['email']}!")
                break
            elif login_response.status_code == 401:
                print(f"   ❌ Invalid credentials")
            else:
                print(f"   ⚠️  Unexpected status: {login_response.text}")
                
        except Exception as e:
            print(f"   Error with {creds['email']}: {e}")

if __name__ == "__main__":
    check_production_database()
