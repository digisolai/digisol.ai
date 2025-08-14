from django.core.management.base import BaseCommand
from ai_services.models import AIProfile
from django.db import transaction


class Command(BaseCommand):
    help = 'Create default AI agents in the database'

    def handle(self, *args, **options):
        """Create all necessary AI agents."""
        
        self.stdout.write("🚀 Creating AI Agents in Database")
        self.stdout.write("=" * 50)
        
        # Define all AI agents
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
                    "name": "Catalyst",
    "specialization": "campaign_optimization",
    "personality_description": "Data-driven, performance-focused, and continuously improving. Catalyst analyzes campaign performance and suggests optimizations for better results.",
                "is_active": True
            }
        ]
        
        created_count = 0
        
        with transaction.atomic():
            for agent_data in ai_agents:
                try:
                    # Check if agent already exists
                    existing_agent = AIProfile.objects.filter(
                        name=agent_data['name'],
                        tenant__isnull=True
                    ).first()
                    
                    if existing_agent:
                        self.stdout.write(f"   ⚠️  {agent_data['name']} already exists, skipping...")
                        continue
                    
                    # Create the agent with tenant=None (global agent)
                    agent = AIProfile.objects.create(
                        name=agent_data['name'],
                        specialization=agent_data['specialization'],
                        personality_description=agent_data['personality_description'],
                        is_active=agent_data['is_active'],
                        tenant=None  # Global agent
                    )
                    
                    self.stdout.write(f"   ✅ {agent_data['name']} created successfully")
                    created_count += 1
                    
                except Exception as e:
                    self.stdout.write(f"   ❌ Error creating {agent_data['name']}: {e}")
        
        self.stdout.write(f"\n✅ Successfully created {created_count} out of {len(ai_agents)} AI agents")
        
        # Verify creation
        total_agents = AIProfile.objects.filter(tenant__isnull=True).count()
        self.stdout.write(f"\n📊 Total global agents in database: {total_agents}")
        
        # Test Automatix specifically
        automatix = AIProfile.objects.filter(
            name="Automatix",
            specialization="automation_design",
            tenant__isnull=True
        ).first()
        
        if automatix:
            self.stdout.write("   ✅ Automatix agent found and working!")
            self.stdout.write(f"      ID: {automatix.id}")
            self.stdout.write(f"      Specialization: {automatix.specialization}")
        else:
            self.stdout.write("   ❌ Automatix agent not found")
        
        self.stdout.write("\n" + "=" * 50)
        self.stdout.write("🎉 AI Agents Setup Complete!")
        self.stdout.write("The Automatix agent and all other AI agents should now be available.")
