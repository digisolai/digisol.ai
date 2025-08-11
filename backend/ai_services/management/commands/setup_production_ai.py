from django.core.management.base import BaseCommand
from ai_services.models import AIProfile
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Set up AI agents for production environment'

    def handle(self, *args, **options):
        """Set up AI agents for production"""
        
        self.stdout.write("🚀 Setting up AI Agents for Production")
        self.stdout.write("=" * 50)
        
        # Check if agents already exist
        existing_count = AIProfile.objects.count()
        if existing_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f"✅ {existing_count} AI agents already exist")
            )
            return
        
        # Define all AI agents for production
        ai_agents = [
            {
                "name": "Structura",
                "specialization": "general_orchestration",
                "personality_description": "Strategic, collaborative, and coordination-focused. Structura orchestrates all your AI agents and marketing activities for maximum impact.",
                "api_model_name": "gemini-pro",
                "is_active": True,
                "is_global": True
            },
            {
                "name": "Catalyst",
                "specialization": "campaign_optimization",
                "personality_description": "Dynamic, performance-driven, and adaptive. Catalyst optimizes campaigns in real-time for maximum ROI and engagement.",
                "api_model_name": "gemini-pro",
                "is_active": True,
                "is_global": True
            },
            {
                "name": "Scriptor",
                "specialization": "content_creation",
                "personality_description": "Creative, engaging, and brand-conscious. Scriptor excels at creating compelling content that resonates with your target audience.",
                "api_model_name": "gemini-pro",
                "is_active": True,
                "is_global": True
            },
            {
                "name": "Pecunia",
                "specialization": "budget_analysis",
                "personality_description": "Meticulous, cost-conscious, and ROI-focused. Pecunia provides intelligent budget analysis and optimization recommendations.",
                "api_model_name": "gemini-pro",
                "is_active": True,
                "is_global": True
            },
            {
                "name": "Metrika",
                "specialization": "data_analysis",
                "personality_description": "Analytical, precise, and insight-driven. Metrika excels at complex data analysis and strategic insights.",
                "api_model_name": "gemini-pro",
                "is_active": True,
                "is_global": True
            },
            {
                "name": "Prospero",
                "specialization": "lead_nurturing",
                "personality_description": "Patient, strategic, and relationship-focused. Prospero develops personalized lead nurturing strategies.",
                "api_model_name": "gemini-pro",
                "is_active": True,
                "is_global": True
            },
            {
                "name": "Connectus",
                "specialization": "integrations_management",
                "personality_description": "Technical, bridge-building, and ecosystem-focused. Connectus ensures seamless data flow between all your tools.",
                "api_model_name": "gemini-pro",
                "is_active": True,
                "is_global": True
            },
            {
                "name": "Mentor",
                "specialization": "learning_guidance",
                "personality_description": "Patient, encouraging, and adaptive. Mentor personalizes your learning journey and helps you master new skills.",
                "api_model_name": "gemini-pro",
                "is_active": True,
                "is_global": True
            }
        ]
        
        with transaction.atomic():
            created_count = 0
            for agent_data in ai_agents:
                agent, created = AIProfile.objects.get_or_create(
                    name=agent_data["name"],
                    defaults=agent_data
                )
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f"✅ Created {agent.name}")
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f"⚠️ {agent.name} already exists")
                    )
        
        total_agents = AIProfile.objects.count()
        active_agents = AIProfile.objects.filter(is_active=True).count()
        
        self.stdout.write("=" * 50)
        self.stdout.write(
            self.style.SUCCESS(f"🎉 Setup complete!")
        )
        self.stdout.write(f"📊 Total agents: {total_agents}")
        self.stdout.write(f"📊 Active agents: {active_agents}")
        self.stdout.write(f"📊 Newly created: {created_count}")
        
        if created_count > 0:
            self.stdout.write(
                self.style.SUCCESS("✅ AI agents are now ready for use!")
            )
