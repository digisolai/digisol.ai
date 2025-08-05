from django.core.management.base import BaseCommand
from integrations.models import IntegrationProvider, Integration
from ai_services.models import AIProfile


class Command(BaseCommand):
    help = 'Check integration providers and AI agents in the database'

    def handle(self, *args, **options):
        self.stdout.write('Checking integration data...')
        
        # Check integration providers
        providers = IntegrationProvider.objects.all()
        self.stdout.write(f'Found {providers.count()} integration providers:')
        for provider in providers:
            self.stdout.write(f'  - {provider.name} ({provider.display_name}) - Active: {provider.is_active}')
        
        # Check integrations
        integrations = Integration.objects.all()
        self.stdout.write(f'\nFound {integrations.count()} integrations:')
        for integration in integrations:
            self.stdout.write(f'  - {integration.name} ({integration.provider.display_name}) - Status: {integration.status}')
        
        # Check AI agents
        agents = AIProfile.objects.all()
        self.stdout.write(f'\nFound {agents.count()} AI agents:')
        for agent in agents:
            self.stdout.write(f'  - {agent.name} ({agent.specialization}) - Model: {agent.api_model_name} - Active: {agent.is_active}')
        
        # Check Connectus specifically
        connectus = AIProfile.objects.filter(name="Connectus").first()
        if connectus:
            self.stdout.write(f'\nConnectus agent found: {connectus.name} - Model: {connectus.api_model_name}')
        else:
            self.stdout.write('\nConnectus agent NOT found!')
        
        self.stdout.write(self.style.SUCCESS('Data check completed')) 