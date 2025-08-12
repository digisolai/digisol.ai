import requests
import json

def test_simple_auth():
    """Test simple authentication flow"""
    
    base_url = "https://digisol-backend.onrender.com/api/accounts"
    
    # Test 1: Check if the endpoint is accessible
    print("Testing endpoint accessibility...")
    try:
        response = requests.get(f"{base_url}/", headers={'Content-Type': 'application/json'})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Try to register a simple user
    print("\nTesting user registration...")
    test_user_data = {
        "email": "test@example.com",
        "password": "TestPass123!",
        "confirm_password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User"
    }
    
    try:
        response = requests.post(f"{base_url}/register/", json=test_user_data, headers={'Content-Type': 'application/json'})
        print(f"Registration Status Code: {response.status_code}")
        print(f"Registration Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ User registration successful!")
            
            # Test 3: Try to login with the new user
            print("\nTesting login with new user...")
            login_data = {
                "email": "test@example.com",
                "password": "TestPass123!"
            }
            
            login_response = requests.post(f"{base_url}/token/", json=login_data, headers={'Content-Type': 'application/json'})
            print(f"Login Status Code: {login_response.status_code}")
            print(f"Login Response: {login_response.text}")
            
            if login_response.status_code == 200:
                print("✅ Login successful!")
                return True
            else:
                print("❌ Login failed")
        else:
            print("❌ User registration failed")
            
    except Exception as e:
        print(f"Error: {e}")
    
    return False

if __name__ == "__main__":
    test_simple_auth()
