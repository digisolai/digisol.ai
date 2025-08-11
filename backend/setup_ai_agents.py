#!/usr/bin/env python
"""
Script to set up AI agents on the production backend
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from django.core.management import call_command
from ai_services.models import AIProfile

def setup_ai_agents():
    """Set up AI agents in the database"""
    print("🚀 Setting up AI Agents...")
    
    # Check if agents already exist
    existing_agents = AIProfile.objects.count()
    if existing_agents > 0:
        print(f"✅ {existing_agents} AI agents already exist")
        return
    
    # Create AI agents
    try:
        call_command('create_ai_agents')
        print("✅ AI agents created successfully!")
        
        # Verify creation
        total_agents = AIProfile.objects.count()
        active_agents = AIProfile.objects.filter(is_active=True).count()
        print(f"📊 Total agents: {total_agents}")
        print(f"📊 Active agents: {active_agents}")
        
    except Exception as e:
        print(f"❌ Error creating AI agents: {e}")
        raise

if __name__ == "__main__":
    setup_ai_agents()
