#!/usr/bin/env python3
"""
Debug script to check brand profiles in the database.
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from core.models import Tenant, BrandProfile
from django.contrib.auth import get_user_model

def debug_brand_profiles():
    """Debug brand profiles in the database."""
    
    print("🔍 Debugging Brand Profiles")
    print("=" * 40)
    
    # Check all tenants
    print("\n1. All Tenants:")
    tenants = Tenant.objects.all()
    for tenant in tenants:
        print(f"   - {tenant.name} (ID: {tenant.id})")
    
    # Check all brand profiles
    print("\n2. All Brand Profiles:")
    brand_profiles = BrandProfile.objects.all()
    for bp in brand_profiles:
        print(f"   - {bp.name} (Tenant: {bp.tenant.name if bp.tenant else 'None'})")
    
    # Check specific tenant
    print("\n3. Checking specific tenant...")
    User = get_user_model()
    admin_user = User.objects.filter(email='admin@digisolai.ca').first()
    
    if admin_user:
        print(f"   Admin user: {admin_user.email}")
        print(f"   Admin tenant: {admin_user.tenant.name if admin_user.tenant else 'None'}")
        
        if admin_user.tenant:
            # Check brand profile for this tenant
            bp = BrandProfile.objects.filter(tenant=admin_user.tenant).first()
            if bp:
                print(f"   Found brand profile: {bp.name}")
            else:
                print("   No brand profile found for this tenant")
                
            # Try to get brand profile by tenant ID
            bp_by_id = BrandProfile.objects.filter(tenant_id=admin_user.tenant.id).first()
            if bp_by_id:
                print(f"   Found brand profile by ID: {bp_by_id.name}")
            else:
                print("   No brand profile found by tenant ID")

if __name__ == "__main__":
    debug_brand_profiles()
