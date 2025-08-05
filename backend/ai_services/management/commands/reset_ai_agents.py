from django.core.management.base import BaseCommand
from ai_services.models import AIProfile
from django.db import transaction


class Command(BaseCommand):
    help = 'Reset AI agents to exactly 13 unique agents (removed Strategos, Nexus, Aura)'

    def handle(self, *args, **options):
        self.stdout.write('Resetting AI agents...')
        
        # Delete all existing AI agents
        count = AIProfile.objects.all_tenants().count()
        self.stdout.write(f"Found {count} existing AI agents")
        
        AIProfile.objects.all_tenants().delete()
        self.stdout.write("Deleted all existing AI agents")
        
        # Define the 13 unique AI agents (removed Strategos, Nexus, Aura)
        ai_agents = [
            {
                'name': 'Pecunia',
                'personality_description': 'A financial planning specialist who ensures optimal budget allocation across marketing channels. Prioritizes cost efficiency and measurable returns.',
                'specialization': 'budget_analysis',
                'api_model_name': 'gpt-4o',
                'is_active': True,
                'tenant': None
            },
            {
                'name': 'Scriptor',
                'personality_description': 'A creative content specialist who generates engaging, brand-aligned content across all channels. Focuses on storytelling and audience engagement.',
                'specialization': 'content_creation',
                'api_model_name': 'gpt-4o',
                'is_active': True,
                'tenant': None
            },
            {
                'name': 'Catalyst',
                'personality_description': 'A performance optimization expert who continuously improves campaign performance through A/B testing, data analysis, and strategic adjustments.',
                'specialization': 'campaign_optimization',
                'api_model_name': 'gpt-4o',
                'is_active': True,
                'tenant': None
            },
            {
                'name': 'Prospero',
                'personality_description': 'A lead nurturing specialist who develops personalized engagement strategies to convert prospects into customers through targeted communication.',
                'specialization': 'lead_nurturing',
                'api_model_name': 'gpt-4o',
                'is_active': True,
                'tenant': None
            },
            {
                'name': 'Metrika',
                'personality_description': 'Precise, diagnostic, and a master of data. Metrika identifies hidden patterns, trends, and key insights from your analytics data.',
                'specialization': 'data_analysis',
                'api_model_name': 'gpt-4o',
                'is_active': True,
                'tenant': None
            },
            {
                'name': 'Connectus',
                'personality_description': 'The bridge builder of your digital ecosystem. Connectus ensures seamless data flow and interoperability between all your marketing and business tools.',
                'specialization': 'integrations_management',
                'api_model_name': 'gpt-4o',
                'is_active': True,
                'tenant': None
            },
            {
                'name': 'Mentor',
                'personality_description': 'Your patient and empowering guide through the DigiSol.AI platform. Mentor helps you master every feature and optimize your workflow.',
                'specialization': 'learning_guidance',
                'api_model_name': 'gpt-4o',
                'is_active': True,
                'tenant': None
            },
            {
                'name': 'Quantia',
                'personality_description': 'Analytical, precise, and visually-oriented. Quantia excels at presenting complex data clearly and extracting actionable insights from your marketing reports.',
                'specialization': 'reporting_insights',
                'api_model_name': 'gpt-4o',
                'is_active': True,
                'tenant': None
            },
            {
                'name': 'Structura',
                'personality_description': 'A strategic organizational expert who helps structure teams, processes, and workflows for maximum efficiency and collaboration.',
                'specialization': 'organizational_planning',
                'api_model_name': 'gpt-4o',
                'is_active': True,
                'tenant': None
            },
            {
                'name': 'Automatix',
                'personality_description': 'An automation specialist who designs and implements intelligent workflows to streamline your marketing operations and increase productivity.',
                'specialization': 'automation_design',
                'api_model_name': 'gpt-4o',
                'is_active': True,
                'tenant': None
            },
            {
                'name': 'Icona',
                'personality_description': 'A brand identity expert who helps develop and maintain consistent brand messaging, visual identity, and brand positioning across all channels.',
                'specialization': 'brand_identity',
                'api_model_name': 'gpt-4o',
                'is_active': True,
                'tenant': None
            },
            {
                'name': 'Forma',
                'personality_description': 'A template and design curator who creates and maintains professional, branded templates for all your marketing materials and communications.',
                'specialization': 'template_curation',
                'api_model_name': 'gpt-4o',
                'is_active': True,
                'tenant': None
            },
            {
                'name': 'Promana',
                'personality_description': 'A project management expert who specializes in planning, scheduling, resource allocation, and progress tracking. Promana ensures projects stay on time, within budget, and meet quality standards.',
                'specialization': 'project_management',
                'api_model_name': 'gpt-4o',
                'is_active': True,
                'tenant': None
            }
        ]
        
        # Create the AI agents
        with transaction.atomic():
            for agent_data in ai_agents:
                agent = AIProfile.objects.create(**agent_data)
                self.stdout.write(f"Created: {agent.name} ({agent.specialization})")
        
        # Verify the count
        final_count = AIProfile.objects.all_tenants().count()
        self.stdout.write(self.style.SUCCESS(f"\n✅ Successfully created {final_count} AI agents"))
        
        # List all agents
        self.stdout.write("\n📋 All AI Agents:")
        for i, agent in enumerate(AIProfile.objects.all_tenants().order_by('specialization', 'name'), 1):
            self.stdout.write(f"{i:2d}. {agent.name} ({agent.specialization})") 