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
        
        # Check if superuser already exists
        superuser = User.objects.filter(is_superuser=True).first()
        
        if superuser:
            print(f"✅ Superuser already exists: {superuser.email}")
            
            # Update password to ensure it's correct
            superuser.set_password('admin123456')
            superuser.save()
            print("✅ Password updated successfully")
            
        else:
            print("📝 Creating new superuser...")
            
            # Create superuser
            with transaction.atomic():
                superuser = User.objects.create_superuser(
                    username='admin',
                    email='admin@digisolai.ca',
                    password='admin123456',
                    first_name='Admin',
                    last_name='User'
                )
                print(f"✅ Created superuser: {superuser.email}")
        
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
