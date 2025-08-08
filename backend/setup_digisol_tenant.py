#!/usr/bin/env python3
"""
Script to set up the admin user as the DigiSol.AI tenant with full developer access.
This ensures the developer has complete access to all features for free.
"""

import os
import django
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from core.models import Tenant, BrandProfile
from ai_services.models import AIProfile
from subscription_billing.models import SubscriptionPlan, Subscription

def setup_digisol_tenant():
    """Set up the admin user as the DigiSol.AI tenant with full access."""
    
    print("🏢 Setting Up DigiSol.AI Tenant with Full Developer Access")
    print("=" * 60)
    
    try:
        # Step 1: Find or create the admin user
        print("\n1. Setting up admin user...")
        User = get_user_model()
        admin_user = User.objects.filter(email='admin@digisolai.ca').first()
        
        if not admin_user:
            print("   🔧 Creating admin user...")
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@digisolai.ca',
                password='admin123456',
                first_name='Admin',
                last_name='User'
            )
            print("   ✅ Created admin user: admin@digisolai.ca")
        else:
            print("   ✅ Found existing admin user: admin@digisolai.ca")
        
        # Step 2: Create or update DigiSol.AI tenant
        print("\n2. Setting up DigiSol.AI tenant...")
        tenant = admin_user.tenant
        
        if not tenant:
            print("   🔧 Creating DigiSol.AI tenant...")
            tenant = Tenant.objects.create(
                name="DigiSol.AI",
                subdomain="digisol",
                is_active=True
            )
            admin_user.tenant = tenant
            admin_user.save()
            print("   ✅ Created DigiSol.AI tenant")
        else:
            # Update existing tenant to be DigiSol.AI
            tenant.name = "DigiSol.AI"
            tenant.subdomain = "digisol"
            tenant.is_active = True
            tenant.save()
            print("   ✅ Updated existing tenant to DigiSol.AI")
        
        print(f"   📊 Tenant: {tenant.name} (ID: {tenant.id})")
        
        # Step 3: Set up brand profile for DigiSol.AI
        print("\n3. Setting up DigiSol.AI brand profile...")
        brand_profile = BrandProfile.objects.filter(tenant=tenant).first()
        
        if brand_profile:
            print("   🔧 Updating existing DigiSol.AI brand profile...")
            brand_profile.primary_color = "#1F4287"
            brand_profile.secondary_color = "#FFC300"
            brand_profile.font_family = "Inter"
            brand_profile.name = "DigiSol.AI"
            brand_profile.description = "AI-Powered Marketing Automation Platform"
            brand_profile.branding_status = "active"
            brand_profile.last_updated_by = admin_user
            brand_profile.save()
            print("   ✅ Updated DigiSol.AI brand profile")
        else:
            print("   🔧 Creating DigiSol.AI brand profile...")
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
            print("   ✅ Created DigiSol.AI brand profile")
        
        # Step 4: Create unlimited subscription plan for developers
        print("\n4. Setting up unlimited developer subscription...")
        
        # Check if unlimited plan exists
        unlimited_plan = SubscriptionPlan.objects.filter(
            name="Developer Unlimited"
        ).first()
        
        if not unlimited_plan:
            print("   🔧 Creating unlimited developer plan...")
            unlimited_plan = SubscriptionPlan.objects.create(
                name="Developer Unlimited",
                description="Unlimited access for DigiSol.AI developers",
                price=0.00,  # Free for developers
                billing_cycle="monthly",
                contact_limit=-1,  # Unlimited
                email_send_limit=-1,  # Unlimited
                ai_text_credits_per_month=-1,  # Unlimited
                ai_image_credits_per_month=-1,  # Unlimited
                ai_planning_requests_per_month=-1,  # Unlimited
                automation_workflows_limit=-1,  # Unlimited
                integrations_limit=-1,  # Unlimited
                client_portals_limit=-1,  # Unlimited
                is_active=True,
                is_developer_plan=True  # Mark as developer plan
            )
            print("   ✅ Created unlimited developer plan")
        else:
            print("   ✅ Unlimited developer plan already exists")
        
        # Step 5: Assign unlimited subscription to DigiSol.AI tenant
        print("\n5. Assigning unlimited subscription to DigiSol.AI...")
        existing_subscription = Subscription.objects.filter(tenant=tenant).first()
        
        if not existing_subscription:
            print("   🔧 Creating unlimited subscription...")
            subscription = Subscription.objects.create(
                tenant=tenant,
                plan=unlimited_plan,
                status="active",
                start_date=django.utils.timezone.now(),
                end_date=None,  # No end date for unlimited
                is_auto_renew=True
            )
            print("   ✅ Created unlimited subscription")
        else:
            # Update existing subscription to unlimited
            existing_subscription.plan = unlimited_plan
            existing_subscription.status = "active"
            existing_subscription.end_date = None
            existing_subscription.is_auto_renew = True
            existing_subscription.save()
            print("   ✅ Updated existing subscription to unlimited")
        
        # Step 6: Ensure global AI agents are available
        print("\n6. Ensuring global AI agents are available...")
        global_agents = AIProfile.objects.filter(tenant__isnull=True).count()
        print(f"   📊 Found {global_agents} global AI agents")
        
        if global_agents == 0:
            print("   ⚠️  No global AI agents found. Creating default global agents...")
            
            default_agents = [
                {"name": "Automatix", "specialization": "automation_design", "personality_description": "Efficient, systematic, and workflow-optimized...", "is_active": True},
                {"name": "Scriptor", "specialization": "content_creation", "personality_description": "Creative, articulate, and engaging...", "is_active": True},
                {"name": "Prospero", "specialization": "lead_nurturing", "personality_description": "Empathetic, persuasive, and relationship-focused...", "is_active": True},
                {"name": "Pecunia", "specialization": "budget_analysis", "personality_description": "Analytical, precise, and cost-conscious...", "is_active": True},
                {"name": "Metrika", "specialization": "data_analysis", "personality_description": "Insightful, objective, and pattern-seeking...", "is_active": True},
                {"name": "Quantia", "specialization": "reporting_insights", "personality_description": "Clear, concise, and data-driven...", "is_active": True},
                {"name": "Structura", "specialization": "organizational_planning", "personality_description": "Strategic, structured, and foresightful...", "is_active": True},
                {"name": "Icona", "specialization": "brand_identity", "personality_description": "Artistic, consistent, and visually-oriented...", "is_active": True},
                {"name": "Connectus", "specialization": "integrations_management", "personality_description": "Seamless, adaptable, and interoperable...", "is_active": True},
                {"name": "Mentor", "specialization": "learning_guidance", "personality_description": "Patient, knowledgeable, and empowering...", "is_active": True},
                {"name": "Orchestra", "specialization": "general_orchestration", "personality_description": "Harmonious, coordinating, and comprehensive...", "is_active": True},
                {"name": "Curator", "specialization": "template_design", "personality_description": "Aesthetic, organized, and user-friendly...", "is_active": True},
                {"name": "Guardian", "specialization": "security_compliance", "personality_description": "Vigilant, protective, and rule-abiding...", "is_active": True},
                {"name": "Catalyst", "specialization": "campaign_optimization", "personality_description": "Dynamic, results-driven, and performance-focused...", "is_active": True},
                {"name": "Nexus", "specialization": "customer_support", "personality_description": "Responsive, empathetic, and problem-solving...", "is_active": True},
            ]
            
            created_count = 0
            for agent_data in default_agents:
                existing_agent = AIProfile.objects.filter(
                    name=agent_data['name'],
                    tenant__isnull=True
                ).first()
                
                if not existing_agent:
                    AIProfile.objects.create(
                        name=agent_data['name'],
                        specialization=agent_data['specialization'],
                        personality_description=agent_data['personality_description'],
                        is_active=agent_data['is_active'],
                        tenant=None  # Global agent
                    )
                    created_count += 1
                    print(f"      ✅ Created global agent: {agent_data['name']}")
            
            print(f"   ✅ Created {created_count} new global AI agents")
        else:
            print("   ✅ Global AI agents are properly configured")
        
        # Step 7: Verify setup
        print("\n7. Verifying DigiSol.AI setup...")
        print(f"   📊 DigiSol.AI Tenant Configuration:")
        print(f"      - Name: {tenant.name}")
        print(f"      - Subdomain: {tenant.subdomain}")
        print(f"      - Active: {tenant.is_active}")
        print(f"      - Admin User: {admin_user.email}")
        print(f"      - Subscription: {unlimited_plan.name} (${unlimited_plan.price})")
        print(f"      - Contact Limit: {'Unlimited' if unlimited_plan.contact_limit == -1 else unlimited_plan.contact_limit}")
        print(f"      - Email Limit: {'Unlimited' if unlimited_plan.email_send_limit == -1 else unlimited_plan.email_send_limit}")
        print(f"      - AI Credits: {'Unlimited' if unlimited_plan.ai_text_credits_per_month == -1 else unlimited_plan.ai_text_credits_per_month}")
        
        print(f"\n🎉 DigiSol.AI tenant setup completed successfully!")
        print("   You now have:")
        print("   - Full admin access to the platform")
        print("   - Unlimited subscription (free for developers)")
        print("   - Complete access to all features")
        print("   - Proper DigiSol.AI branding")
        print("   - Global AI agents available")
        
    except Exception as e:
        print(f"   ❌ An error occurred during setup: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    setup_digisol_tenant()
