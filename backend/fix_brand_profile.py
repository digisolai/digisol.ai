#!/usr/bin/env python3
"""
Script to manually fix the brand profile issue.
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from core.models import Tenant, BrandProfile
from django.contrib.auth import get_user_model
from django.db import connection

def fix_brand_profile():
    """Manually fix the brand profile issue."""
    
    print("🔧 Fixing Brand Profile Issue")
    print("=" * 40)
    
    # Get the tenant
    User = get_user_model()
    admin_user = User.objects.filter(email='admin@digisolai.ca').first()
    tenant = admin_user.tenant
    
    print(f"Tenant: {tenant.name} (ID: {tenant.id})")
    
    # Check brand profiles directly in database
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM brand_profiles WHERE tenant_id = %s", [str(tenant.id)])
        count = cursor.fetchone()[0]
        print(f"Brand profiles in database for this tenant: {count}")
        
        if count > 0:
            cursor.execute("SELECT * FROM brand_profiles WHERE tenant_id = %s", [str(tenant.id)])
            rows = cursor.fetchall()
            for row in rows:
                print(f"  Found brand profile: {row}")
    
    # Try to create brand profile with raw SQL
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO brand_profiles (
                    id, tenant_id, primary_color, secondary_color, font_family, 
                    name, description, branding_status, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
            """, [
                django.utils.timezone.now().strftime('%Y%m%d%H%M%S'),  # Simple ID
                str(tenant.id),
                "#1F4287",
                "#FFC300", 
                "Inter",
                "DigiSol.AI",
                "AI-Powered Marketing Automation Platform",
                "active",
                django.utils.timezone.now(),
                django.utils.timezone.now()
            ])
            print("✅ Created brand profile using raw SQL")
    except Exception as e:
        print(f"❌ Raw SQL failed: {e}")
        
        # Try to delete any existing brand profiles for this tenant
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM brand_profiles WHERE tenant_id = %s", [str(tenant.id)])
                print("✅ Deleted existing brand profiles")
        except Exception as e2:
            print(f"❌ Delete failed: {e2}")
    
    # Now try to create using Django ORM
    try:
        brand_profile = BrandProfile.objects.create(
            tenant=tenant,
            primary_color="#1F4287",
            secondary_color="#FFC300",
            font_family="Inter",
            name="DigiSol.AI",
            description="AI-Powered Marketing Automation Platform",
            branding_status="active",
            last_updated_by=admin_user
        )
        print("✅ Created brand profile using Django ORM")
    except Exception as e:
        print(f"❌ Django ORM failed: {e}")

if __name__ == "__main__":
    fix_brand_profile()
