from django.core.management.base import BaseCommand
from django.utils import timezone
from ai_services.models import StructuraInsight, AIEcosystemHealth, AIProfile
from core.models import Tenant
from accounts.models import CustomUser
import random


class Command(BaseCommand):
    help = 'Populate sample data for Structura insights and ecosystem health'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample Structura insights and ecosystem health data...')
        
        # Get or create a tenant and user for sample data
        tenant, created = Tenant.objects.get_or_create(
            name='Sample Tenant',
            defaults={
                'subdomain': 'sample',
                'is_active': True
            }
        )
        
        user, created = CustomUser.objects.get_or_create(
            email='admin@sample.com',
            defaults={
                'username': 'admin_sample',
                'first_name': 'Admin',
                'last_name': 'User',
                'tenant': tenant,
                'is_staff': True,
                'is_active': True
            }
        )
        
        # Get some AI profiles for sample data
        ai_profiles = list(AIProfile.objects.all()[:5])
        
        # Create sample Structura insights
        insights_data = [
            {
                'type': 'prediction',
                'title': 'Q4 Customer Engagement Surge',
                'description': 'Structura predicts a 15% increase in customer engagement for Q4 based on current campaign trends and social sentiment analysis.',
                'confidence': 87,
                'impact': 'high',
                'category': 'engagement',
                'actionable': True,
                'action_text': 'Review & Apply'
            },
            {
                'type': 'recommendation',
                'title': 'Social Media Budget Reallocation',
                'description': 'Structura advises reallocating 10% of social media budget from Platform A to Platform B, as Sentiment AI detects higher positive brand mentions on B.',
                'confidence': 92,
                'impact': 'medium',
                'category': 'budget',
                'actionable': True,
                'action_text': 'Review & Apply'
            },
            {
                'type': 'alert',
                'title': 'Churn Risk in Segment X',
                'description': 'Identified potential churn risk in Segment X (Retention AI). Structura suggests triggering proactive re-engagement campaigns via Catalyst, personalized by Engage.',
                'confidence': 78,
                'impact': 'critical',
                'category': 'retention',
                'actionable': True,
                'action_text': 'Take Action'
            },
            {
                'type': 'opportunity',
                'title': 'New Market Entry Opportunity',
                'description': 'Market analysis reveals untapped potential in the Gen Z demographic. Structura recommends launching a targeted campaign with personalized content.',
                'confidence': 85,
                'impact': 'high',
                'category': 'market_expansion',
                'actionable': True,
                'action_text': 'Explore Opportunity'
            },
            {
                'type': 'prediction',
                'title': 'Seasonal Performance Boost',
                'description': 'Historical data analysis suggests a 20% performance improvement during holiday season. Structura recommends preparing campaigns in advance.',
                'confidence': 91,
                'impact': 'medium',
                'category': 'seasonal',
                'actionable': True,
                'action_text': 'Plan Ahead'
            }
        ]
        
        for insight_data in insights_data:
            insight, created = StructuraInsight.objects.get_or_create(
                tenant=tenant,
                title=insight_data['title'],
                defaults={
                    'type': insight_data['type'],
                    'description': insight_data['description'],
                    'confidence': insight_data['confidence'],
                    'impact': insight_data['impact'],
                    'category': insight_data['category'],
                    'actionable': insight_data['actionable'],
                    'action_text': insight_data['action_text'],
                    'generated_by_agent': random.choice(ai_profiles) if ai_profiles else None,
                    'context_data': {
                        'source': 'sample_data',
                        'created_by': 'management_command'
                    }
                }
            )
            if created:
                self.stdout.write(f'Created insight: {insight.title}')
        
        # Create sample ecosystem health data
        agent_statuses = []
        for profile in AIProfile.objects.all()[:10]:
            agent_statuses.append({
                'agent_id': str(profile.id),
                'agent_name': profile.name,
                'status': 'active' if profile.is_active else 'needs_attention',
                'performance_score': random.randint(70, 100),
                'last_activity': timezone.now().isoformat()
            })
        
        health, created = AIEcosystemHealth.objects.get_or_create(
            tenant=tenant,
            defaults={
                'overall_score': 92,
                'active_agents': len([s for s in agent_statuses if s['status'] == 'active']),
                'total_agents': len(agent_statuses),
                'system_status': 'optimal',
                'agent_statuses': agent_statuses
            }
        )
        
        if created:
            self.stdout.write(f'Created ecosystem health for tenant: {tenant.name}')
        else:
            health.agent_statuses = agent_statuses
            health.update_health_score()
            health.save()
            self.stdout.write(f'Updated ecosystem health for tenant: {tenant.name}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(insights_data)} Structura insights and ecosystem health data!'
            )
        ) 