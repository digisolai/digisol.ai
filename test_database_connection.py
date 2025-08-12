#!/usr/bin/env python3
"""
Test database connection and configuration
"""

import os
import sys
import django

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from django.db import connection
from django.conf import settings

def test_database_connection():
    """Test database connection and show configuration"""
    
    print("🔍 Testing database connection...")
    print()
    
    # Show environment variables
    print("1. Environment Variables:")
    db_vars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DATABASE_URL']
    for var in db_vars:
        value = os.environ.get(var)
        if value:
            if 'PASSWORD' in var:
                print(f"   {var}: {'*' * len(value)}")
            else:
                print(f"   {var}: {value}")
        else:
            print(f"   {var}: Not set")
    
    print()
    
    # Show Django database configuration
    print("2. Django Database Configuration:")
    db_config = settings.DATABASES['default']
    print(f"   Engine: {db_config['ENGINE']}")
    print(f"   Name: {db_config.get('NAME', 'Not set')}")
    print(f"   Host: {db_config.get('HOST', 'Not set')}")
    print(f"   Port: {db_config.get('PORT', 'Not set')}")
    print(f"   User: {db_config.get('USER', 'Not set')}")
    
    print()
    
    # Test database connection
    print("3. Testing Database Connection:")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"   ✅ Connection successful!")
            print(f"   Database: {version[0]}")
            
            # Check if we can access tables
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """)
            tables = [row[0] for row in cursor.fetchall()]
            print(f"   Tables found: {len(tables)}")
            if tables:
                print(f"   Sample tables: {tables[:5]}")
            
            # Check if users table exists
            if 'accounts_customuser' in tables:
                cursor.execute("SELECT COUNT(*) FROM accounts_customuser;")
                user_count = cursor.fetchone()[0]
                print(f"   Users in database: {user_count}")
            else:
                print("   ❌ No users table found")
                
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return False
    
    print()
    
    # Test Django ORM
    print("4. Testing Django ORM:")
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user_count = User.objects.count()
        print(f"   ✅ ORM working - {user_count} users found")
        
        if user_count > 0:
            # Show sample users
            users = User.objects.all()[:3]
            for user in users:
                print(f"   - {user.email} (active: {user.is_active})")
                
    except Exception as e:
        print(f"   ❌ ORM failed: {e}")
        return False
    
    print()
    print("🎉 Database connection test completed!")
    return True

if __name__ == "__main__":
    test_database_connection()
