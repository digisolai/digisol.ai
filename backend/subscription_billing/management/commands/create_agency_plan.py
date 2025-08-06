from django.core.management.base import BaseCommand
from subscription_billing.models import SubscriptionPlan


class Command(BaseCommand):
    help = 'Create the Agency subscription plan with client portal features'

    def handle(self, *args, **options):
        # Check if Agency plan already exists
        if SubscriptionPlan.objects.filter(name='Agency').exists():
            self.stdout.write(
                self.style.WARNING('Agency plan already exists. Skipping creation.')
            )
            return

        # Create Agency plan
        agency_plan = SubscriptionPlan.objects.create(
            name='Agency',
            description='Complete client portal management solution for marketing agencies and consultants',
            monthly_cost=299.00,
            annual_cost=2990.00,  # 2 months free with annual billing
            
            # Token-based system
            monthly_tokens=50000,  # 50k tokens per month
            additional_token_pack_size=10000,
            additional_token_pack_cost=25.00,
            
            # Feature limits
            contact_limit=10000,  # 10k contacts
            email_send_limit=50000,  # 50k emails per month
            automation_workflow_limit=50,  # 50 automation workflows
            integration_limit=20,  # 20 social media integrations
            
            # Legacy AI credits (keeping for backward compatibility)
            ai_text_credits_per_month=1000,
            ai_image_credits_per_month=500,
            ai_planning_requests_per_month=100,
            
            # User seats
            user_seats=10,  # 10 team members
            
            # Support level
            support_level='priority',
            
            # Plan features
            includes_design_studio=True,
            includes_advanced_analytics=True,
            includes_project_management=True,
            includes_budgeting=True,
            includes_learning_center=True,
            includes_dedicated_support=True,
            includes_white_label=True,
            includes_custom_integrations=True,
            
            # Agency/Client Portal Features
            includes_client_portals=True,
            client_portals_limit=25,  # Up to 25 client portals
            includes_client_billing=True,
            includes_client_analytics=True,
            includes_white_label_portals=True,
            includes_client_support=True,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created Agency subscription plan with ID: {agency_plan.id}'
            )
        )
        
        # Display plan details
        self.stdout.write('\nAgency Plan Details:')
        self.stdout.write(f'  Name: {agency_plan.name}')
        self.stdout.write(f'  Monthly Cost: ${agency_plan.monthly_cost}')
        self.stdout.write(f'  Annual Cost: ${agency_plan.annual_cost}')
        self.stdout.write(f'  Monthly Tokens: {agency_plan.monthly_tokens:,}')
        self.stdout.write(f'  Contact Limit: {agency_plan.contact_limit:,}')
        self.stdout.write(f'  Email Send Limit: {agency_plan.email_send_limit:,}')
        self.stdout.write(f'  User Seats: {agency_plan.user_seats}')
        self.stdout.write(f'  Client Portals Limit: {agency_plan.client_portals_limit}')
        self.stdout.write(f'  Support Level: {agency_plan.support_level}')
        
        self.stdout.write('\nKey Features:')
        self.stdout.write('  ✓ Client Portal Management')
        self.stdout.write('  ✓ Client Billing & Invoicing')
        self.stdout.write('  ✓ White-label Portals')
        self.stdout.write('  ✓ Client Analytics')
        self.stdout.write('  ✓ Dedicated Support')
        self.stdout.write('  ✓ Custom Integrations')
        self.stdout.write('  ✓ Advanced Analytics')
        self.stdout.write('  ✓ Project Management')
        self.stdout.write('  ✓ Design Studio')
        self.stdout.write('  ✓ Budgeting Tools') 