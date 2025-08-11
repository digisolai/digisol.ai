#!/usr/bin/env python
"""
Script to create a superuser account for DigiSol.AI
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

User = get_user_model()

def create_superuser():
    """Create a superuser account"""
    
    print("🚀 Creating Superuser Account for DigiSol.AI")
    print("=" * 50)
    
    # Check if superuser already exists
    if User.objects.filter(is_superuser=True).exists():
        print("✅ Superuser already exists!")
        superuser = User.objects.filter(is_superuser=True).first()
        print(f"   Email: {superuser.email}")
        print(f"   Username: {superuser.username}")
        print(f"   Name: {superuser.first_name} {superuser.last_name}")
        return
    
    # Create default tenant if it doesn't exist
    tenant, created = Tenant.objects.get_or_create(
        name="DigiSol.AI",
        defaults={
            'subdomain': 'digisol',
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Created default tenant: {tenant.name}")
    else:
        print(f"✅ Using existing tenant: {tenant.name}")
    
    # Create superuser
    try:
        superuser = User.objects.create_superuser(
            username='admin',
            email='admin@digisolai.ca',
            password='DigiSol2024!',
            first_name='Admin',
            last_name='User',
            tenant=tenant,
            is_hr_admin=True,
            is_superuser=True,
            is_staff=True
        )
        
        print("✅ Superuser created successfully!")
        print(f"   Email: {superuser.email}")
        print(f"   Password: DigiSol2024!")
        print(f"   Username: {superuser.username}")
        print(f"   Name: {superuser.first_name} {superuser.last_name}")
        print(f"   Tenant: {superuser.tenant.name}")
        
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")
        
        # Try to get existing user
        try:
            user = User.objects.get(email='admin@digisolai.ca')
            print("✅ User already exists!")
            print(f"   Email: {user.email}")
            print(f"   Username: {user.username}")
            print(f"   Name: {user.first_name} {user.last_name}")
            
            # Make sure they're a superuser
            if not user.is_superuser:
                user.is_superuser = True
                user.is_staff = True
                user.save()
                print("✅ Made user a superuser!")
                
        except User.DoesNotExist:
            print("❌ Could not find or create user")

if __name__ == "__main__":
    create_superuser()
