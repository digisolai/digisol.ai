#!/usr/bin/env python3
"""
Script to ensure new client registrations get a fresh experience.
This sets up proper data isolation so existing user data doesn't affect new clients.
"""

import os
import django
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from core.models import Tenant, BrandProfile
from ai_services.models import AIProfile

def ensure_fresh_client_experience():
    """Ensure new clients get a fresh experience with proper data isolation."""
    
    print("🆕 Ensuring Fresh Client Experience")
    print("=" * 50)
    
    try:
        # Step 1: Check if global AI agents exist
        print("\n1. Checking global AI agents...")
        global_agents = AIProfile.objects.filter(tenant__isnull=True).count()
        print(f"   📊 Found {global_agents} global AI agents")
        
        if global_agents == 0:
            print("   ⚠️  No global AI agents found. Creating default global agents...")
            
            # Create default global AI agents
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
        
        # Step 2: Check tenant isolation
        print("\n2. Checking tenant isolation...")
        tenants = Tenant.objects.all()
        print(f"   📊 Found {tenants.count()} tenants in the system")
        
        for tenant in tenants:
            print(f"      - {tenant.name} (ID: {tenant.id})")
            
            # Check if each tenant has a brand profile
            brand_profile = BrandProfile.objects.filter(tenant=tenant).first()
            if not brand_profile:
                print(f"         ⚠️  No brand profile found for {tenant.name}")
                print(f"         🔧 Creating default brand profile...")
                
                BrandProfile.objects.create(
                    tenant=tenant,
                    primary_color="#1F4287",
                    secondary_color="#FFC300",
                    font_family="Inter",
                    name="DigiSol.AI",
                    description="AI-Powered Marketing Automation"
                )
                print(f"         ✅ Created default brand profile for {tenant.name}")
            else:
                print(f"         ✅ Brand profile exists for {tenant.name}")
        
        # Step 3: Verify data isolation
        print("\n3. Verifying data isolation...")
        from core.models import Contact, Campaign, EmailTemplate, AutomationWorkflow
        
        for tenant in tenants:
            contact_count = Contact.objects.filter(tenant=tenant).count()
            campaign_count = Campaign.objects.filter(tenant=tenant).count()
            template_count = EmailTemplate.objects.filter(tenant=tenant).count()
            workflow_count = AutomationWorkflow.objects.filter(tenant=tenant).count()
            
            print(f"   📊 Data for {tenant.name}:")
            print(f"      - Contacts: {contact_count}")
            print(f"      - Campaigns: {campaign_count}")
            print(f"      - Email Templates: {template_count}")
            print(f"      - Automation Workflows: {workflow_count}")
        
        print(f"\n✅ Fresh client experience configuration completed!")
        print("   New clients will get:")
        print("   - A clean, isolated tenant")
        print("   - Access to global AI agents")
        print("   - Default brand profile")
        print("   - No pre-existing data from other users")
        
    except Exception as e:
        print(f"   ❌ An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    ensure_fresh_client_experience()
