#!/usr/bin/env python3
"""
Monitor deployment progress and test login
"""

import requests
import time
import json

def test_login():
    """Test login to production backend"""
    base_url = "https://digisol-backend.onrender.com"
    credentials = {
        "email": "admin@digisolai.ca",
        "password": "admin123456"
    }
    
    try:
        # Test health endpoint
        health_response = requests.get(f"{base_url}/health/")
        if health_response.status_code != 200:
            return False, f"Health check failed: {health_response.status_code}"
        
        # Test login endpoint
        login_url = f"{base_url}/api/accounts/token/"
        login_response = requests.post(
            login_url,
            json=credentials,
            headers={'Content-Type': 'application/json'}
        )
        
        if login_response.status_code == 200:
            return True, "Login successful!"
        else:
            return False, f"Login failed: {login_response.status_code} - {login_response.text}"
            
    except Exception as e:
        return False, f"Error: {e}"

def monitor_deployment():
    """Monitor deployment and test login"""
    print("🚀 Monitoring deployment progress...")
    print("⏰ Testing every 30 seconds...")
    print()
    
    attempt = 1
    max_attempts = 20  # 10 minutes total
    
    while attempt <= max_attempts:
        print(f"🔄 Attempt {attempt}/{max_attempts} - {time.strftime('%H:%M:%S')}")
        
        success, message = test_login()
        
        if success:
            print("✅ SUCCESS! Login is working!")
            print("📋 Login credentials:")
            print("   Email: admin@digisolai.ca")
            print("   Password: admin123456")
            print("   Admin URL: https://digisol-backend.onrender.com/admin/")
            return True
        else:
            print(f"❌ {message}")
            print()
            
            if attempt < max_attempts:
                print("⏳ Waiting 30 seconds before next attempt...")
                time.sleep(30)
            
        attempt += 1
    
    print("⏰ Timeout reached. Deployment might still be in progress.")
    print("💡 Check Render dashboard for deployment status.")
    return False

if __name__ == "__main__":
    monitor_deployment()
