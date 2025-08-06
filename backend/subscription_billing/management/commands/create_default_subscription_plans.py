from django.core.management.base import BaseCommand
from subscription_billing.models import SubscriptionPlan

class Command(BaseCommand):
    help = 'Creates or updates default SubscriptionPlan tiers for DigiSol.AI with the new token-based pricing model.'

    def handle(self, *args, **options):
        plans_data = [
            {
                'name': 'Explorer',
                'monthly_cost': 0.00,
                'annual_cost': 0.00,
                'description': '14-day free trial to explore DigiSol.AI. No credit card required. Perfect for getting started with essential marketing automation tools.',
                'contact_limit': 100,
                'email_send_limit': 1000,
                'monthly_tokens': 500,
                'additional_token_pack_size': 0,  # No additional tokens available in trial
                'additional_token_pack_cost': 0.00,
                'automation_workflow_limit': 1,
                'integration_limit': 1,
                'ai_text_credits_per_month': 100,  # Legacy compatibility
                'ai_image_credits_per_month': 5,
                'ai_planning_requests_per_month': 2,
                'user_seats': 1,
                'support_level': 'standard',
                'includes_design_studio': False,
                'includes_advanced_analytics': False,
                'includes_project_management': False,
                'includes_budgeting': False,
                'includes_learning_center': False,
                'includes_dedicated_support': False,
                'includes_white_label': False,
                'includes_custom_integrations': False,
                'includes_client_portals': False,
                'client_portals_limit': 0,
                'includes_client_billing': False,
                'includes_client_analytics': False,
                'includes_white_label_portals': False,
                'includes_client_support': False,
                'is_active': True,
                'stripe_annual_price_id': None,
            },
            {
                'name': 'Ignite',
                'monthly_cost': 129.00,
                'annual_cost': 1290.00,  # 2 months free
                'description': 'Perfect for startups and small businesses. Full access to Dashboard, Contacts, Campaigns, and basic Automations with Content Creation Agent access.',
                'contact_limit': 3000,
                'email_send_limit': 15000,
                'monthly_tokens': 30000,
                'additional_token_pack_size': 10000,
                'additional_token_pack_cost': 25.00,
                'automation_workflow_limit': 10,
                'integration_limit': 5,
                'ai_text_credits_per_month': 1000,  # Legacy compatibility
                'ai_image_credits_per_month': 20,
                'ai_planning_requests_per_month': 10,
                'user_seats': 3,
                'support_level': 'standard',
                'includes_design_studio': False,
                'includes_advanced_analytics': False,
                'includes_project_management': False,
                'includes_budgeting': False,
                'includes_learning_center': False,
                'includes_dedicated_support': False,
                'includes_white_label': False,
                'includes_custom_integrations': False,
                'includes_client_portals': False,
                'client_portals_limit': 0,
                'includes_client_billing': False,
                'includes_client_analytics': False,
                'includes_white_label_portals': False,
                'includes_client_support': False,
                'is_active': True,
                'stripe_annual_price_id': None,
            },
            {
                'name': 'Growth Accelerator',
                'monthly_cost': 499.00,
                'annual_cost': 4990.00,  # 2 months free
                'description': 'Designed for growing businesses with dedicated marketing teams. Includes advanced analytics, full design studio, project management, and budgeting tools.',
                'contact_limit': 20000,
                'email_send_limit': 50000,
                'monthly_tokens': 150000,
                'additional_token_pack_size': 25000,
                'additional_token_pack_cost': 50.00,
                'automation_workflow_limit': 50,
                'integration_limit': 15,
                'ai_text_credits_per_month': 5000,  # Legacy compatibility
                'ai_image_credits_per_month': 100,
                'ai_planning_requests_per_month': 50,
                'user_seats': 10,
                'support_level': 'priority',
                'includes_design_studio': True,
                'includes_advanced_analytics': True,
                'includes_project_management': True,
                'includes_budgeting': True,
                'includes_learning_center': False,
                'includes_dedicated_support': False,
                'includes_white_label': False,
                'includes_custom_integrations': False,
                'includes_client_portals': False,
                'client_portals_limit': 0,
                'includes_client_billing': False,
                'includes_client_analytics': False,
                'includes_white_label_portals': False,
                'includes_client_support': False,
                'is_active': True,
                'stripe_annual_price_id': None,
            },
            {
                'name': 'Elite Strategist',
                'monthly_cost': 1199.00,
                'annual_cost': 11990.00,  # 2 months free
                'description': 'High-volume marketing teams and digital agencies. Unlimited contacts, campaigns, and automations with full access to all AI agents.',
                'contact_limit': -1,  # Unlimited
                'email_send_limit': -1,  # Unlimited
                'monthly_tokens': 500000,
                'additional_token_pack_size': 100000,
                'additional_token_pack_cost': 150.00,
                'automation_workflow_limit': -1,  # Unlimited
                'integration_limit': -1,  # Unlimited
                'ai_text_credits_per_month': -1,  # Unlimited
                'ai_image_credits_per_month': -1,  # Unlimited
                'ai_planning_requests_per_month': -1,  # Unlimited
                'user_seats': 25,
                'support_level': 'priority',
                'includes_design_studio': True,
                'includes_advanced_analytics': True,
                'includes_project_management': True,
                'includes_budgeting': True,
                'includes_learning_center': True,
                'includes_dedicated_support': False,
                'includes_white_label': False,
                'includes_custom_integrations': False,
                'includes_client_portals': True,
                'client_portals_limit': 10,
                'includes_client_billing': True,
                'includes_client_analytics': True,
                'includes_white_label_portals': False,
                'includes_client_support': False,
                'is_active': True,
                'stripe_annual_price_id': None,
            },
            {
                'name': 'Corporate Core',
                'monthly_cost': 1999.00,
                'annual_cost': 0.00,  # Contact Sales for custom enterprise pricing
                'description': 'Large organizations requiring a full suite of internal and external tools. Includes Corporate Suite with HR management and organizational planning.',
                'contact_limit': -1,  # Unlimited
                'email_send_limit': -1,  # Unlimited
                'monthly_tokens': 1000000,
                'additional_token_pack_size': 100000,
                'additional_token_pack_cost': 0.00,  # Custom pricing
                'automation_workflow_limit': -1,  # Unlimited
                'integration_limit': -1,  # Unlimited
                'ai_text_credits_per_month': -1,  # Unlimited
                'ai_image_credits_per_month': -1,  # Unlimited
                'ai_planning_requests_per_month': -1,  # Unlimited
                'user_seats': 250,
                'support_level': 'priority',
                'includes_design_studio': True,
                'includes_advanced_analytics': True,
                'includes_project_management': True,
                'includes_budgeting': True,
                'includes_learning_center': True,
                'includes_dedicated_support': True,
                'includes_white_label': True,
                'includes_custom_integrations': True,
                'includes_client_portals': True,
                'client_portals_limit': -1,  # Unlimited
                'includes_client_billing': True,
                'includes_client_analytics': True,
                'includes_white_label_portals': True,
                'includes_client_support': True,
                'is_active': True,
                'stripe_annual_price_id': None,
            },
        ]

        created_count = 0
        updated_count = 0

        for plan_data in plans_data:
            plan, created = SubscriptionPlan.objects.get_or_create(
                name=plan_data['name'],
                defaults=plan_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created subscription plan: {plan.name}')
                )
            else:
                # Update existing plan
                for key, value in plan_data.items():
                    setattr(plan, key, value)
                plan.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated subscription plan: {plan.name}')
                )

        self.stdout.write(self.style.SUCCESS('Updated Token-Based Subscription Plans setup complete!'))
        self.stdout.write(self.style.SUCCESS(f'Created: {created_count}, Updated: {updated_count}'))
        
        # Display partnership program information
        self.stdout.write(self.style.SUCCESS('\n=== DigiSol.AI Partnership Program ==='))
        self.stdout.write('Base Partner Fee: $299/month')
        self.stdout.write('Client Pricing:')
        self.stdout.write('  - Ignite Plan Clients: $79/month per client')
        self.stdout.write('  - Growth Accelerator Clients: $299/month per client')
        self.stdout.write('  - Elite Strategist Clients: $799/month per client')
        self.stdout.write('Features: Unified Dashboard, Pooled Resources, Dedicated Support, Co-Branded Reporting') 