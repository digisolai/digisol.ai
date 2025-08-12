#!/usr/bin/env python3
"""
Debug production deployment issues
"""

import requests
import json

def debug_production_deployment():
    """Debug production deployment issues"""
    
    base_url = "https://digisol-backend.onrender.com"
    
    print("🔍 Debugging production deployment...")
    print(f"URL: {base_url}")
    print()
    
    # Test 1: Check if the reset command actually ran
    print("1. Checking if database reset command ran...")
    
    # The key insight: "User with this email already exists" means there ARE users
    # But our reset command should have deleted them all
    
    # Let's try to register a user and see what happens
    test_users = [
        {
            "username": "debuguser1",
            "email": "debug1@example.com",
            "password": "debugpass123",
            "confirm_password": "debugpass123",
            "first_name": "Debug",
            "last_name": "User1"
        },
        {
            "username": "debuguser2", 
            "email": "debug2@example.com",
            "password": "debugpass123",
            "confirm_password": "debugpass123",
            "first_name": "Debug",
            "last_name": "User2"
        }
    ]
    
    for i, user_data in enumerate(test_users, 1):
        print(f"\n   Testing user {i}: {user_data['email']}")
        
        try:
            response = requests.post(
                f"{base_url}/api/accounts/register/",
                json=user_data,
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
            
            if response.status_code == 201:
                print(f"   ✅ User {i} created successfully!")
                print(f"   📧 Email: {user_data['email']}")
                print(f"   🔑 Password: {user_data['password']}")
                print(f"   🎉 This means the database is working and we can create users!")
                return user_data
            elif response.status_code == 400:
                if "already exists" in response.text:
                    print(f"   ⚠️  User already exists - database has data")
                else:
                    print(f"   ❌ Registration failed: {response.text}")
            else:
                print(f"   ❌ Unexpected status: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n2. Analysis:")
    print("   - If users can be created: Database is working, reset command didn't run")
    print("   - If users already exist: Database has data, reset command didn't work")
    print("   - If registration fails: Database might have issues")
    
    print("\n3. Possible Issues:")
    print("   a) Reset command didn't run during deployment")
    print("   b) Reset command ran but failed silently")
    print("   c) Reset command ran on wrong database")
    print("   d) Production is using a different database than expected")
    print("   e) Environment variables not set correctly")
    
    print("\n4. Next Steps:")
    print("   - Check Render deployment logs")
    print("   - Verify DATABASE_URL environment variable")
    print("   - Try manual database reset via Render shell")
    print("   - Check if multiple databases exist")

if __name__ == "__main__":
    debug_production_deployment()
