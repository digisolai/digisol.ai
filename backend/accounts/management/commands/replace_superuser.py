from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

from accounts.models import CustomUser
from core.models import Tenant
from subscription_billing.models import SubscriptionPlan, Customer, Subscription


class Command(BaseCommand):
    help = (
        "Deactivate existing superusers, create a new superuser, and assign a Development Free plan "
        "with full access to the new user's tenant."
    )

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, required=True, help='Email address for the new superuser')
        parser.add_argument('--password', type=str, required=True, help='Password for the new superuser')
        parser.add_argument('--first-name', type=str, default='Dev', help='First name for the new superuser')
        parser.add_argument('--last-name', type=str, default='Admin', help='Last name for the new superuser')
        parser.add_argument(
            '--deactivate-existing',
            action='store_true',
            default=True,
            help='Deactivate existing superusers (default: true)'
        )

    def handle(self, *args, **options):
        email: str = options['email']
        password: str = options['password']
        first_name: str = options['first_name']
        last_name: str = options['last_name']
        deactivate_existing: bool = options['deactivate_existing']

        self.stdout.write(self.style.WARNING('Starting superuser replacement process...'))

        # 1) Deactivate existing superusers (except the one we're about to create)
        if deactivate_existing:
            existing_supers = CustomUser.objects.filter(is_superuser=True).exclude(email=email)
            if existing_supers.exists():
                for u in existing_supers:
                    u.is_active = False
                    u.is_superuser = False
                    u.is_staff = False
                    u.save(update_fields=['is_active', 'is_superuser', 'is_staff'])
                self.stdout.write(self.style.SUCCESS(f"Deactivated {existing_supers.count()} existing superuser(s)."))
            else:
                self.stdout.write('No other superusers found to deactivate.')

        # 2) Get or create the tenant for the new superuser
        tenant_name = 'Development Tenant'
        tenant_subdomain = 'dev-free'
        tenant, _ = Tenant.objects.get_or_create(
            name=tenant_name,
            defaults={
                'subdomain': tenant_subdomain,
                'is_active': True,
            },
        )
        if not tenant.subdomain:
            tenant.subdomain = tenant_subdomain
            tenant.is_active = True
            tenant.save(update_fields=['subdomain', 'is_active'])
        self.stdout.write(self.style.SUCCESS(f"Using tenant: {tenant.name} (subdomain: {tenant.subdomain})"))

        # 3) Create or update the new superuser
        User = get_user_model()
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'username': email,  # ensure username is set for AbstractUser lineage
            },
        )
        if created:
            user.set_password(password)
        else:
            user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
        user.tenant = tenant
        # Tenant admin role for app-level permissions
        user.is_tenant_admin = True
        user.role = 'tenant_admin'
        user.save()
        self.stdout.write(self.style.SUCCESS(f"Superuser ready: {user.email}"))

        # 4) Ensure a Development Free plan exists with full access
        plan_name = 'Development Free'
        plan, _ = SubscriptionPlan.objects.get_or_create(
            name=plan_name,
            defaults={
                'monthly_cost': 0.00,
                'annual_cost': 0.00,
                'description': 'Internal development plan with full access at no cost',
                'monthly_tokens': -1,
                'additional_token_pack_size': 0,
                'additional_token_pack_cost': 0.00,
                'contact_limit': -1,
                'email_send_limit': -1,
                'automation_workflow_limit': -1,
                'integration_limit': -1,
                'ai_text_credits_per_month': -1,
                'ai_image_credits_per_month': -1,
                'ai_planning_requests_per_month': -1,
                'user_seats': 99,
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
                'client_portals_limit': -1,
                'includes_client_billing': True,
                'includes_client_analytics': True,
                'includes_white_label_portals': True,
                'includes_client_support': True,
                'is_active': True,
            },
        )
        self.stdout.write(self.style.SUCCESS(f"Using plan: {plan.name}"))

        # 5) Ensure a Customer exists for the tenant
        customer, _ = Customer.objects.get_or_create(tenant=tenant, defaults={})

        # 6) Create/replace active subscription for the tenant
        now = timezone.now()
        period_start = now
        period_end = now.replace(year=now.year + 10)  # 10-year horizon for dev plan

        # If tenant has an active subscription, update it; otherwise create a new one
        subscription = tenant.active_subscription
        if subscription:
            subscription.plan = plan
            subscription.customer = customer
            subscription.status = 'active'
            subscription.current_period_start = period_start
            subscription.current_period_end = period_end
            subscription.cancel_at_period_end = False
            subscription.save()
        else:
            subscription = Subscription.objects.create(
                customer=customer,
                plan=plan,
                tenant=tenant,
                status='active',
                current_period_start=period_start,
                current_period_end=period_end,
                cancel_at_period_end=False,
            )
            tenant.active_subscription = subscription
            tenant.save(update_fields=['active_subscription'])

        self.stdout.write(self.style.SUCCESS(
            f"Assigned plan '{plan.name}' to tenant '{tenant.name}'. Subscription status: {subscription.status}"
        ))

        self.stdout.write(self.style.SUCCESS('All done. New superuser in place with Development Free plan and full access.'))


