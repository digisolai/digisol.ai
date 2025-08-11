#!/usr/bin/env python
"""
Script to trigger AI agents setup on production backend
"""
import requests
import json

def trigger_ai_setup():
    """Trigger AI agents setup on production backend"""
    
    # Production backend URL
    backend_url = "https://digisol-backend.onrender.com"
    setup_endpoint = f"{backend_url}/api/ai-services/setup-agents/"
    
    print("🚀 Triggering AI Agents Setup...")
    print(f"📡 Endpoint: {setup_endpoint}")
    
    try:
        # Make POST request to setup endpoint
        response = requests.post(
            setup_endpoint,
            headers={
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN_HERE'  # This will need to be updated
            },
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"📋 Response: {json.dumps(data, indent=2)}")
        elif response.status_code == 401:
            print("❌ Authentication required")
            print("💡 You need to provide a valid authentication token")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📋 Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    trigger_ai_setup()
