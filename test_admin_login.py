#!/usr/bin/env python3
"""
Test admin interface login
"""

import requests
from bs4 import BeautifulSoup

def test_admin_login():
    """Test admin interface login"""
    
    base_url = "https://digisol-backend.onrender.com"
    
    print("🔍 Testing admin interface login...")
    print(f"URL: {base_url}/admin/")
    print()
    
    try:
        # Get the admin login page
        admin_response = requests.get(f"{base_url}/admin/")
        print(f"Admin page status: {admin_response.status_code}")
        
        if admin_response.status_code == 200:
            # Parse the HTML to see if there's a login form
            soup = BeautifulSoup(admin_response.text, 'html.parser')
            
            # Look for login form
            login_form = soup.find('form')
            if login_form:
                print("✅ Admin login form found")
                
                # Look for any error messages
                error_messages = soup.find_all(class_='errornote')
                if error_messages:
                    print("⚠️  Error messages found:")
                    for error in error_messages:
                        print(f"   {error.get_text().strip()}")
                
                # Look for any success messages
                success_messages = soup.find_all(class_='success')
                if success_messages:
                    print("✅ Success messages found:")
                    for success in success_messages:
                        print(f"   {success.get_text().strip()}")
                
                # Check if we're already logged in
                if "Welcome" in admin_response.text or "Log out" in admin_response.text:
                    print("✅ Already logged into admin!")
                    return True
                else:
                    print("❌ Not logged in - need credentials")
                    return False
            else:
                print("❌ No login form found")
                return False
        else:
            print(f"❌ Admin page not accessible: {admin_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def try_admin_credentials():
    """Try different admin credentials"""
    
    base_url = "https://digisol-backend.onrender.com"
    
    print("\n🔐 Trying admin credentials...")
    
    # Common admin credentials to try
    test_credentials = [
        {"username": "admin", "password": "admin123456"},
        {"username": "admin@digisolai.ca", "password": "admin123456"},
        {"username": "admin", "password": "admin"},
        {"username": "admin", "password": "password"},
        {"username": "admin", "password": "123456"},
        {"username": "admin@digisolai.ca", "password": "admin"},
        {"username": "admin@digisolai.ca", "password": "password"},
    ]
    
    session = requests.Session()
    
    for creds in test_credentials:
        try:
            print(f"\n   Trying: {creds['username']} / {creds['password']}")
            
            # Get the admin login page first
            login_page = session.get(f"{base_url}/admin/")
            
            # Try to login
            login_data = {
                'username': creds['username'],
                'password': creds['password'],
                'csrfmiddlewaretoken': 'dummy'  # We'll get the real one if needed
            }
            
            login_response = session.post(
                f"{base_url}/admin/login/",
                data=login_data,
                allow_redirects=True
            )
            
            print(f"   Status: {login_response.status_code}")
            
            # Check if login was successful
            if "Welcome" in login_response.text or "Log out" in login_response.text:
                print(f"   ✅ SUCCESS! Logged in with {creds['username']}")
                return creds
            elif "Please enter the correct username and password" in login_response.text:
                print(f"   ❌ Invalid credentials")
            else:
                print(f"   ⚠️  Unexpected response")
                
        except Exception as e:
            print(f"   Error: {e}")
    
    print("\n❌ No working credentials found")
    return None

if __name__ == "__main__":
    # Test admin interface
    is_logged_in = test_admin_login()
    
    if not is_logged_in:
        # Try different credentials
        working_creds = try_admin_credentials()
        
        if working_creds:
            print(f"\n🎉 Found working credentials!")
            print(f"   Username: {working_creds['username']}")
            print(f"   Password: {working_creds['password']}")
        else:
            print(f"\n💡 No working credentials found. The database reset might not have worked.")
