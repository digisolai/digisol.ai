#!/usr/bin/env python
"""
Script to authenticate and trigger AI agents setup on production backend
"""
import requests
import json
import getpass

def login_and_setup_ai_agents():
    """Login and trigger AI agents setup"""
    
    # Production backend URL
    backend_url = "https://digisol-backend.onrender.com"
    login_endpoint = f"{backend_url}/api/accounts/token/"
    setup_endpoint = f"{backend_url}/api/ai-services/setup-agents/"
    
    print("🚀 AI Agents Setup with Authentication")
    print("=" * 50)
    
    # Get credentials
    email = input("Enter your email: ")
    password = getpass.getpass("Enter your password: ")
    
    try:
        # Step 1: Get JWT token
        print("🔐 Getting JWT token...")
        login_response = requests.post(
            login_endpoint,
            json={
                'email': email,
                'password': password
            },
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"📋 Response: {login_response.text}")
            return
        
        # Extract access token
        login_data = login_response.json()
        access_token = login_data.get('access')
        
        if not access_token:
            print("❌ No access token received")
            return
        
        print("✅ Login successful!")
        
        # Step 2: Trigger AI agents setup
        print("🤖 Setting up AI agents...")
        setup_response = requests.post(
            setup_endpoint,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {access_token}'
            },
            timeout=30
        )
        
        print(f"📊 Setup Status Code: {setup_response.status_code}")
        
        if setup_response.status_code == 200:
            data = setup_response.json()
            print("✅ AI Agents Setup Successful!")
            print(f"📋 Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Setup failed: {setup_response.status_code}")
            print(f"📋 Response: {setup_response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    login_and_setup_ai_agents()
