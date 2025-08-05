from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from ai_services.models import AIProfile
from core.models import Tenant

User = get_user_model()


class Command(BaseCommand):
    help = 'Set up Promana AI agent for project management'

    def handle(self, *args, **options):
        self.stdout.write('Setting up Promana AI agent...')
        
        # Create global Promana AI agent
        try:
            promana_agent = AIProfile.objects.get(
                name='Promana',
                specialization='project_management'
            )
            created = False
        except AIProfile.DoesNotExist:
            promana_agent = AIProfile.objects.create(
                name='Promana',
                specialization='project_management',
                personality_description='''
                Promana is an intelligent project management AI assistant designed to help project managers, 
                team leads, and individual contributors optimize their project workflows. Promana excels at:
                
                - Proactive risk identification and mitigation
                - Resource optimization and capacity planning
                - Timeline analysis and critical path identification
                - Budget forecasting and cost optimization
                - Team productivity insights and recommendations
                - Automated task scheduling and dependency management
                - Real-time project health monitoring
                - Stakeholder communication and reporting
                
                Promana uses advanced analytics and machine learning to provide actionable insights 
                that help teams deliver projects on time, within budget, and with high quality.
                ''',
                api_model_name='gpt-4',
                is_active=True
            )
            created = True
        except AIProfile.MultipleObjectsReturned:
            # If multiple exist, use the first one
            promana_agent = AIProfile.objects.filter(
                name='Promana',
                specialization='project_management'
            ).first()
            created = False
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('Successfully created Promana AI agent')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Promana AI agent already exists')
            )
        
        # Create project management templates
        self._create_project_templates()
        
        self.stdout.write(
            self.style.SUCCESS('Promana AI setup completed successfully!')
        )
    
    def _create_project_templates(self):
        """Create default project templates."""
        from project_management.models import ProjectTemplate
        
        templates = [
            {
                'name': 'Standard Website Redesign',
                'description': 'Complete website redesign project template with all essential phases',
                'project_type': 'website_redesign',
                'template_data': {
                    'description': 'Complete website redesign project including discovery, design, development, and launch phases.',
                    'tasks': [
                        {
                            'name': 'Project Discovery & Planning',
                            'description': 'Gather requirements, analyze current site, create project plan',
                            'start_date': '2024-01-01',
                            'end_date': '2024-01-07',
                            'estimated_hours': 16,
                            'priority': 'high'
                        },
                        {
                            'name': 'UX/UI Design',
                            'description': 'Create wireframes, mockups, and design system',
                            'start_date': '2024-01-08',
                            'end_date': '2024-01-21',
                            'estimated_hours': 40,
                            'priority': 'high'
                        },
                        {
                            'name': 'Frontend Development',
                            'description': 'Build responsive frontend components and pages',
                            'start_date': '2024-01-22',
                            'end_date': '2024-02-18',
                            'estimated_hours': 80,
                            'priority': 'high'
                        },
                        {
                            'name': 'Backend Development',
                            'description': 'Develop API endpoints and database structure',
                            'start_date': '2024-01-22',
                            'end_date': '2024-02-11',
                            'estimated_hours': 60,
                            'priority': 'high'
                        },
                        {
                            'name': 'Content Migration',
                            'description': 'Migrate and optimize existing content',
                            'start_date': '2024-02-12',
                            'end_date': '2024-02-18',
                            'estimated_hours': 24,
                            'priority': 'medium'
                        },
                        {
                            'name': 'Testing & QA',
                            'description': 'Comprehensive testing across devices and browsers',
                            'start_date': '2024-02-19',
                            'end_date': '2024-02-25',
                            'estimated_hours': 32,
                            'priority': 'high'
                        },
                        {
                            'name': 'Launch Preparation',
                            'description': 'Final preparations for go-live',
                            'start_date': '2024-02-26',
                            'end_date': '2024-02-28',
                            'estimated_hours': 16,
                            'priority': 'high'
                        }
                    ]
                }
            },
            {
                'name': 'Marketing Campaign Launch',
                'description': 'End-to-end marketing campaign project template',
                'project_type': 'marketing_campaign',
                'template_data': {
                    'description': 'Complete marketing campaign including strategy, creative development, and execution.',
                    'tasks': [
                        {
                            'name': 'Campaign Strategy',
                            'description': 'Define target audience, messaging, and campaign goals',
                            'start_date': '2024-01-01',
                            'end_date': '2024-01-05',
                            'estimated_hours': 20,
                            'priority': 'high'
                        },
                        {
                            'name': 'Creative Development',
                            'description': 'Design campaign assets and creative materials',
                            'start_date': '2024-01-06',
                            'end_date': '2024-01-15',
                            'estimated_hours': 40,
                            'priority': 'high'
                        },
                        {
                            'name': 'Content Creation',
                            'description': 'Write copy and create content for all channels',
                            'start_date': '2024-01-06',
                            'end_date': '2024-01-12',
                            'estimated_hours': 32,
                            'priority': 'high'
                        },
                        {
                            'name': 'Channel Setup',
                            'description': 'Configure all marketing channels and platforms',
                            'start_date': '2024-01-16',
                            'end_date': '2024-01-19',
                            'estimated_hours': 24,
                            'priority': 'medium'
                        },
                        {
                            'name': 'Campaign Launch',
                            'description': 'Execute campaign across all channels',
                            'start_date': '2024-01-20',
                            'end_date': '2024-02-20',
                            'estimated_hours': 80,
                            'priority': 'high'
                        },
                        {
                            'name': 'Performance Monitoring',
                            'description': 'Track and analyze campaign performance',
                            'start_date': '2024-01-20',
                            'end_date': '2024-02-20',
                            'estimated_hours': 40,
                            'priority': 'medium'
                        }
                    ]
                }
            },
            {
                'name': 'App Development',
                'description': 'Mobile or web application development project template',
                'project_type': 'app_development',
                'template_data': {
                    'description': 'Complete application development project from concept to deployment.',
                    'tasks': [
                        {
                            'name': 'Requirements Gathering',
                            'description': 'Define app features, user stories, and technical requirements',
                            'start_date': '2024-01-01',
                            'end_date': '2024-01-07',
                            'estimated_hours': 24,
                            'priority': 'high'
                        },
                        {
                            'name': 'UI/UX Design',
                            'description': 'Create app wireframes, mockups, and user experience flows',
                            'start_date': '2024-01-08',
                            'end_date': '2024-01-21',
                            'estimated_hours': 48,
                            'priority': 'high'
                        },
                        {
                            'name': 'Frontend Development',
                            'description': 'Build user interface and client-side functionality',
                            'start_date': '2024-01-22',
                            'end_date': '2024-03-04',
                            'estimated_hours': 120,
                            'priority': 'high'
                        },
                        {
                            'name': 'Backend Development',
                            'description': 'Develop server-side logic, APIs, and database',
                            'start_date': '2024-01-22',
                            'end_date': '2024-02-25',
                            'estimated_hours': 100,
                            'priority': 'high'
                        },
                        {
                            'name': 'Integration Testing',
                            'description': 'Test all app features and integrations',
                            'start_date': '2024-03-05',
                            'end_date': '2024-03-18',
                            'estimated_hours': 56,
                            'priority': 'high'
                        },
                        {
                            'name': 'Deployment & Launch',
                            'description': 'Deploy to production and launch app',
                            'start_date': '2024-03-19',
                            'end_date': '2024-03-21',
                            'estimated_hours': 24,
                            'priority': 'high'
                        }
                    ]
                }
            }
        ]
        
        # Get a default user and tenant for creating templates
        default_user = User.objects.first()
        default_tenant = Tenant.objects.first()
        if not default_user or not default_tenant:
            self.stdout.write(self.style.ERROR('No users or tenants found. Please create them first.'))
            return

        for template_data in templates:
            template, created = ProjectTemplate.objects.get_or_create(
                name=template_data['name'],
                project_type=template_data['project_type'],
                tenant=default_tenant,
                defaults={
                    'description': template_data['description'],
                    'template_data': template_data['template_data'],
                    'is_global': True,
                    'created_by': default_user
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created template: {template.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Template already exists: {template.name}'))