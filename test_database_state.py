#!/usr/bin/env python3
"""
Test script to check database state and authentication issues
"""

import os
import sys
import django
import requests
import json

# Add the backend directory to the Python path
sys.path.append('backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from django.contrib.auth import get_user_model
from django.db import connection
from django.core.management import execute_from_command_line

User = get_user_model()

def test_database_connection():
    """Test if we can connect to the database"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ Database connection successful: {version[0]}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def check_user_table():
    """Check the structure of the custom_users table"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'custom_users'
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()
            print("\n📋 Custom Users Table Structure:")
            for col in columns:
                print(f"  {col[0]}: {col[1]} (nullable: {col[2]}, default: {col[3]})")
            return True
    except Exception as e:
        print(f"❌ Failed to check user table: {e}")
        return False

def check_existing_users():
    """Check if there are any users in the database"""
    try:
        users = User.objects.all()
        print(f"\n👥 Found {users.count()} users in database:")
        for user in users:
            print(f"  - {user.email} (active: {user.is_active}, staff: {user.is_staff}, superuser: {user.is_superuser})")
        return users.count()
    except Exception as e:
        print(f"❌ Failed to check users: {e}")
        return 0

def create_test_superuser():
    """Create a test superuser"""
    try:
        # Check if superuser already exists
        if User.objects.filter(is_superuser=True).exists():
            print("\n✅ Superuser already exists")
            return True
        
        # Create superuser
        user = User.objects.create_superuser(
            username='admin',
            email='admin@digisolai.ca',
            password='admin123456',
            first_name='Admin',
            last_name='User'
        )
        print(f"\n✅ Created superuser: {user.email}")
        return True
    except Exception as e:
        print(f"❌ Failed to create superuser: {e}")
        return False

def test_user_creation():
    """Test creating a regular user"""
    try:
        # Delete test user if exists
        User.objects.filter(email='test@example.com').delete()
        
        # Create test user
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='test123456',
            first_name='Test',
            last_name='User'
        )
        print(f"\n✅ Created test user: {user.email} (active: {user.is_active})")
        
        # Test authentication
        from django.contrib.auth import authenticate
        auth_user = authenticate(username='test@example.com', password='test123456')
        if auth_user:
            print(f"✅ Authentication successful for {auth_user.email}")
        else:
            print("❌ Authentication failed")
        
        return True
    except Exception as e:
        print(f"❌ Failed to create test user: {e}")
        return False

def test_api_endpoints():
    """Test the API endpoints"""
    base_url = "https://digisol-backend.onrender.com"
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/api/core/health/")
        print(f"\n🏥 Health endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"  Response: {response.json()}")
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
    
    # Test registration endpoint
    try:
        data = {
            "username": "apitest",
            "email": "apitest@example.com",
            "password": "apitest123456",
            "first_name": "API",
            "last_name": "Test"
        }
        response = requests.post(f"{base_url}/api/accounts/register/", json=data)
        print(f"\n📝 Registration endpoint: {response.status_code}")
        if response.status_code in [200, 201, 400]:
            print(f"  Response: {response.json()}")
    except Exception as e:
        print(f"❌ Registration endpoint failed: {e}")
    
    # Test login endpoint
    try:
        data = {
            "username": "admin@digisolai.ca",
            "password": "admin123456"
        }
        response = requests.post(f"{base_url}/api/accounts/login/", json=data)
        print(f"\n🔑 Login endpoint: {response.status_code}")
        if response.status_code in [200, 400]:
            print(f"  Response: {response.json()}")
    except Exception as e:
        print(f"❌ Login endpoint failed: {e}")

def main():
    """Main test function"""
    print("🔍 Testing Database State and Authentication")
    print("=" * 50)
    
    # Test database connection
    if not test_database_connection():
        return
    
    # Check table structure
    check_user_table()
    
    # Check existing users
    user_count = check_existing_users()
    
    # Create superuser if needed
    if user_count == 0:
        create_test_superuser()
    else:
        create_test_superuser()  # Try anyway to ensure we have one
    
    # Test user creation
    test_user_creation()
    
    # Test API endpoints
    test_api_endpoints()
    
    print("\n" + "=" * 50)
    print("🏁 Testing complete!")

if __name__ == "__main__":
    main()
