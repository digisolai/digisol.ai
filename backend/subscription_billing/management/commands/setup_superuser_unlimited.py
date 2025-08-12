from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import CustomUser
from core.models import Tenant
from subscription_billing.models import SubscriptionPlan, Subscription, Customer
from datetime import timedelta


class Command(BaseCommand):
    help = 'Set up superuser with unlimited access for marketing and demonstration purposes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='cam.r.brown82@gmail.com',
            help='Email of the superuser to set up'
        )

    def handle(self, *args, **options):
        email = options['email']
        
        # Find the superuser
        try:
            user = CustomUser.objects.get(email=email)
            if not user.is_superuser:
                self.stdout.write(
                    self.style.ERROR(f'User {email} is not a superuser')
                )
                return
        except CustomUser.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Superuser with email {email} not found')
            )
            return

        tenant = user.tenant
        if not tenant:
            self.stdout.write(
                self.style.ERROR(f'User {email} has no associated tenant')
            )
            return

        # Create or get the "Unlimited Marketing" plan
        unlimited_plan, created = SubscriptionPlan.objects.get_or_create(
            name='Unlimited Marketing',
            defaults={
                'monthly_cost': 0.00,
                'annual_cost': 0.00,
                'description': 'Unlimited access plan for marketing and demonstration purposes',
                'monthly_tokens': -1,  # Unlimited
                'additional_token_pack_size': 0,
                'additional_token_pack_cost': 0.00,
                'contact_limit': -1,  # Unlimited
                'email_send_limit': -1,  # Unlimited
                'automation_workflow_limit': -1,  # Unlimited
                'integration_limit': -1,  # Unlimited
                'ai_text_credits_per_month': -1,  # Unlimited
                'ai_image_credits_per_month': -1,  # Unlimited
                'ai_planning_requests_per_month': -1,  # Unlimited
                'user_seats': -1,  # Unlimited
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
            }
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created unlimited marketing plan')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Using existing unlimited marketing plan')
            )

        # Get or create customer
        customer, created = Customer.objects.get_or_create(
            user=user,
            defaults={'tenant': tenant}
        )
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created customer for {email}')
            )

        # Update or create subscription
        subscription, created = Subscription.objects.get_or_create(
            tenant=tenant,
            defaults={
                'customer': customer,
                'plan': unlimited_plan,
                'status': 'active',
                'current_period_start': timezone.now(),
                'current_period_end': timezone.now() + timedelta(days=3650),  # 10 years
                'cancel_at_period_end': False
            }
        )

        if not created:
            # Update existing subscription
            subscription.plan = unlimited_plan
            subscription.status = 'active'
            subscription.current_period_start = timezone.now()
            subscription.current_period_end = timezone.now() + timedelta(days=3650)
            subscription.cancel_at_period_end = False
            subscription.save()
            self.stdout.write(
                self.style.WARNING(f'Updated existing subscription for {email}')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Created new subscription for {email}')
            )

        # Update tenant's active subscription
        tenant.active_subscription = subscription
        tenant.save()

        # Reset all usage counters for unlimited access
        tenant.tokens_used_current_period = 0
        tenant.tokens_purchased_additional = 0
        tenant.contacts_used_current_period = 0
        tenant.emails_sent_current_period = 0
        tenant.ai_text_credits_used_current_period = 0
        tenant.ai_image_credits_used_current_period = 0
        tenant.ai_planning_requests_used_current_period = 0
        tenant.save()

        self.stdout.write(
            self.style.SUCCESS(f'✅ Successfully set up {email} with unlimited access')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Tenant: {tenant.name}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Plan: {unlimited_plan.name}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Status: Active (10-year subscription)')
        )
        self.stdout.write(
            self.style.SUCCESS(f'All features: Unlimited access')
        )
