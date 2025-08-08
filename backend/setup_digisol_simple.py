#!/usr/bin/env python3
"""
Simplified script to set up the admin user as the DigiSol.AI tenant with full developer access.
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from core.models import Tenant, BrandProfile
from ai_services.models import AIProfile
from subscription_billing.models import SubscriptionPlan, Subscription
from django.contrib.auth import get_user_model

def setup_digisol_simple():
    """Set up the admin user as the DigiSol.AI tenant with full access."""
    
    print("🏢 Setting Up DigiSol.AI Tenant (Simplified)")
    print("=" * 50)
    
    # Step 1: Get or create admin user
    User = get_user_model()
    admin_user = User.objects.filter(email='admin@digisolai.ca').first()
    
    if not admin_user:
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@digisolai.ca',
            password='admin123456',
            first_name='Admin',
            last_name='User'
        )
        print("✅ Created admin user")
    else:
        print("✅ Found admin user")
    
    # Step 2: Get or create DigiSol.AI tenant
    tenant = admin_user.tenant
    if not tenant:
        tenant = Tenant.objects.create(
            name="DigiSol.AI",
            subdomain="digisol",
            is_active=True
        )
        admin_user.tenant = tenant
        admin_user.save()
        print("✅ Created DigiSol.AI tenant")
    else:
        tenant.name = "DigiSol.AI"
        tenant.subdomain = "digisol"
        tenant.is_active = True
        tenant.save()
        print("✅ Updated existing tenant to DigiSol.AI")
    
    # Step 3: Create brand profile
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
        print("✅ Created DigiSol.AI brand profile")
    except Exception as e:
        print(f"⚠️  Brand profile issue: {e}")
        # Try to update existing one
        existing_bp = BrandProfile.objects.filter(tenant=tenant).first()
        if existing_bp:
            existing_bp.primary_color = "#1F4287"
            existing_bp.secondary_color = "#FFC300"
            existing_bp.font_family = "Inter"
            existing_bp.name = "DigiSol.AI"
            existing_bp.description = "AI-Powered Marketing Automation Platform"
            existing_bp.branding_status = "active"
            existing_bp.last_updated_by = admin_user
            existing_bp.save()
            print("✅ Updated existing brand profile")
    
    # Step 4: Create unlimited subscription plan
    unlimited_plan = SubscriptionPlan.objects.filter(name="Developer Unlimited").first()
    if not unlimited_plan:
        unlimited_plan = SubscriptionPlan.objects.create(
            name="Developer Unlimited",
            description="Unlimited access for DigiSol.AI developers",
            monthly_cost=0.00,
            annual_cost=0.00,
            contact_limit=-1,
            email_send_limit=-1,
            ai_text_credits_per_month=-1,
            ai_image_credits_per_month=-1,
            ai_planning_requests_per_month=-1,
            automation_workflow_limit=-1,
            integration_limit=-1,
            client_portals_limit=-1,
            is_active=True
        )
        print("✅ Created unlimited developer plan")
    else:
        print("✅ Unlimited developer plan exists")
    
    # Step 5: Assign subscription
    subscription = Subscription.objects.filter(tenant=tenant).first()
    if not subscription:
        # Create customer first
        from subscription_billing.models import Customer
        customer = Customer.objects.filter(tenant=tenant).first()
        if not customer:
            customer = Customer.objects.create(tenant=tenant)
        
        subscription = Subscription.objects.create(
            customer=customer,
            plan=unlimited_plan,
            tenant=tenant,
            status="active",
            current_period_start=django.utils.timezone.now(),
            current_period_end=django.utils.timezone.now() + django.utils.timezone.timedelta(days=365*10),  # 10 years
            cancel_at_period_end=False
        )
        print("✅ Created unlimited subscription")
    else:
        subscription.plan = unlimited_plan
        subscription.status = "active"
        subscription.cancel_at_period_end = False
        subscription.save()
        print("✅ Updated existing subscription to unlimited")
    
    # Step 6: Ensure global AI agents
    global_agents = AIProfile.objects.filter(tenant__isnull=True).count()
    if global_agents == 0:
        print("⚠️  No global AI agents found. Creating them...")
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
        
        for agent_data in default_agents:
            AIProfile.objects.create(
                name=agent_data['name'],
                specialization=agent_data['specialization'],
                personality_description=agent_data['personality_description'],
                is_active=agent_data['is_active'],
                tenant=None
            )
        print("✅ Created global AI agents")
    else:
        print(f"✅ Found {global_agents} global AI agents")
    
    print(f"\n🎉 DigiSol.AI setup completed!")
    print(f"   Tenant: {tenant.name}")
    print(f"   Admin: {admin_user.email}")
    print(f"   Subscription: {unlimited_plan.name} (${unlimited_plan.monthly_cost})")
    print(f"   Global AI Agents: {AIProfile.objects.filter(tenant__isnull=True).count()}")

if __name__ == "__main__":
    setup_digisol_simple()
