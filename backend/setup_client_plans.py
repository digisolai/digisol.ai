#!/usr/bin/env python3
"""
Script to set up subscription plans for regular clients.
This ensures clients can choose different tiers based on their needs.
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from subscription_billing.models import SubscriptionPlan

def setup_client_plans():
    """Set up subscription plans for regular clients."""
    
    print("💼 Setting Up Client Subscription Plans")
    print("=" * 50)
    
    # Define client plans
    client_plans = [
        {
            "name": "Starter",
            "description": "Perfect for small businesses getting started with marketing automation",
            "monthly_cost": 29.00,
            "annual_cost": 290.00,
            "contact_limit": 1000,
            "email_send_limit": 5000,
            "ai_text_credits_per_month": 100,
            "ai_image_credits_per_month": 50,
            "ai_planning_requests_per_month": 25,
            "automation_workflow_limit": 3,
            "integration_limit": 2,
            "client_portals_limit": 0,
            "includes_design_studio": True,
            "includes_advanced_analytics": False,
            "includes_project_management": False,
            "includes_budgeting": False,
            "includes_learning_center": True,
            "includes_dedicated_support": False,
            "includes_white_label": False,
            "includes_custom_integrations": False,
            "includes_client_portals": False,
            "includes_client_billing": False,
            "includes_client_analytics": False,
            "includes_white_label_portals": False,
            "includes_client_support": False,
        },
        {
            "name": "Professional",
            "description": "Ideal for growing businesses with advanced marketing needs",
            "monthly_cost": 79.00,
            "annual_cost": 790.00,
            "contact_limit": 10000,
            "email_send_limit": 25000,
            "ai_text_credits_per_month": 500,
            "ai_image_credits_per_month": 200,
            "ai_planning_requests_per_month": 100,
            "automation_workflow_limit": 10,
            "integration_limit": 5,
            "client_portals_limit": 0,
            "includes_design_studio": True,
            "includes_advanced_analytics": True,
            "includes_project_management": True,
            "includes_budgeting": True,
            "includes_learning_center": True,
            "includes_dedicated_support": False,
            "includes_white_label": False,
            "includes_custom_integrations": False,
            "includes_client_portals": False,
            "includes_client_billing": False,
            "includes_client_analytics": False,
            "includes_white_label_portals": False,
            "includes_client_support": False,
        },
        {
            "name": "Business",
            "description": "Complete solution for established businesses and marketing agencies",
            "monthly_cost": 199.00,
            "annual_cost": 1990.00,
            "contact_limit": 50000,
            "email_send_limit": 100000,
            "ai_text_credits_per_month": 2000,
            "ai_image_credits_per_month": 1000,
            "ai_planning_requests_per_month": 500,
            "automation_workflow_limit": 25,
            "integration_limit": 10,
            "client_portals_limit": 5,
            "includes_design_studio": True,
            "includes_advanced_analytics": True,
            "includes_project_management": True,
            "includes_budgeting": True,
            "includes_learning_center": True,
            "includes_dedicated_support": True,
            "includes_white_label": True,
            "includes_custom_integrations": False,
            "includes_client_portals": True,
            "includes_client_billing": True,
            "includes_client_analytics": True,
            "includes_white_label_portals": False,
            "includes_client_support": True,
        },
        {
            "name": "Enterprise",
            "description": "Unlimited access for large organizations and agencies",
            "monthly_cost": 499.00,
            "annual_cost": 4990.00,
            "contact_limit": -1,  # Unlimited
            "email_send_limit": -1,  # Unlimited
            "ai_text_credits_per_month": -1,  # Unlimited
            "ai_image_credits_per_month": -1,  # Unlimited
            "ai_planning_requests_per_month": -1,  # Unlimited
            "automation_workflow_limit": -1,  # Unlimited
            "integration_limit": -1,  # Unlimited
            "client_portals_limit": -1,  # Unlimited
            "includes_design_studio": True,
            "includes_advanced_analytics": True,
            "includes_project_management": True,
            "includes_budgeting": True,
            "includes_learning_center": True,
            "includes_dedicated_support": True,
            "includes_white_label": True,
            "includes_custom_integrations": True,
            "includes_client_portals": True,
            "includes_client_billing": True,
            "includes_client_analytics": True,
            "includes_white_label_portals": True,
            "includes_client_support": True,
        }
    ]
    
    created_count = 0
    for plan_data in client_plans:
        existing_plan = SubscriptionPlan.objects.filter(name=plan_data["name"]).first()
        
        if not existing_plan:
            plan = SubscriptionPlan.objects.create(**plan_data)
            print(f"✅ Created {plan.name} plan (${plan.monthly_cost}/month)")
            created_count += 1
        else:
            print(f"✅ {existing_plan.name} plan already exists")
    
    print(f"\n📊 Summary:")
    print(f"   - {created_count} new plans created")
    print(f"   - {len(client_plans)} total client plans available")
    print(f"\n   Plans available for clients:")
    for plan in SubscriptionPlan.objects.filter(is_active=True).exclude(name="Developer Unlimited"):
        print(f"   - {plan.name}: ${plan.monthly_cost}/month")
        contact_limit = "Unlimited" if plan.contact_limit == -1 else f"{plan.contact_limit:,}"
        email_limit = "Unlimited" if plan.email_send_limit == -1 else f"{plan.email_send_limit:,}"
        ai_credits = "Unlimited" if plan.ai_text_credits_per_month == -1 else str(plan.ai_text_credits_per_month)
        print(f"     Contacts: {contact_limit}")
        print(f"     Emails: {email_limit}")
        print(f"     AI Credits: {ai_credits}")

if __name__ == "__main__":
    setup_client_plans()
