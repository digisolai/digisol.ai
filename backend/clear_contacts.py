#!/usr/bin/env python3
"""
Script to clear all contacts for the current user's tenant.
This ensures a fresh start for the user without affecting other tenants.
"""

import os
import django
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from core.models import Contact

def clear_contacts():
    """Clear all contacts for the current user's tenant."""
    
    print("🧹 Clearing Contacts for Fresh Start")
    print("=" * 50)
    
    # Step 1: Find the admin user and their tenant
    print("\n1. Finding admin user and tenant...")
    
    try:
        User = get_user_model()
        admin_user = User.objects.filter(email='admin@digisolai.ca').first()
        
        if not admin_user:
            print("   ❌ Admin user 'admin@digisolai.ca' not found.")
            return
        
        tenant = admin_user.tenant
        print(f"   ✅ Found admin user: {admin_user.email}")
        print(f"   ✅ Tenant: {tenant.name}")
        
        # Step 2: Count existing contacts
        print("\n2. Counting existing contacts...")
        contact_count = Contact.objects.filter(tenant=tenant).count()
        print(f"   📊 Found {contact_count} contacts for tenant '{tenant.name}'")
        
        if contact_count == 0:
            print("   ✅ No contacts to delete. Database is already clean.")
            return
        
        # Step 3: Delete all contacts for this tenant
        print("\n3. Deleting all contacts...")
        deleted_count = Contact.objects.filter(tenant=tenant).delete()[0]
        print(f"   ✅ Successfully deleted {deleted_count} contacts")
        
        # Step 4: Verify deletion
        print("\n4. Verifying deletion...")
        remaining_count = Contact.objects.filter(tenant=tenant).count()
        print(f"   📊 Remaining contacts: {remaining_count}")
        
        if remaining_count == 0:
            print("   ✅ All contacts successfully cleared!")
        else:
            print(f"   ⚠️  {remaining_count} contacts still remain. This might be due to foreign key constraints.")
        
        print(f"\n🎉 Contact cleanup completed for tenant '{tenant.name}'")
        print("   You now have a fresh contacts page to start building your own data.")
        
    except Exception as e:
        print(f"   ❌ An error occurred during contact cleanup: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    clear_contacts()
