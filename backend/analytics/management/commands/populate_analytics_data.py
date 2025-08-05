from django.core.management.base import BaseCommand
from django.utils import timezone
from analytics.models import (
    ReportTemplate, SavedReport, AnalyticsModel, AnalyticsInsight,
    SEOAnalysis, SWOTAnalysis, IndustryAnalysis, DataSource
)
from accounts.models import CustomUser
from core.models import Tenant
import uuid


class Command(BaseCommand):
    help = 'Populate analytics system with sample data for Quantia and Metrika'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample analytics data...')

        # Get or create a sample tenant and user
        tenant, created = Tenant.objects.get_or_create(
            name="Sample Analytics Tenant"
        )

        user, created = CustomUser.objects.get_or_create(
            email='analytics@example.com',
            defaults={
                'username': 'analytics@example.com',
                'first_name': 'Analytics',
                'last_name': 'User',
                'tenant': tenant,
                'is_tenant_admin': True
            }
        )

        # Create Report Templates (Quantia)
        self.create_report_templates(user)

        # Create Saved Reports (Quantia)
        self.create_saved_reports(user, tenant)

        # Create Analytics Models (Metrika)
        self.create_analytics_models(user, tenant)

        # Create Analytics Insights (Metrika)
        self.create_analytics_insights(tenant)

        # Create SEO Analysis
        self.create_seo_analysis(user, tenant)

        # Create SWOT Analysis
        self.create_swot_analysis(user, tenant)

        # Create Industry Analysis
        self.create_industry_analysis(user, tenant)

        # Create Data Sources
        self.create_data_sources(tenant)

        self.stdout.write(
            self.style.SUCCESS('Successfully created sample analytics data!')
        )

    def create_report_templates(self, user):
        templates_data = [
            {
                'name': 'Marketing Performance Report',
                'description': 'Comprehensive overview of marketing campaign performance including metrics, trends, and ROI analysis.',
                'template_type': 'marketing_performance',
                'configuration': {
                    'metrics': ['email_open_rate', 'click_through_rate', 'conversion_rate', 'roi'],
                    'time_range': 'last_30_days',
                    'chart_types': ['line', 'bar', 'pie']
                }
            },
            {
                'name': 'Campaign ROI Summary',
                'description': 'Detailed analysis of campaign return on investment with cost breakdown and performance metrics.',
                'template_type': 'campaign_roi',
                'configuration': {
                    'metrics': ['roi', 'cpa', 'ltv', 'revenue'],
                    'time_range': 'last_90_days',
                    'chart_types': ['bar', 'funnel', 'table']
                }
            },
            {
                'name': 'Website Traffic Overview',
                'description': 'Analysis of website traffic patterns, sources, and user behavior insights.',
                'template_type': 'website_traffic',
                'configuration': {
                    'metrics': ['page_views', 'unique_visitors', 'bounce_rate', 'session_duration'],
                    'time_range': 'last_30_days',
                    'chart_types': ['line', 'pie', 'heatmap']
                }
            },
            {
                'name': 'Social Media Engagement',
                'description': 'Social media performance metrics including engagement rates, reach, and audience insights.',
                'template_type': 'social_media_engagement',
                'configuration': {
                    'metrics': ['engagement_rate', 'reach', 'impressions', 'clicks'],
                    'time_range': 'last_30_days',
                    'chart_types': ['line', 'bar', 'radar']
                }
            }
        ]

        for template_data in templates_data:
            ReportTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults={
                    'description': template_data['description'],
                    'template_type': template_data['template_type'],
                    'configuration': template_data['configuration'],
                    'is_global': True,
                    'created_by': user
                }
            )

    def create_saved_reports(self, user, tenant):
        reports_data = [
            {
                'name': 'Monthly Marketing Performance',
                'description': 'Monthly overview of all marketing activities and their performance',
                'configuration': {
                    'template_type': 'marketing_performance',
                    'metrics': ['email_open_rate', 'click_through_rate', 'conversion_rate'],
                    'time_range': 'last_30_days',
                    'schedule': 'monthly'
                }
            },
            {
                'name': 'Weekly Campaign ROI',
                'description': 'Weekly tracking of campaign ROI and performance metrics',
                'configuration': {
                    'template_type': 'campaign_roi',
                    'metrics': ['roi', 'cpa', 'revenue'],
                    'time_range': 'last_7_days',
                    'schedule': 'weekly'
                }
            }
        ]

        for report_data in reports_data:
            SavedReport.objects.get_or_create(
                name=report_data['name'],
                tenant=tenant,
                defaults={
                    'description': report_data['description'],
                    'configuration': report_data['configuration'],
                    'schedule_config': {'enabled': True, 'frequency': 'weekly'},
                    'created_by': user
                }
            )

    def create_analytics_models(self, user, tenant):
        models_data = [
            {
                'name': 'Customer Churn Prediction',
                'model_type': 'churn_prediction',
                'description': 'ML model to predict customer churn based on behavior patterns',
                'performance_metrics': {
                    'accuracy': 0.85,
                    'precision': 0.82,
                    'recall': 0.88,
                    'f1_score': 0.85
                }
            },
            {
                'name': 'Lead Scoring Model',
                'model_type': 'classification',
                'description': 'Model to score leads based on likelihood to convert',
                'performance_metrics': {
                    'accuracy': 0.78,
                    'precision': 0.75,
                    'recall': 0.80,
                    'f1_score': 0.77
                }
            },
            {
                'name': 'Revenue Forecasting',
                'model_type': 'time_series',
                'description': 'Time series model for revenue forecasting',
                'performance_metrics': {
                    'mae': 0.12,
                    'rmse': 0.15,
                    'r2_score': 0.82
                }
            }
        ]

        for model_data in models_data:
            AnalyticsModel.objects.get_or_create(
                name=model_data['name'],
                tenant=tenant,
                defaults={
                    'model_type': model_data['model_type'],
                    'description': model_data['description'],
                    'performance_metrics': model_data['performance_metrics'],
                    'is_active': True,
                    'created_by': user,
                    'last_trained': timezone.now()
                }
            )

    def create_analytics_insights(self, tenant):
        insights_data = [
            {
                'insight_type': 'trend',
                'title': 'Email Performance Improving',
                'description': 'Your email open rates have increased by 15% this month compared to last month.',
                'confidence_score': 0.92,
                'impact_score': 0.75,
                'recommendations': [
                    'Continue current subject line strategy',
                    'Test similar approaches with other campaigns'
                ]
            },
            {
                'insight_type': 'anomaly',
                'title': 'Unusual Drop in Conversions',
                'description': 'Conversion rate dropped 25% on Tuesday without clear cause.',
                'confidence_score': 0.78,
                'impact_score': 0.90,
                'recommendations': [
                    'Investigate Tuesday\'s traffic sources',
                    'Check for technical issues on landing pages'
                ]
            },
            {
                'insight_type': 'prediction',
                'title': 'Lead Generation Forecast',
                'description': 'Based on current trends, you can expect 1,250 leads next month.',
                'confidence_score': 0.88,
                'impact_score': 0.65,
                'recommendations': [
                    'Increase budget for top-performing channels',
                    'Optimize landing pages for better conversion'
                ]
            },
            {
                'insight_type': 'recommendation',
                'title': 'Budget Optimization Opportunity',
                'description': 'Shifting 15% of budget from display to search ads could increase qualified leads by 12%.',
                'confidence_score': 0.82,
                'impact_score': 0.85,
                'recommendations': [
                    'Reallocate budget from display to search ads',
                    'Monitor performance for 2 weeks before full implementation'
                ]
            }
        ]

        for insight_data in insights_data:
            AnalyticsInsight.objects.get_or_create(
                title=insight_data['title'],
                tenant=tenant,
                defaults={
                    'insight_type': insight_data['insight_type'],
                    'description': insight_data['description'],
                    'confidence_score': insight_data['confidence_score'],
                    'impact_score': insight_data['impact_score'],
                    'recommendations': insight_data['recommendations'],
                    'is_actioned': False
                }
            )

    def create_seo_analysis(self, user, tenant):
        seo_analysis = SEOAnalysis.objects.get_or_create(
            domain='example.com',
            tenant=tenant,
            defaults={
                'gsc_data': {
                    'total_clicks': 1250,
                    'total_impressions': 45000,
                    'average_ctr': 2.8,
                    'average_position': 15.2
                },
                'ga_data': {
                    'organic_traffic': 3200,
                    'organic_conversions': 45,
                    'bounce_rate': 65.2
                },
                'technical_seo': {
                    'mobile_usability_issues': 3,
                    'indexing_issues': 1,
                    'page_speed_score': 85
                },
                'keyword_data': {
                    'ranking_keywords': 150,
                    'top_10_keywords': 25,
                    'keyword_opportunities': 45
                },
                'insights': [
                    {
                        'type': 'opportunity',
                        'title': 'Mobile Optimization Needed',
                        'description': '3 mobile usability issues detected',
                        'priority': 'high'
                    }
                ],
                'recommendations': [
                    'Fix mobile usability issues',
                    'Optimize page loading speed',
                    'Target long-tail keywords'
                ],
                'created_by': user
            }
        )

    def create_swot_analysis(self, user, tenant):
        swot_analysis = SWOTAnalysis.objects.get_or_create(
            analysis_period='Q1 2025',
            tenant=tenant,
            defaults={
                'strengths': [
                    'Strong brand recognition in target market',
                    'High customer satisfaction scores',
                    'Efficient lead conversion process'
                ],
                'weaknesses': [
                    'Limited presence on emerging platforms',
                    'High customer acquisition cost',
                    'Dependency on single revenue stream'
                ],
                'opportunities': [
                    'Growing market demand for our services',
                    'Untapped international markets',
                    'Emerging technology trends'
                ],
                'threats': [
                    'Increasing competition from new entrants',
                    'Economic uncertainty affecting spending',
                    'Regulatory changes in industry'
                ],
                'strategic_recommendations': [
                    {
                        'category': 'leverage_strengths',
                        'recommendation': 'Launch referral program to capitalize on high customer satisfaction',
                        'priority': 'high'
                    },
                    {
                        'category': 'address_weaknesses',
                        'recommendation': 'Diversify marketing channels to reduce acquisition costs',
                        'priority': 'medium'
                    }
                ],
                'created_by': user
            }
        )

    def create_industry_analysis(self, user, tenant):
        industry_analysis = IndustryAnalysis.objects.get_or_create(
            industry='Technology',
            sub_industry='SaaS',
            tenant=tenant,
            defaults={
                'market_size': {
                    'current_size': 15000000000,  # $15B
                    'projected_size': 22000000000,  # $22B
                    'growth_rate': 8.5
                },
                'competitors': [
                    {
                        'name': 'Competitor A',
                        'market_share': 25.5,
                        'strengths': ['Strong brand', 'Large customer base'],
                        'weaknesses': ['Slow innovation', 'High prices']
                    }
                ],
                'trends': [
                    'Increasing adoption of AI/ML solutions',
                    'Growing demand for personalized experiences',
                    'Shift towards subscription-based models'
                ],
                'strategic_implications': [
                    {
                        'trend': 'AI/ML adoption',
                        'implication': 'Invest in AI capabilities to stay competitive',
                        'priority': 'high'
                    }
                ],
                'created_by': user
            }
        )

    def create_data_sources(self, tenant):
        sources_data = [
            {
                'name': 'Google Analytics',
                'source_type': 'google_analytics',
                'connection_config': {
                    'property_id': 'GA4_PROPERTY_ID',
                    'view_id': 'VIEW_ID'
                }
            },
            {
                'name': 'Google Search Console',
                'source_type': 'google_search_console',
                'connection_config': {
                    'site_url': 'https://example.com'
                }
            },
            {
                'name': 'Facebook Ads',
                'source_type': 'facebook_ads',
                'connection_config': {
                    'ad_account_id': 'AD_ACCOUNT_ID'
                }
            },
            {
                'name': 'CRM System',
                'source_type': 'crm',
                'connection_config': {
                    'api_endpoint': 'https://api.crm.com',
                    'api_key': 'API_KEY'
                }
            }
        ]

        for source_data in sources_data:
            DataSource.objects.get_or_create(
                name=source_data['name'],
                tenant=tenant,
                defaults={
                    'source_type': source_data['source_type'],
                    'connection_config': source_data['connection_config'],
                    'is_active': True,
                    'sync_frequency': 'daily'
                }
            ) 