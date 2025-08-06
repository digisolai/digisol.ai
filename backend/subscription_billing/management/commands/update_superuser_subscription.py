from django.core.management.base import BaseCommand
from accounts.models import CustomUser
from core.models import Tenant
from subscription_billing.models import SubscriptionPlan, Subscription, Customer
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = 'Updates the superuser tenant to the new Enterprise subscription plan for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='cam.r.brown82@gmail.com',
            help='Email of the superuser to update'
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

        # Get the Enterprise plan
        try:
            enterprise_plan = SubscriptionPlan.objects.get(name='Enterprise')
        except SubscriptionPlan.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('Enterprise subscription plan not found')
            )
            return

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
                'plan': enterprise_plan,
                'status': 'active',
                'current_period_start': timezone.now(),
                'current_period_end': timezone.now() + timedelta(days=30),
                'cancel_at_period_end': False
            }
        )

        if not created:
            # Update existing subscription
            subscription.plan = enterprise_plan
            subscription.status = 'active'
            subscription.current_period_start = timezone.now()
            subscription.current_period_end = timezone.now() + timedelta(days=30)
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

        # Reset token usage for testing
        tenant.tokens_used_current_period = 0
        tenant.tokens_purchased_additional = 0
        tenant.save()

        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {email} to Enterprise plan')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Tenant: {tenant.name}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Plan: {enterprise_plan.name}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Monthly tokens: {enterprise_plan.monthly_tokens:,}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Remaining tokens: {tenant.get_remaining_tokens():,}')
        )
        self.stdout.write(
            self.style.SUCCESS('Subscription period: 30 days from now')
        ) 