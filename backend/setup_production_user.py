#!/usr/bin/env python3
"""
Setup production superuser for DigiSol.AI
This script should be run during deployment to ensure a superuser exists.
"""

import os
import sys
import django

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

def setup_production_superuser():
    """Create or update the production superuser"""
    try:
        print("🔧 Setting up production superuser...")
        
        # Count existing users
        user_count = User.objects.count()
        print(f"🔍 Found {user_count} users in database")
        
        # Delete all existing users to start fresh
        if user_count > 0:
            print("🗑️  Deleting all existing users...")
            with transaction.atomic():
                User.objects.all().delete()
                print(f"✅ Deleted {user_count} users")
        
        # Create fresh superuser
        print("📝 Creating fresh superuser...")
        
        with transaction.atomic():
            superuser = User.objects.create_superuser(
                username='admin',
                email='admin@digisolai.ca',
                password='admin123456',
                first_name='Admin',
                last_name='User'
            )
            print(f"✅ Created superuser: {superuser.email}")
            print(f"   Username: {superuser.username}")
            print(f"   Password: admin123456")
            print(f"   Email: {superuser.email}")
            print(f"   Active: {superuser.is_active}")
            print(f"   Staff: {superuser.is_staff}")
            print(f"   Superuser: {superuser.is_superuser}")
        
        # Verify the superuser
        if superuser.check_password('admin123456'):
            print("✅ Password verification successful")
        else:
            print("❌ Password verification failed")
            
        return True
        
    except Exception as e:
        print(f"❌ Failed to setup superuser: {e}")
        return False

if __name__ == "__main__":
    success = setup_production_superuser()
    if success:
        print("🎉 Production superuser setup completed successfully!")
    else:
        print("💥 Production superuser setup failed!")
        sys.exit(1)
