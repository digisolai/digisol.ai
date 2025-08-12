import requests
import json

def test_existing_user():
    """Test login with existing test user"""
    
    base_url = "https://digisol-backend.onrender.com/api/accounts"
    
    # Try to login with the test user that was created
    print("Testing login with existing test user...")
    login_data = {
        "email": "test@example.com",
        "password": "TestPass123!"
    }
    
    try:
        login_response = requests.post(f"{base_url}/token/", json=login_data, headers={'Content-Type': 'application/json'})
        print(f"Login Status Code: {login_response.status_code}")
        print(f"Login Response: {login_response.text}")
        
        if login_response.status_code == 200:
            print("✅ Login successful!")
            return True
        else:
            print("❌ Login failed")
            
    except Exception as e:
        print(f"Error: {e}")
    
    return False

if __name__ == "__main__":
    test_existing_user()
