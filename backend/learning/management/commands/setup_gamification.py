from django.core.management.base import BaseCommand
from django.db import transaction
from learning.models import Badge, MarketingResource
from django.utils import timezone


class Command(BaseCommand):
    help = 'Sets up default badges and marketing resources for the gamification system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreation of existing badges and resources',
        )

    def handle(self, *args, **options):
        force = options['force']
        
        with transaction.atomic():
            self.setup_badges(force)
            self.setup_marketing_resources(force)
        
        self.stdout.write(
            self.style.SUCCESS('Successfully set up gamification system!')
        )

    def setup_badges(self, force=False):
        """Set up default badges."""
        self.stdout.write('Setting up default badges...')
        
        badges_data = [
            {
                'name': 'First Steps',
                'description': 'Complete your first tutorial',
                'badge_type': 'tutorial_completion',
                'difficulty': 'bronze',
                'token_reward': 50,
                'requirements': {'tutorials_completed': 1},
                'is_active': True,
            },
            {
                'name': 'Learning Enthusiast',
                'description': 'Complete 5 tutorials',
                'badge_type': 'tutorial_completion',
                'difficulty': 'silver',
                'token_reward': 100,
                'requirements': {'tutorials_completed': 5},
                'is_active': True,
            },
            {
                'name': 'Tutorial Master',
                'description': 'Complete 20 tutorials',
                'badge_type': 'tutorial_completion',
                'difficulty': 'gold',
                'token_reward': 200,
                'requirements': {'tutorials_completed': 20},
                'is_active': True,
            },
            {
                'name': 'Marketing Pro',
                'description': 'Complete 10 marketing resources',
                'badge_type': 'marketing_expertise',
                'difficulty': 'silver',
                'token_reward': 150,
                'requirements': {'resources_completed': 10},
                'is_active': True,
            },
            {
                'name': 'Marketing Expert',
                'description': 'Complete 25 marketing resources',
                'badge_type': 'marketing_expertise',
                'difficulty': 'gold',
                'token_reward': 300,
                'requirements': {'resources_completed': 25},
                'is_active': True,
            },
            {
                'name': 'AI Master',
                'description': 'Interact with AI agents 50 times',
                'badge_type': 'ai_mastery',
                'difficulty': 'gold',
                'token_reward': 250,
                'requirements': {'ai_interactions': 50},
                'is_active': True,
            },
            {
                'name': 'Campaign Creator',
                'description': 'Create 5 successful campaigns',
                'badge_type': 'campaign_success',
                'difficulty': 'silver',
                'token_reward': 150,
                'requirements': {'campaigns_created': 5},
                'is_active': True,
            },
            {
                'name': 'Analytics Guru',
                'description': 'Generate 10 analytics reports',
                'badge_type': 'marketing_expertise',
                'difficulty': 'silver',
                'token_reward': 120,
                'requirements': {'reports_generated': 10},
                'is_active': True,
            },
            {
                'name': 'Early Adopter',
                'description': 'Join DigiSol.AI during the early access period',
                'badge_type': 'early_adopter',
                'difficulty': 'platinum',
                'token_reward': 500,
                'requirements': {'early_access': True},
                'is_active': True,
            },
            {
                'name': 'Power User',
                'description': 'Use all major features of DigiSol.AI',
                'badge_type': 'power_user',
                'difficulty': 'diamond',
                'token_reward': 1000,
                'requirements': {'features_used': ['campaigns', 'analytics', 'ai', 'automation']},
                'is_active': True,
            },
        ]
        
        for badge_data in badges_data:
            badge, created = Badge.objects.get_or_create(
                name=badge_data['name'],
                defaults=badge_data
            )
            
            if created:
                self.stdout.write(f'  Created badge: {badge.name}')
            elif force:
                for key, value in badge_data.items():
                    setattr(badge, key, value)
                badge.save()
                self.stdout.write(f'  Updated badge: {badge.name}')
            else:
                self.stdout.write(f'  Badge already exists: {badge.name}')

    def setup_marketing_resources(self, force=False):
        """Set up default marketing resources."""
        self.stdout.write('Setting up default marketing resources...')
        
        resources_data = [
            {
                'title': 'Digital Marketing Fundamentals',
                'description': 'Learn the basics of digital marketing and how to create effective campaigns',
                'content': '''Digital marketing encompasses all marketing efforts that use electronic devices or the internet. Businesses leverage digital channels such as search engines, social media, email, and other websites to connect with current and prospective customers.

Key concepts covered:
- Understanding your target audience
- Setting SMART marketing goals
- Choosing the right digital channels
- Creating compelling content
- Measuring and optimizing performance

This foundational knowledge will help you build effective marketing strategies for your business.''',
                'resource_type': 'article',
                'category': 'digital_marketing',
                'difficulty_level': 'bronze',
                'estimated_read_time': 10,
                'tags': ['basics', 'digital marketing', 'beginners'],
                'is_featured': True,
                'is_published': True,
            },
            {
                'title': 'Social Media Strategy Guide',
                'description': 'Develop a comprehensive social media strategy for your business',
                'content': '''Social media has become an essential part of modern marketing. A well-crafted social media strategy can help you build brand awareness, engage with your audience, and drive business growth.

This guide covers:
- Platform selection and audience analysis
- Content planning and calendar creation
- Engagement strategies and community building
- Paid advertising on social platforms
- Performance measurement and optimization

Learn how to create a social media presence that resonates with your target audience and drives meaningful results.''',
                'resource_type': 'video',
                'category': 'social_media',
                'difficulty_level': 'silver',
                'estimated_read_time': 15,
                'tags': ['social media', 'strategy', 'intermediate'],
                'is_featured': False,
                'is_published': True,
            },
            {
                'title': 'Email Marketing Best Practices',
                'description': 'Master email marketing to nurture leads and drive conversions',
                'content': '''Email marketing remains one of the most effective digital marketing channels, with an average ROI of $42 for every $1 spent. This comprehensive guide covers everything you need to know about successful email marketing.

Topics include:
- Building and segmenting your email list
- Crafting compelling subject lines and content
- Designing mobile-responsive emails
- A/B testing and optimization
- Compliance with email regulations
- Automation and drip campaigns

Discover how to create email campaigns that convert and build lasting customer relationships.''',
                'resource_type': 'article',
                'category': 'email_marketing',
                'difficulty_level': 'silver',
                'estimated_read_time': 12,
                'tags': ['email marketing', 'automation', 'conversion'],
                'is_featured': True,
                'is_published': True,
            },
            {
                'title': 'SEO Fundamentals for Business Growth',
                'description': 'Learn search engine optimization to improve your online visibility',
                'content': '''Search Engine Optimization (SEO) is crucial for improving your website's visibility in search results. This guide covers the fundamentals of SEO and how to implement effective strategies.

Key areas covered:
- Keyword research and optimization
- On-page SEO techniques
- Technical SEO fundamentals
- Link building strategies
- Local SEO for businesses
- SEO analytics and reporting

Master the basics of SEO to drive organic traffic and improve your search rankings.''',
                'resource_type': 'article',
                'category': 'seo',
                'difficulty_level': 'silver',
                'estimated_read_time': 18,
                'tags': ['seo', 'search engines', 'organic traffic'],
                'is_featured': False,
                'is_published': True,
            },
            {
                'title': 'Content Marketing Strategy',
                'description': 'Develop a content marketing strategy that attracts and engages your audience',
                'content': '''Content marketing is about creating and distributing valuable, relevant content to attract and engage a clearly defined audience. This guide helps you develop a comprehensive content marketing strategy.

Learn about:
- Content planning and editorial calendars
- Different types of content (blogs, videos, infographics)
- Content distribution channels
- SEO integration for content
- Measuring content performance
- Content repurposing strategies

Create content that not only attracts your target audience but also drives them toward conversion.''',
                'resource_type': 'article',
                'category': 'content_marketing',
                'difficulty_level': 'silver',
                'estimated_read_time': 14,
                'tags': ['content marketing', 'strategy', 'engagement'],
                'is_featured': False,
                'is_published': True,
            },
            {
                'title': 'Marketing Analytics and Reporting',
                'description': 'Understand how to measure and analyze your marketing performance',
                'content': '''Data-driven marketing is essential for making informed decisions and optimizing your campaigns. This guide covers the fundamentals of marketing analytics and reporting.

Topics include:
- Key performance indicators (KPIs)
- Setting up tracking and measurement
- Understanding customer journey analytics
- A/B testing and experimentation
- Creating actionable reports
- Using data to optimize campaigns

Learn how to turn data into insights and use analytics to improve your marketing ROI.''',
                'resource_type': 'video',
                'category': 'analytics',
                'difficulty_level': 'gold',
                'estimated_read_time': 20,
                'tags': ['analytics', 'reporting', 'data', 'advanced'],
                'is_featured': True,
                'is_published': True,
            },
            {
                'title': 'Marketing Automation Fundamentals',
                'description': 'Learn how to automate your marketing processes for better efficiency',
                'content': '''Marketing automation can significantly improve your efficiency and effectiveness. This guide covers the fundamentals of marketing automation and how to implement it in your business.

Key concepts:
- Understanding marketing automation workflows
- Lead scoring and nurturing
- Email automation sequences
- Social media automation
- CRM integration
- Measuring automation ROI

Discover how automation can help you scale your marketing efforts and provide better customer experiences.''',
                'resource_type': 'article',
                'category': 'automation',
                'difficulty_level': 'gold',
                'estimated_read_time': 16,
                'tags': ['automation', 'workflows', 'efficiency'],
                'is_featured': False,
                'is_published': True,
            },
            {
                'title': 'Brand Strategy and Identity',
                'description': 'Develop a strong brand strategy that differentiates your business',
                'content': '''Your brand is more than just your logo - it's the complete experience your customers have with your business. This guide helps you develop a comprehensive brand strategy.

Learn about:
- Brand positioning and differentiation
- Visual identity and design principles
- Brand voice and messaging
- Brand guidelines and consistency
- Brand monitoring and reputation management
- Rebranding strategies

Create a brand that resonates with your audience and builds lasting customer loyalty.''',
                'resource_type': 'article',
                'category': 'branding',
                'difficulty_level': 'silver',
                'estimated_read_time': 13,
                'tags': ['branding', 'identity', 'positioning'],
                'is_featured': False,
                'is_published': True,
            },
        ]
        
        for resource_data in resources_data:
            resource, created = MarketingResource.objects.get_or_create(
                title=resource_data['title'],
                defaults=resource_data
            )
            
            if created:
                self.stdout.write(f'  Created resource: {resource.title}')
            elif force:
                for key, value in resource_data.items():
                    setattr(resource, key, value)
                resource.save()
                self.stdout.write(f'  Updated resource: {resource.title}')
            else:
                self.stdout.write(f'  Resource already exists: {resource.title}') 