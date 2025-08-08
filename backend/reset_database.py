#!/usr/bin/env python3
"""
Script to reset the database and create a fresh superuser for testing.
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.contrib.auth import get_user_model
from django.db import connection

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from django.core.management import call_command
from core.models import BrandProfile
from ai_services.models import AIProfile

def reset_database():
    """Reset the database and create a fresh superuser."""
    
    print("🗑️  Resetting Database for Fresh Start")
    print("=" * 50)
    
    # Step 1: Clear all data
    print("\n1. Clearing all data...")
    
    try:
        # Clear all AI agents
        AIProfile.objects.all().delete()
        print("   ✅ Cleared all AI agents")
        
        # Clear all brand profiles
        BrandProfile.objects.all().delete()
        print("   ✅ Cleared all brand profiles")
        
        # Clear all users (except superuser if exists)
        User = get_user_model()
        User.objects.filter(is_superuser=False).delete()
        print("   ✅ Cleared all regular users")
        
        # Clear any existing superusers
        User.objects.filter(is_superuser=True).delete()
        print("   ✅ Cleared existing superusers")
        
    except Exception as e:
        print(f"   ❌ Error clearing data: {e}")
        return
    
    # Step 2: Create fresh superuser
    print("\n2. Creating fresh superuser...")
    
    try:
        # Create superuser
        User = get_user_model()
        superuser = User.objects.create_superuser(
            username='admin',
            email='admin@digisolai.ca',
            password='admin123456',
            first_name='Admin',
            last_name='User'
        )
        print("   ✅ Created superuser: admin@digisolai.ca")
        print("   ✅ Password: admin123456")
        
    except Exception as e:
        print(f"   ❌ Error creating superuser: {e}")
        return
    
    # Step 3: Create default brand profile for superuser
    print("\n3. Creating default brand profile...")
    
    try:
        brand_profile = BrandProfile.objects.create(
            tenant=superuser.tenant,
            primary_color="#2563EB",
            secondary_color="#FFC300",
            font_family="Inter",
            name="DigiSol.AI",
            description="AI-Powered Marketing Automation"
        )
        print("   ✅ Created default brand profile")
        
    except Exception as e:
        print(f"   ❌ Error creating brand profile: {e}")
    
    # Step 4: Create global AI agents
    print("\n4. Creating global AI agents...")
    
    try:
        ai_agents = [
            {
                "name": "Automatix",
                "specialization": "automation_design",
                "personality_description": "Efficient, systematic, and workflow-optimized. Automatix specializes in designing and implementing automated marketing workflows that save time and increase conversions.",
                "is_active": True
            },
            {
                "name": "Scriptor",
                "specialization": "content_creation",
                "personality_description": "Creative, engaging, and brand-conscious. Scriptor excels at creating compelling content that resonates with your target audience and drives engagement.",
                "is_active": True
            },
            {
                "name": "Prospero",
                "specialization": "lead_nurturing",
                "personality_description": "Patient, strategic, and relationship-focused. Prospero develops personalized lead nurturing strategies that convert prospects into loyal customers.",
                "is_active": True
            },
            {
                "name": "Pecunia",
                "specialization": "budget_analysis",
                "personality_description": "Meticulous, cost-conscious, and ROI-focused. Pecunia provides intelligent budget analysis and optimization recommendations for maximum marketing efficiency.",
                "is_active": True
            },
            {
                "name": "Metrika",
                "specialization": "data_analysis",
                "personality_description": "Analytical, precise, and insight-driven. Metrika excels at complex data analysis, pattern recognition, and strategic insights for data-driven decisions.",
                "is_active": True
            },
            {
                "name": "Quantia",
                "specialization": "reporting_insights",
                "personality_description": "Clear, visual, and actionable. Quantia transforms complex data into clear, actionable insights and beautiful reports that drive decision-making.",
                "is_active": True
            },
            {
                "name": "Structura",
                "specialization": "organizational_planning",
                "personality_description": "Orderly, collaborative, and efficiency-driven. Structura helps optimize team structures, roles, and workflows for peak performance.",
                "is_active": True
            },
            {
                "name": "Icona",
                "specialization": "brand_identity",
                "personality_description": "Creative, visually-driven, and brand-conscious. Icona helps develop and maintain cohesive brand identity across all touchpoints.",
                "is_active": True
            },
            {
                "name": "Connectus",
                "specialization": "integrations_management",
                "personality_description": "Technical, bridge-building, and ecosystem-focused. Connectus ensures seamless data flow and interoperability between all your marketing and business tools.",
                "is_active": True
            },
            {
                "name": "Mentor",
                "specialization": "learning_guidance",
                "personality_description": "Patient, encouraging, and adaptive. Mentor personalizes your learning journey and helps you master new skills at your own pace.",
                "is_active": True
            },
            {
                "name": "Orchestra",
                "specialization": "general_orchestration",
                "personality_description": "Strategic, collaborative, and coordination-focused. Orchestra orchestrates all your AI agents and marketing activities for maximum impact.",
                "is_active": True
            },
            {
                "name": "Curator",
                "specialization": "template_curation",
                "personality_description": "Organized, quality-focused, and user-centric. Curator helps you find, organize, and customize the perfect templates for your campaigns.",
                "is_active": True
            },
            {
                "name": "Planner",
                "specialization": "project_management",
                "personality_description": "Organized, deadline-driven, and team-focused. Planner helps you manage marketing projects efficiently and keep teams aligned.",
                "is_active": True
            },
            {
                "name": "Strategist",
                "specialization": "marketing_strategy",
                "personality_description": "Strategic, market-aware, and growth-focused. Strategist develops comprehensive marketing strategies that drive business growth.",
                "is_active": True
            },
            {
                "name": "Optimizer",
                "specialization": "campaign_optimization",
                "personality_description": "Data-driven, performance-focused, and continuously improving. Optimizer analyzes campaign performance and suggests optimizations for better results.",
                "is_active": True
            }
        ]
        
        created_count = 0
        for agent_data in ai_agents:
            try:
                agent = AIProfile.objects.create(
                    name=agent_data['name'],
                    specialization=agent_data['specialization'],
                    personality_description=agent_data['personality_description'],
                    is_active=agent_data['is_active'],
                    tenant=None  # Global agents
                )
                created_count += 1
                print(f"   ✅ Created {agent_data['name']}")
            except Exception as e:
                print(f"   ❌ Error creating {agent_data['name']}: {e}")
        
        print(f"   ✅ Created {created_count} global AI agents")
        
    except Exception as e:
        print(f"   ❌ Error creating AI agents: {e}")
    
    # Step 5: Verify setup
    print("\n5. Verifying setup...")
    
    try:
        User = get_user_model()
        user_count = User.objects.count()
        brand_count = BrandProfile.objects.count()
        agent_count = AIProfile.objects.count()
        
        print(f"   ✅ Users: {user_count}")
        print(f"   ✅ Brand profiles: {brand_count}")
        print(f"   ✅ AI agents: {agent_count}")
        
        # Check for Automatix specifically
        automatix = AIProfile.objects.filter(name="Automatix").first()
        if automatix:
            print("   ✅ Automatix agent is available")
        else:
            print("   ❌ Automatix agent not found")
            
    except Exception as e:
        print(f"   ❌ Error verifying setup: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Database Reset Complete!")
    print("\n📋 Login Credentials:")
    print("   Email: admin@digisolai.ca")
    print("   Password: admin123456")
    print("\n🚀 You can now test the app as a fresh user!")
    print("   All features will show their default/empty states.")

if __name__ == "__main__":
    reset_database()
