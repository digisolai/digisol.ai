from django.core.management.base import BaseCommand
from django.utils import timezone
from campaigns.models import (
    MarketingCampaign, CampaignStep, OptimizerInsight, 
    CampaignPerformance, CampaignAudience, CampaignTemplate
)
from accounts.models import CustomUser
from datetime import datetime, timedelta
import random


class Command(BaseCommand):
    help = 'Set up default Optimizer AI data and sample campaigns'

    def handle(self, *args, **options):
        # Get or create a user
        user = CustomUser.objects.first()
        if not user:
            self.stdout.write(
                self.style.ERROR('No users found. Please create a user first.')
            )
            return

        self.stdout.write('Setting up Optimizer AI data')

        # Create sample campaigns
        campaigns = self.create_sample_campaigns(user)
        
        # Create sample insights
        self.create_sample_insights(campaigns)
        
        # Create sample performance data
        self.create_sample_performance_data(campaigns)
        
        # Create sample audiences
        self.create_sample_audiences(user)
        
        # Create sample templates
        self.create_sample_templates(user)

        self.stdout.write(
            self.style.SUCCESS('Successfully set up Optimizer AI data!')
        )

    def create_sample_campaigns(self, user):
        campaigns_data = [
            {
                'name': 'Holiday Email Campaign',
                'description': 'Seasonal email campaign to boost holiday sales',
                'campaign_type': 'email',
                'objective': 'sales',
                'status': 'Active',
                'budget': 5000.00,
                'spent_budget': 3200.00,
                'target_roi': 150.0,
                'optimizer_health_score': 85,
                'auto_optimization_enabled': True,
            },
            {
                'name': 'Social Media Awareness',
                'description': 'Brand awareness campaign on social platforms',
                'campaign_type': 'social',
                'objective': 'awareness',
                'status': 'Active',
                'budget': 3000.00,
                'spent_budget': 1800.00,
                'target_roi': 120.0,
                'optimizer_health_score': 72,
                'auto_optimization_enabled': True,
            },
            {
                'name': 'Lead Nurturing Series',
                'description': 'Automated email series for lead nurturing',
                'campaign_type': 'email',
                'objective': 'leads',
                'status': 'Active',
                'budget': 2000.00,
                'spent_budget': 950.00,
                'target_roi': 200.0,
                'optimizer_health_score': 91,
                'auto_optimization_enabled': True,
            },
            {
                'name': 'Product Launch Campaign',
                'description': 'Multi-channel campaign for new product launch',
                'campaign_type': 'product_launch',
                'objective': 'sales',
                'status': 'Draft',
                'budget': 10000.00,
                'spent_budget': 0.00,
                'target_roi': 180.0,
                'optimizer_health_score': None,
                'auto_optimization_enabled': False,
            },
        ]

        campaigns = []
        for data in campaigns_data:
            campaign, created = MarketingCampaign.objects.get_or_create(
                name=data['name'],
                defaults={
                    'description': data['description'],
                    'campaign_type': data['campaign_type'],
                    'objective': data['objective'],
                    'status': data['status'],
                    'budget': data['budget'],
                    'spent_budget': data['spent_budget'],
                    'target_roi': data['target_roi'],
                    'optimizer_health_score': data['optimizer_health_score'],
                    'auto_optimization_enabled': data['auto_optimization_enabled'],
                    'created_by': user,
                }
            )
            campaigns.append(campaign)
            
            if created:
                self.stdout.write(f'Created campaign: {campaign.name}')

        return campaigns

    def create_sample_insights(self, campaigns):
        insights_data = [
            {
                'title': 'Email Open Rate Below Average',
                'description': 'Your email open rate is 15% below industry average. Consider optimizing subject lines and send times.',
                'recommendation': 'Test different subject line formats and send emails during peak engagement hours (10 AM - 2 PM).',
                'insight_type': 'performance_alert',
                'priority': 'high',
                'confidence_score': 85.0,
            },
            {
                'title': 'High-Performing Audience Segment',
                'description': 'Segment "Early Adopters" shows 40% higher conversion rate than other segments.',
                'recommendation': 'Increase budget allocation to this segment and create similar lookalike audiences.',
                'insight_type': 'audience_insight',
                'priority': 'medium',
                'confidence_score': 92.0,
            },
            {
                'title': 'Optimal Send Time Identified',
                'description': 'Emails sent on Tuesdays at 11 AM show 25% higher engagement rates.',
                'recommendation': 'Schedule future emails for Tuesday mornings to maximize engagement.',
                'insight_type': 'timing_optimization',
                'priority': 'medium',
                'confidence_score': 78.0,
            },
            {
                'title': 'Budget Optimization Opportunity',
                'description': 'Campaign is spending 30% more than necessary for current performance levels.',
                'recommendation': 'Reduce daily budget by 20% and monitor performance for 7 days.',
                'insight_type': 'budget_recommendation',
                'priority': 'high',
                'confidence_score': 88.0,
            },
        ]

        for i, data in enumerate(insights_data):
            campaign = campaigns[i % len(campaigns)]
            insight, created = OptimizerInsight.objects.get_or_create(
                title=data['title'],
                campaign=campaign,
                defaults={
                    'description': data['description'],
                    'recommendation': data['recommendation'],
                    'insight_type': data['insight_type'],
                    'priority': data['priority'],
                    'confidence_score': data['confidence_score'],
                    'predicted_impact': {
                        'improvement': '15-25%',
                        'timeframe': '7-14 days',
                        'confidence': 'high'
                    },
                    'context_data': {
                        'source': 'ai_analysis',
                        'data_points': random.randint(1000, 5000)
                    }
                }
            )
            
            if created:
                self.stdout.write(f'Created insight: {insight.title}')

    def create_sample_performance_data(self, campaigns):
        # Create performance data for the last 30 days
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        
        for campaign in campaigns:
            if campaign.status == 'Active':
                current_date = start_date
                while current_date <= end_date:
                    # Generate realistic performance data
                    impressions = random.randint(500, 2000)
                    clicks = random.randint(impressions // 20, impressions // 10)  # 5-10% CTR
                    conversions = random.randint(clicks // 10, clicks // 5)  # 10-20% conversion rate
                    revenue = conversions * random.uniform(50, 200)  # $50-200 per conversion
                    cost = impressions * random.uniform(0.5, 2.0)  # $0.50-2.00 per impression
                    
                    performance, created = CampaignPerformance.objects.get_or_create(
                        campaign=campaign,
                        date=current_date,
                        defaults={
                            'impressions': impressions,
                            'clicks': clicks,
                            'conversions': conversions,
                            'revenue': revenue,
                            'cost': cost,
                            'opens': random.randint(impressions // 3, impressions // 2),  # 33-50% open rate
                            'bounces': random.randint(0, impressions // 100),  # 0-1% bounce rate
                            'unsubscribes': random.randint(0, clicks // 50),  # 0-2% unsubscribe rate
                        }
                    )
                    
                    if created:
                        self.stdout.write(f'Created performance data for {campaign.name} on {current_date}')
                    
                    current_date += timedelta(days=1)

    def create_sample_audiences(self, user):
        audiences_data = [
            {
                'name': 'Early Adopters',
                'description': 'Customers who purchase new products within 30 days of launch',
                'segment_type': 'dynamic',
                'estimated_size': 2500,
                'actual_size': 2340,
                'engagement_rate': 0.085,
                'conversion_rate': 0.032,
                'optimizer_score': 8.5,
            },
            {
                'name': 'High-Value Customers',
                'description': 'Customers with lifetime value above $500',
                'segment_type': 'static',
                'estimated_size': 1200,
                'actual_size': 1180,
                'engagement_rate': 0.092,
                'conversion_rate': 0.045,
                'optimizer_score': 9.2,
            },
            {
                'name': 'Inactive Subscribers',
                'description': 'Email subscribers who haven\'t engaged in 90+ days',
                'segment_type': 'dynamic',
                'estimated_size': 5000,
                'actual_size': 4870,
                'engagement_rate': 0.015,
                'conversion_rate': 0.005,
                'optimizer_score': 3.2,
            },
        ]

        for data in audiences_data:
            audience, created = CampaignAudience.objects.get_or_create(
                name=data['name'],
                defaults={
                    'description': data['description'],
                    'segment_type': data['segment_type'],
                    'estimated_size': data['estimated_size'],
                    'actual_size': data['actual_size'],
                    'engagement_rate': data['engagement_rate'],
                    'conversion_rate': data['conversion_rate'],
                    'optimizer_score': data['optimizer_score'],
                    'criteria': {
                        'conditions': [
                            {'field': 'purchase_frequency', 'operator': 'gte', 'value': 2},
                            {'field': 'last_purchase_date', 'operator': 'gte', 'value': '30_days_ago'}
                        ]
                    },
                    'filters': [
                        {'type': 'demographic', 'field': 'age', 'value': '25-45'},
                        {'type': 'behavioral', 'field': 'engagement_score', 'value': 'high'}
                    ],
                    'optimizer_recommendations': [
                        'Target with premium product offers',
                        'Use personalized messaging',
                        'Test different communication channels'
                    ],
                    'created_by': user,
                }
            )
            
            if created:
                self.stdout.write(f'Created audience: {audience.name}')

    def create_sample_templates(self, user):
        templates_data = [
            {
                'name': 'Welcome Email Series',
                'description': '3-part welcome series for new subscribers',
                'category': 'email_series',
                'campaign_data': {
                    'campaign_type': 'email',
                    'objective': 'engagement',
                    'target_audience_segment': 'new_subscribers'
                },
                'steps_data': [
                    {
                        'step_type': 'Email',
                        'name': 'Welcome Email',
                        'description': 'Initial welcome message',
                        'order': 1,
                        'config': {'subject': 'Welcome to our community!'},
                        'content_data': {'template': 'welcome_1'},
                        'is_enabled': True
                    },
                    {
                        'step_type': 'Delay',
                        'name': '2 Day Delay',
                        'description': 'Wait 2 days before next email',
                        'order': 2,
                        'config': {'delay_days': 2},
                        'is_enabled': True
                    },
                    {
                        'step_type': 'Email',
                        'name': 'Getting Started Guide',
                        'description': 'Help new users get started',
                        'order': 3,
                        'config': {'subject': 'Here\'s how to get started'},
                        'content_data': {'template': 'getting_started'},
                        'is_enabled': True
                    }
                ],
                'is_public': True,
                'is_featured': True,
            },
            {
                'name': 'Product Launch Campaign',
                'description': 'Complete product launch campaign template',
                'category': 'product_launch',
                'campaign_data': {
                    'campaign_type': 'multi_channel',
                    'objective': 'sales',
                    'target_audience_segment': 'existing_customers'
                },
                'steps_data': [
                    {
                        'step_type': 'Email',
                        'name': 'Launch Announcement',
                        'description': 'Announce new product launch',
                        'order': 1,
                        'config': {'subject': 'Introducing our latest product!'},
                        'content_data': {'template': 'launch_announcement'},
                        'is_enabled': True
                    },
                    {
                        'step_type': 'Social_Post',
                        'name': 'Social Media Posts',
                        'description': 'Cross-platform social media posts',
                        'order': 2,
                        'config': {'platforms': ['facebook', 'instagram', 'twitter']},
                        'content_data': {'template': 'social_launch'},
                        'is_enabled': True
                    },
                    {
                        'step_type': 'Ad',
                        'name': 'Paid Advertising',
                        'description': 'Targeted paid ads',
                        'order': 3,
                        'config': {'platforms': ['google_ads', 'facebook_ads']},
                        'content_data': {'template': 'paid_ads'},
                        'is_enabled': True
                    }
                ],
                'is_public': True,
                'is_featured': True,
            },
        ]

        for data in templates_data:
            template, created = CampaignTemplate.objects.get_or_create(
                name=data['name'],
                defaults={
                    'description': data['description'],
                    'category': data['category'],
                    'campaign_data': data['campaign_data'],
                    'steps_data': data['steps_data'],
                    'settings': {
                        'auto_optimization': True,
                        'a_b_testing': True,
                        'personalization': True
                    },
                    'usage_count': random.randint(5, 50),
                    'rating': round(random.uniform(4.0, 5.0), 1),
                    'is_public': data['is_public'],
                    'is_featured': data['is_featured'],
                    'created_by': user,
                }
            )
            
            if created:
                self.stdout.write(f'Created template: {template.name}') 