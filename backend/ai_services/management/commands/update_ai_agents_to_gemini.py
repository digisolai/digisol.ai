from django.core.management.base import BaseCommand
from ai_services.models import AIProfile


class Command(BaseCommand):
    help = 'Update all AI agents to use Gemini models instead of GPT'

    def handle(self, *args, **options):
        self.stdout.write('Updating AI agents to use Gemini models...')
        
        # Update all existing agents to use Gemini models
        agents_updated = 0
        
        for agent in AIProfile.objects.all():
            # Update the API model name to use Gemini
            if agent.api_model_name in ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo']:
                # Choose appropriate Gemini model based on specialization
                if agent.specialization in ['content_creation', 'campaign_optimization', 'data_analysis', 'reporting_insights']:
                    agent.api_model_name = 'gemini-1.5-pro'
                else:
                    agent.api_model_name = 'gemini-1.5-flash'
                
                agent.save(update_fields=['api_model_name'])
                agents_updated += 1
                self.stdout.write(f'Updated {agent.name} to use {agent.api_model_name}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {agents_updated} AI agents to use Gemini models')
        ) 