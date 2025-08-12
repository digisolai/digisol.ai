import requests
import json

def test_token_endpoint():
    """Test the token endpoint to identify the exact issue"""
    
    url = "https://digisol-backend.onrender.com/api/accounts/token/"
    
    # Test with actual superuser credentials
    test_data = {
        "email": "admin@digisolai.ca",
        "password": "DigiSol2024!"
    }
    
    print("Testing token endpoint with superuser credentials...")
    try:
        response = requests.post(url, json=test_data, headers={'Content-Type': 'application/json'})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Token endpoint is working!")
        else:
            print("❌ Token endpoint is still failing")
            
    except Exception as e:
        print(f"Error: {e}")
    
    # Test with username field as well
    test_data_username = {
        "username": "admin@digisolai.ca",
        "password": "DigiSol2024!"
    }
    
    print("\nTesting token endpoint with username field...")
    try:
        response = requests.post(url, json=test_data_username, headers={'Content-Type': 'application/json'})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_token_endpoint()
