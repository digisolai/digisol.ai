from django.core.management.base import BaseCommand
from ai_services.models import AIProfile


class Command(BaseCommand):
    help = 'Create default AI agents for different specializations'

    def handle(self, *args, **options):
        self.stdout.write('Creating default AI agents...')
        
        # Define default AI agents (removed Strategos, Nexus, and Aura)
        default_agents = [
            {
                'name': 'Pecunia',
                'personality_description': 'A financial planning specialist who ensures optimal budget allocation across marketing channels. Prioritizes cost efficiency and measurable returns.',
                'specialization': 'budget_analysis',
                'api_model_name': 'gemini-1.5-pro',
                'is_active': True,
                'tenant': None  # Global agent
            },
            {
                'name': 'Scriptor',
                'personality_description': 'A creative content specialist who generates engaging, brand-aligned content across all channels. Focuses on storytelling and audience engagement.',
                'specialization': 'content_creation',
                'api_model_name': 'gemini-1.5-pro',
                'is_active': True,
                'tenant': None  # Global agent
            },
            {
                'name': 'Catalyst',
                'personality_description': 'A performance optimization expert who continuously improves campaign performance through A/B testing, data analysis, and strategic adjustments.',
                'specialization': 'campaign_optimization',
                'api_model_name': 'gemini-1.5-pro',
                'is_active': True,
                'tenant': None  # Global agent
            },
            {
                'name': 'Prospero',
                'personality_description': 'A lead nurturing specialist who develops personalized engagement strategies to convert prospects into customers through targeted communication.',
                'specialization': 'lead_nurturing',
                'api_model_name': 'gemini-1.5-pro',
                'is_active': True,
                'tenant': None  # Global agent
            },
            {
                'name': 'Metrika',
                'personality_description': 'Precise, diagnostic, and a master of data. Metrika identifies hidden patterns, trends, and key insights from your analytics data.',
                'specialization': 'data_analysis',
                'api_model_name': 'gemini-1.5-pro',
                'is_active': True,
                'tenant': None  # Global agent
            },
            {
                'name': 'Connectus',
                'personality_description': 'The bridge builder of your digital ecosystem. Connectus ensures seamless data flow and interoperability between all your marketing and business tools.',
                'specialization': 'integrations_management',
                'api_model_name': 'gemini-1.5-pro',
                'is_active': True,
                'tenant': None  # Global agent
            },
            {
                'name': 'Mentor',
                'personality_description': 'Your patient and empowering guide through the DigiSol.AI platform. Mentor helps you master every feature and optimize your workflow.',
                'specialization': 'learning_guidance',
                'api_model_name': 'gemini-1.5-flash',
                'is_active': True,
                'tenant': None  # Global agent
            },
            {
                'name': 'Quantia',
                'personality_description': 'Analytical, precise, and visually-oriented. Quantia excels at presenting complex data clearly and extracting actionable insights from your marketing reports.',
                'specialization': 'reporting_insights',
                'api_model_name': 'gemini-1.5-pro',
                'is_active': True,
                'tenant': None  # Global agent
            },
            {
                'name': 'Structura',
                'personality_description': 'Orderly, collaborative, and efficiency-driven. Structura helps optimize your team structures, roles, and internal workflows for peak performance.',
                'specialization': 'organizational_planning',
                'api_model_name': 'gemini-1.5-pro',
                'is_active': True,
                'tenant': None  # Global agent
            },
            {
                'name': 'Automatix',
                'personality_description': 'Logical, sequential, and proactive. Automatix assists in building efficient multi-step, multi-channel automation workflows and defining precise triggers.',
                'specialization': 'automation_design',
                'api_model_name': 'gemini-1.5-pro',
                'is_active': True,
                'tenant': None  # Global agent
            },
            {
                'name': 'Icona',
                'personality_description': 'Aesthetic, consistent, and the vigilant guardian of your brand guidelines. Icona ensures all content and assets perfectly align with your brand\'s vision.',
                'specialization': 'brand_identity',
                'api_model_name': 'gemini-1.5-pro',
                'is_active': True,
                'tenant': None  # Global agent
            },
            {
                'name': 'Forma',
                'personality_description': 'Structured, versatile, and efficiency-focused. Forma helps you find, customize, and create perfect templates for any marketing need.',
                'specialization': 'template_curation',
                'api_model_name': 'gemini-1.5-flash',
                'is_active': True,
                'tenant': None  # Global agent
            },
            {
                'name': 'Promana',
                'personality_description': 'A project management expert who specializes in planning, scheduling, resource allocation, and progress tracking. Promana ensures projects stay on time, within budget, and meet quality standards.',
                'specialization': 'project_management',
                'api_model_name': 'gemini-1.5-pro',
                'is_active': True,
                'tenant': None  # Global agent
            }
        ]
        
        created_count = 0
        updated_count = 0
        
        for agent_data in default_agents:
            agent, created = AIProfile.objects.get_or_create(
                name=agent_data['name'],
                tenant=agent_data['tenant'],
                defaults={
                    'personality_description': agent_data['personality_description'],
                    'specialization': agent_data['specialization'],
                    'api_model_name': agent_data['api_model_name'],
                    'is_active': agent_data['is_active']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created AI agent: {agent.name} ({agent.get_specialization_display()})')
                )
            else:
                # Update existing agent
                agent.personality_description = agent_data['personality_description']
                agent.specialization = agent_data['specialization']
                agent.api_model_name = agent_data['api_model_name']
                agent.is_active = agent_data['is_active']
                agent.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated AI agent: {agent.name} ({agent.get_specialization_display()})')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully processed {len(default_agents)} AI agents: '
                f'{created_count} created, {updated_count} updated'
            )
        ) 