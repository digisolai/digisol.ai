#!/usr/bin/env python
"""
Clean up all users and create only the specified admin account for DigiSol.AI
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Tenant
from django.db import transaction

User = get_user_model()

def cleanup_users():
    """Remove all users and create only the specified admin account"""
    
    print("🧹 Cleaning up all users and creating DigiSol.AI admin account")
    print("=" * 60)
    
    with transaction.atomic():
        # Delete all existing users
        user_count = User.objects.count()
        print(f"🗑️  Deleting {user_count} existing users...")
        User.objects.all().delete()
        print("✅ All users deleted")
        
        # Delete all existing tenants
        tenant_count = Tenant.objects.count()
        print(f"🗑️  Deleting {tenant_count} existing tenants...")
        Tenant.objects.all().delete()
        print("✅ All tenants deleted")
        
        # Create DigiSol.AI tenant
        print("\n🏢 Creating DigiSol.AI tenant...")
        tenant = Tenant.objects.create(
            name="DigiSol.AI",
            subdomain="digisolai",
            is_active=True
        )
        print(f"✅ Tenant created: {tenant.name}")
        
        # Create the admin user
        print("\n👤 Creating admin user...")
        admin_user = User.objects.create_superuser(
            email="admin@digisolai.ca",
            username="admin",
            password="admin123456",
            first_name="Admin",
            last_name="DigiSol",
            tenant=tenant,
            is_active=True,
            is_staff=True,
            is_superuser=True
        )
        
        print("✅ Admin user created successfully!")
        print(f"   Email: {admin_user.email}")
        print(f"   Username: {admin_user.username}")
        print(f"   Name: {admin_user.first_name} {admin_user.last_name}")
        print(f"   Tenant: {admin_user.tenant.name}")
        print(f"   Superuser: {admin_user.is_superuser}")
        print(f"   Staff: {admin_user.is_staff}")
        print(f"   Active: {admin_user.is_active}")
        
        # Verify the user was created
        print(f"\n🔍 Verification:")
        print(f"   Total users: {User.objects.count()}")
        print(f"   Total tenants: {Tenant.objects.count()}")
        
        # Test login
        print(f"\n🔐 Testing login...")
        from django.contrib.auth import authenticate
        user = authenticate(email="admin@digisolai.ca", password="admin123456")
        if user:
            print("✅ Login test successful!")
        else:
            print("❌ Login test failed!")
            
    print("\n🎉 Cleanup complete! Only the DigiSol.AI admin account exists.")

if __name__ == "__main__":
    cleanup_users()
