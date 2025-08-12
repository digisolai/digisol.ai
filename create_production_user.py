#!/usr/bin/env python3
"""
Script to create a production user via API calls
"""
import requests
import json

# Production API configuration
PRODUCTION_API_URL = "https://digisol-backend.onrender.com/api"

def create_production_user():
    """Create a user in the production environment"""
    
    email = "admin@digisolai.ca"
    password = "admin123"
    first_name = "Admin"
    last_name = "User"
    
    print(f"🔍 Creating production user: {email}")
    
    # Step 1: Try to register the user
    registration_url = f"{PRODUCTION_API_URL}/accounts/register/"
    registration_data = {
        "email": email,
        "password": password,
        "confirm_password": password,
        "first_name": first_name,
        "last_name": last_name
    }
    
    try:
        print("📝 Attempting to register user...")
        response = requests.post(registration_url, json=registration_data)
        
        if response.status_code == 201:
            print("✅ User registered successfully!")
            print(f"📧 Email: {email}")
            print(f"🔑 Password: {password}")
            return True
        elif response.status_code == 400:
            error_data = response.json()
            if "email" in error_data and "already exists" in str(error_data["email"]):
                print("ℹ️  User already exists, testing login...")
                return test_production_login(email, password)
            else:
                print(f"❌ Registration failed: {error_data}")
                return False
        else:
            print(f"❌ Registration failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during registration: {e}")
        return False

def test_production_login(email, password):
    """Test login with the provided credentials"""
    
    login_url = f"{PRODUCTION_API_URL}/accounts/token/"
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        print("🔐 Testing login...")
        response = requests.post(login_url, json=login_data)
        
        if response.status_code == 200:
            response_data = response.json()
            print("✅ Login successful!")
            print(f"📧 Email: {email}")
            print(f"🔑 Password: {password}")
            print(f"👤 User: {response_data.get('user', {}).get('first_name', '')} {response_data.get('user', {}).get('last_name', '')}")
            print(f"🏢 Tenant: {response_data.get('user', {}).get('tenant', {}).get('name', 'N/A')}")
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

def check_production_status():
    """Check if the production API is accessible"""
    
    try:
        print("🌐 Checking production API status...")
        response = requests.get(f"{PRODUCTION_API_URL}/accounts/")
        
        if response.status_code == 200:
            print("✅ Production API is accessible")
            return True
        else:
            print(f"⚠️  Production API returned status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Cannot reach production API: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Production User Setup")
    print("=" * 50)
    
    # Try to create or verify the user directly
    success = create_production_user()
    
    if success:
        print("\n" + "=" * 50)
        print("✅ Production user setup completed!")
        print("\n💡 You can now use these credentials in your frontend:")
        print(f"   Email: admin@digisolai.ca")
        print(f"   Password: admin123")
    else:
        print("\n" + "=" * 50)
        print("❌ Production user setup failed!")
        print("\n🔧 Troubleshooting:")
        print("   1. Check if the production backend is running")
        print("   2. Verify the API endpoints are correct")
        print("   3. Check if there are any CORS issues")
        print("   4. Verify the user doesn't already exist with different credentials")
