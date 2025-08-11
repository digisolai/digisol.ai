#!/usr/bin/env python3
"""
Test script to verify AITask creation works correctly after the tenant_id fix.
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings')
django.setup()

from ai_services.models import AITask, AIProfile
from accounts.models import CustomUser
from core.models import Tenant

def test_ai_task_creation():
    """Test that AITask creation works with tenant assignment."""
    
    # Get the first available tenant and user
    try:
        tenant = Tenant.objects.first()
        if not tenant:
            print("❌ No tenants found in database")
            return False
            
        user = CustomUser.objects.filter(tenant=tenant).first()
        if not user:
            print("❌ No users found for tenant")
            return False
            
        # Get an AI agent
        agent = AIProfile.objects.filter(is_active=True).first()
        if not agent:
            print("❌ No active AI agents found")
            return False
            
        print(f"✅ Found tenant: {tenant.name}")
        print(f"✅ Found user: {user.email}")
        print(f"✅ Found AI agent: {agent.name}")
        
        # Test AITask creation
        task = AITask.objects.create(
            tenant=tenant,
            requester=user,
            assignee_agent=agent,
            objective="Test task creation after tenant_id fix",
            context_data={'test': True}
        )
        
        print(f"✅ Successfully created AITask: {task.id}")
        print(f"   - Tenant: {task.tenant.name}")
        print(f"   - Requester: {task.requester.email}")
        print(f"   - Agent: {task.assignee_agent.name}")
        print(f"   - Status: {task.status}")
        
        # Clean up
        task.delete()
        print("✅ Test completed successfully - task cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing AITask creation with tenant assignment...")
    success = test_ai_task_creation()
    
    if success:
        print("\n🎉 All tests passed! The tenant_id fix is working correctly.")
    else:
        print("\n💥 Tests failed. There may still be issues with AITask creation.")
        sys.exit(1)
