#!/usr/bin/env python
"""
Script to create a user on the production server
"""
import requests
import json

def create_production_user():
    """Create a user on the production server"""
    
    backend_url = "https://digisol-backend.onrender.com"
    register_endpoint = f"{backend_url}/api/accounts/register/"
    
    print("🚀 Creating User on Production Server")
    print("=" * 50)
    
    user_data = {
        "email": "admin@digisolai.ca",
        "password": "DigiSol2024!",
        "first_name": "Admin",
        "last_name": "User",
        "tenant_name": "DigiSol.AI"
    }
    
    try:
        print("📝 Creating user account...")
        response = requests.post(
            register_endpoint,
            json=user_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print("✅ User created successfully!")
            print(f"📋 Response: {json.dumps(data, indent=2)}")
            print("\n💡 You can now use these credentials:")
            print(f"📧 Email: {user_data['email']}")
            print(f"🔑 Password: {user_data['password']}")
        elif response.status_code == 400:
            data = response.json()
            if "email" in data and "already exists" in str(data["email"]):
                print("✅ User already exists!")
                print(f"📧 Email: {user_data['email']}")
                print(f"🔑 Password: {user_data['password']}")
            else:
                print(f"❌ Registration failed: {data}")
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"📋 Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    create_production_user()
