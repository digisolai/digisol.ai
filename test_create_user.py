import requests
import json

def test_user_creation_and_auth():
    """Test user creation and authentication flow"""
    
    base_url = "https://digisol-backend.onrender.com/api/accounts"
    
    # Test data for user registration
    test_user_data = {
        "email": "testuser@example.com",
        "password": "TestPass123!",
        "confirm_password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User"
    }
    
    print("Testing user registration...")
    try:
        response = requests.post(f"{base_url}/register/", json=test_user_data, headers={'Content-Type': 'application/json'})
        print(f"Registration Status Code: {response.status_code}")
        print(f"Registration Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ User registration successful!")
            
            # Now test login with the new user
            print("\nTesting login with new user...")
            login_data = {
                "email": "testuser@example.com",
                "password": "TestPass123!"
            }
            
            login_response = requests.post(f"{base_url}/token/", json=login_data, headers={'Content-Type': 'application/json'})
            print(f"Login Status Code: {login_response.status_code}")
            print(f"Login Response: {login_response.text}")
            
            if login_response.status_code == 200:
                print("✅ Login successful!")
            else:
                print("❌ Login failed")
        else:
            print("❌ User registration failed")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_user_creation_and_auth()
