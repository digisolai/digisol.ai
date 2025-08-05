from django.core.management.base import BaseCommand
from subscription_billing.models import SubscriptionPlan

class Command(BaseCommand):
    help = 'Creates or updates default SubscriptionPlan tiers for DigiSol.AI.'

    def handle(self, *args, **options):
        plans_data = [
            {
                'name': 'Ignite',
                'monthly_cost': 99.00,
                'annual_cost': 950.40,  # 99 * 12 * 0.80 (20% discount)
                'description': 'Get started with essential marketing automation tools and foundational AI assistance.',
                'contact_limit': 2500,
                'email_send_limit': 10000,
                'ai_text_credits_per_month': 500,
                'ai_image_credits_per_month': 10,
                'ai_planning_requests_per_month': 5,
                'user_seats': 3,
                'support_level': 'standard',
                'is_active': True,
                'stripe_annual_price_id': None,
            },
            {
                'name': 'Growth Accelerator',
                'monthly_cost': 399.00,
                'annual_cost': 3830.40,  # 399 * 12 * 0.80 (20% discount)
                'description': 'Drive significant growth with expanded automation, powerful AI tools, and comprehensive analytics.',
                'contact_limit': 10000,
                'email_send_limit': 50000,
                'ai_text_credits_per_month': 5000,
                'ai_image_credits_per_month': 50,
                'ai_planning_requests_per_month': 25,
                'user_seats': 10,
                'support_level': 'priority',
                'is_active': True,
                'stripe_annual_price_id': None,
            },
            {
                'name': 'Elite Strategist', # Renamed from Enterprise Catalyst
                'monthly_cost': 999.00,
                'annual_cost': 9590.40,  # 999 * 12 * 0.80 (20% discount)
                'description': 'Unleash unlimited marketing potential with the full suite of AI-powered tools and dedicated support.',
                'contact_limit': -1, # Unlimited
                'email_send_limit': -1, # Unlimited
                'ai_text_credits_per_month': -1, # Unlimited
                'ai_image_credits_per_month': -1, # Unlimited
                'ai_planning_requests_per_month': -1, # Unlimited
                'user_seats': 50,
                'support_level': 'priority',
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

        self.stdout.write(self.style.SUCCESS('Default Subscription Plans setup complete!')) 