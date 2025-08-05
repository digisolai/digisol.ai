from django.core.management.base import BaseCommand
from django.utils import timezone
from campaigns.models import MarketingCampaign, CampaignStep, CatalystInsight
from core.models import Tenant
from accounts.models import CustomUser
from datetime import timedelta
import random


class Command(BaseCommand):
    help = 'Create sample campaign data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample campaign data...')
        
        # Get or create tenant and user
        tenant, created = Tenant.objects.get_or_create(
            name='Test Tenant',
            defaults={
                'subdomain': 'test',
                'is_active': True
            }
        )
        
        user, created = CustomUser.objects.get_or_create(
            email='test@example.com',
            defaults={
                'username': 'testuser',
                'first_name': 'Test',
                'last_name': 'User',
                'tenant': tenant,
                'is_staff': True,
                'is_active': True,
                'is_tenant_admin': True,
                'role': 'tenant_admin'
            }
        )
        
        # Sample campaign data
        campaigns_data = [
            {
                'name': 'Q4 Email Campaign',
                'description': 'Holiday season email campaign targeting existing customers',
                'campaign_type': 'email',
                'objective': 'Increase customer retention and holiday sales',
                'status': 'Active',
                'budget': 5000.00,
                'spent_budget': 3200.00,
                'target_roi': 2.5,
                'catalyst_health_score': 85
            },
            {
                'name': 'Social Media Brand Awareness',
                'description': 'Multi-platform social media campaign for brand awareness',
                'campaign_type': 'social',
                'objective': 'Increase brand awareness and social media following',
                'status': 'Active',
                'budget': 3000.00,
                'spent_budget': 1800.00,
                'target_roi': 1.8,
                'catalyst_health_score': 92
            },
            {
                'name': 'Lead Generation Webinar',
                'description': 'Educational webinar to generate qualified leads',
                'campaign_type': 'webinar',
                'objective': 'Generate qualified leads through educational content',
                'status': 'Draft',
                'budget': 2000.00,
                'spent_budget': 0.00,
                'target_roi': 3.0,
                'catalyst_health_score': 78
            },
            {
                'name': 'SMS Promotion Campaign',
                'description': 'Flash sale promotion via SMS to mobile subscribers',
                'campaign_type': 'sms',
                'objective': 'Drive immediate sales through time-limited offers',
                'status': 'Paused',
                'budget': 1500.00,
                'spent_budget': 750.00,
                'target_roi': 2.2,
                'catalyst_health_score': 65
            }
        ]
        
        # Create campaigns
        created_campaigns = []
        for campaign_data in campaigns_data:
            campaign, created = MarketingCampaign.objects.get_or_create(
                tenant=tenant,
                name=campaign_data['name'],
                defaults={
                    'description': campaign_data['description'],
                    'campaign_type': campaign_data['campaign_type'],
                    'objective': campaign_data['objective'],
                    'status': campaign_data['status'],
                    'budget': campaign_data['budget'],
                    'spent_budget': campaign_data['spent_budget'],
                    'target_roi': campaign_data['target_roi'],
                    'catalyst_health_score': campaign_data['catalyst_health_score'],
                    'created_by': user,
                    'start_date': timezone.now() - timedelta(days=random.randint(1, 30)),
                    'end_date': timezone.now() + timedelta(days=random.randint(30, 90))
                }
            )
            if created:
                self.stdout.write(f'Created campaign: {campaign.name}')
                created_campaigns.append(campaign)
        
        # Create sample Catalyst insights
        insights_data = [
            {
                'campaign': created_campaigns[0] if created_campaigns else None,
                'insight_type': 'performance',
                'title': 'Email Open Rate Below Average',
                'description': 'Your email open rate is 15% below industry average. Consider optimizing subject lines and send times.',
                'recommendation': 'Test different subject line formats and analyze optimal send times for your audience.',
                'priority': 'medium',
                'predicted_impact': {'open_rate': '+15%'}
            },
            {
                'campaign': created_campaigns[1] if len(created_campaigns) > 1 else None,
                'insight_type': 'opportunity',
                'title': 'High Engagement on Instagram',
                'description': 'Instagram posts are performing 25% better than other platforms. Consider increasing Instagram budget allocation.',
                'recommendation': 'Reallocate 20% of social media budget to Instagram and create more visual content.',
                'priority': 'high',
                'predicted_impact': {'engagement_rate': '+25%'}
            },
            {
                'campaign': created_campaigns[2] if len(created_campaigns) > 2 else None,
                'insight_type': 'optimization',
                'title': 'Webinar Registration Optimization',
                'description': 'Webinar registration page has a 40% bounce rate. Landing page needs optimization.',
                'recommendation': 'Simplify the registration form and add social proof elements to reduce bounce rate.',
                'priority': 'high',
                'predicted_impact': {'conversion_rate': '+30%'}
            }
        ]
        
        for insight_data in insights_data:
            if insight_data['campaign']:
                insight, created = CatalystInsight.objects.get_or_create(
                    tenant=tenant,
                    campaign=insight_data['campaign'],
                    title=insight_data['title'],
                    defaults={
                        'insight_type': insight_data['insight_type'],
                        'description': insight_data['description'],
                        'recommendation': insight_data['recommendation'],
                        'priority': insight_data['priority'],
                        'predicted_impact': insight_data['predicted_impact'],
                        'confidence_score': random.randint(70, 95),
                        'is_dismissed': False,
                        'is_actioned': False
                    }
                )
                if created:
                    self.stdout.write(f'Created insight: {insight.title}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(created_campaigns)} campaigns and sample insights!'
            )
        ) 