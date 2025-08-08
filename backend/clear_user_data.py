#!/usr/bin/env python3
"""
Script to clear all user-specific data for the current tenant.
This ensures a completely fresh experience for the user without affecting other tenants.
"""

import os
import django
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from core.models import Contact, Campaign, EmailTemplate, AutomationWorkflow, AutomationExecution, BrandAsset
from ai_services.models import AIProfile

def clear_user_data():
    """Clear all user-specific data for the current tenant."""
    
    print("🧹 Clearing All User Data for Fresh Start")
    print("=" * 60)
    
    # Step 1: Find the test user and their tenant
    print("\n1. Finding test user and tenant...")
    
    try:
        User = get_user_model()
        # Try test2@example.com first, then admin@digisolai.ca
        test_user = User.objects.filter(email='test2@example.com').first()
        
        if not test_user:
            print("   ❌ Test user 'test2@example.com' not found.")
            print("   🔍 Trying admin@digisolai.ca...")
            test_user = User.objects.filter(email='admin@digisolai.ca').first()
            
        if not test_user:
            print("   ❌ No suitable user found.")
            return
        
        tenant = test_user.tenant
        if not tenant:
            print(f"   ❌ User {test_user.email} has no tenant assigned.")
            print("   🔍 Creating a new tenant for this user...")
            
            from core.models import Tenant
            tenant = Tenant.objects.create(
                name=f"{test_user.email}'s Organization",
                subdomain=None,
                is_active=True
            )
            test_user.tenant = tenant
            test_user.save()
            print(f"   ✅ Created new tenant: {tenant.name}")
        
        print(f"   ✅ Found user: {test_user.email}")
        print(f"   ✅ Tenant: {tenant.name}")
        
        # Step 2: Clear Contacts
        print("\n2. Clearing Contacts...")
        contact_count = Contact.objects.filter(tenant=tenant).count()
        if contact_count > 0:
            deleted_contacts = Contact.objects.filter(tenant=tenant).delete()[0]
            print(f"   ✅ Deleted {deleted_contacts} contacts")
        else:
            print("   ✅ No contacts to delete")
        
        # Step 3: Clear Campaigns
        print("\n3. Clearing Campaigns...")
        campaign_count = Campaign.objects.filter(tenant=tenant).count()
        if campaign_count > 0:
            deleted_campaigns = Campaign.objects.filter(tenant=tenant).delete()[0]
            print(f"   ✅ Deleted {deleted_campaigns} campaigns")
        else:
            print("   ✅ No campaigns to delete")
        
        # Step 4: Clear Email Templates
        print("\n4. Clearing Email Templates...")
        template_count = EmailTemplate.objects.filter(tenant=tenant).count()
        if template_count > 0:
            deleted_templates = EmailTemplate.objects.filter(tenant=tenant).delete()[0]
            print(f"   ✅ Deleted {deleted_templates} email templates")
        else:
            print("   ✅ No email templates to delete")
        
        # Step 5: Clear Automation Workflows
        print("\n5. Clearing Automation Workflows...")
        workflow_count = AutomationWorkflow.objects.filter(tenant=tenant).count()
        if workflow_count > 0:
            deleted_workflows = AutomationWorkflow.objects.filter(tenant=tenant).delete()[0]
            print(f"   ✅ Deleted {deleted_workflows} automation workflows")
        else:
            print("   ✅ No automation workflows to delete")
        
        # Step 6: Clear Automation Executions
        print("\n6. Clearing Automation Executions...")
        execution_count = AutomationExecution.objects.filter(tenant=tenant).count()
        if execution_count > 0:
            deleted_executions = AutomationExecution.objects.filter(tenant=tenant).delete()[0]
            print(f"   ✅ Deleted {deleted_executions} automation executions")
        else:
            print("   ✅ No automation executions to delete")
        
        # Step 7: Clear Brand Assets
        print("\n7. Clearing Brand Assets...")
        asset_count = BrandAsset.objects.filter(tenant=tenant).count()
        if asset_count > 0:
            deleted_assets = BrandAsset.objects.filter(tenant=tenant).delete()[0]
            print(f"   ✅ Deleted {deleted_assets} brand assets")
        else:
            print("   ✅ No brand assets to delete")
        
        # Step 8: Clear Tenant-Specific AI Agents (but keep global ones)
        print("\n8. Clearing Tenant-Specific AI Agents...")
        tenant_ai_count = AIProfile.objects.filter(tenant=tenant).count()
        if tenant_ai_count > 0:
            deleted_ai_agents = AIProfile.objects.filter(tenant=tenant).delete()[0]
            print(f"   ✅ Deleted {deleted_ai_agents} tenant-specific AI agents")
        else:
            print("   ✅ No tenant-specific AI agents to delete")
        
        # Step 9: Verify cleanup
        print("\n9. Verifying cleanup...")
        remaining_contacts = Contact.objects.filter(tenant=tenant).count()
        remaining_campaigns = Campaign.objects.filter(tenant=tenant).count()
        remaining_templates = EmailTemplate.objects.filter(tenant=tenant).count()
        remaining_workflows = AutomationWorkflow.objects.filter(tenant=tenant).count()
        remaining_executions = AutomationExecution.objects.filter(tenant=tenant).count()
        remaining_assets = BrandAsset.objects.filter(tenant=tenant).count()
        remaining_tenant_ai = AIProfile.objects.filter(tenant=tenant).count()
        
        print(f"   📊 Remaining data for tenant '{tenant.name}':")
        print(f"      - Contacts: {remaining_contacts}")
        print(f"      - Campaigns: {remaining_campaigns}")
        print(f"      - Email Templates: {remaining_templates}")
        print(f"      - Automation Workflows: {remaining_workflows}")
        print(f"      - Automation Executions: {remaining_executions}")
        print(f"      - Brand Assets: {remaining_assets}")
        print(f"      - Tenant AI Agents: {remaining_tenant_ai}")
        
        total_remaining = (remaining_contacts + remaining_campaigns + remaining_templates + 
                          remaining_workflows + remaining_executions + remaining_assets + remaining_tenant_ai)
        
        if total_remaining == 0:
            print("   ✅ All user data successfully cleared!")
        else:
            print(f"   ⚠️  {total_remaining} items still remain. This might be due to foreign key constraints.")
        
        print(f"\n🎉 Data cleanup completed for tenant '{tenant.name}'")
        print("   You now have a completely fresh experience to start building your own data.")
        print("   Global AI agents and system configurations remain intact.")
        
    except Exception as e:
        print(f"   ❌ An error occurred during data cleanup: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    clear_user_data()
