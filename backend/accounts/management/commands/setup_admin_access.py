from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from subscription_billing.models import SubscriptionPlan, Customer, Subscription
from core.models import Tenant

User = get_user_model()

class Command(BaseCommand):
    help = 'Ensure admin user has proper access to all features'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='admin@digisolai.ca',
            help='Email of the admin user to set up'
        )

    def handle(self, *args, **options):
        email = options['email']
        
        try:
            # 1) Get or create the user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': 'Admin',
                    'last_name': 'User',
                    'is_staff': True,
                    'is_superuser': True,
                    'is_active': True,
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created user: {email}"))
            else:
                # Ensure user is a superuser
                if not user.is_superuser:
                    user.is_superuser = True
                    user.is_staff = True
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f"Made {email} a superuser"))
                else:
                    self.stdout.write(self.style.SUCCESS(f"User {email} is already a superuser"))
            
            # 2) Get or create tenant for the user
            tenant, created = Tenant.objects.get_or_create(
                name=f"Admin Tenant - {email}",
                defaults={
                    'subdomain': 'admin',
                    'is_active': True,
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created tenant: {tenant.name}"))
            
            # 3) Associate user with tenant if not already associated
            if not user.tenant:
                user.tenant = tenant
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Associated user with tenant"))
            
            # 4) Create or get the Development Free plan
            plan_name = 'Development Free'
            plan, created = SubscriptionPlan.objects.get_or_create(
                name=plan_name,
                defaults={
                    'monthly_cost': 0.00,
                    'annual_cost': 0.00,
                    'description': 'Internal development plan with full access at no cost',
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
                    'client_portals_limit': -1,  # Unlimited
                    'includes_client_billing': True,
                    'includes_client_analytics': True,
                    'includes_white_label_portals': True,
                    'includes_client_support': True,
                    'is_active': True,
                },
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created plan: {plan.name}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Using existing plan: {plan.name}"))
            
            # 5) Ensure a Customer exists for the tenant
            customer, created = Customer.objects.get_or_create(
                tenant=tenant, 
                defaults={}
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created customer for tenant"))
            
            # 6) Create/replace active subscription for the tenant
            now = timezone.now()
            period_start = now
            period_end = now.replace(year=now.year + 10)  # 10-year horizon for dev plan
            
            # If tenant has an active subscription, update it; otherwise create a new one
            subscription, created = Subscription.objects.get_or_create(
                tenant=tenant,
                defaults={
                    'customer': customer,
                    'plan': plan,
                    'status': 'active',
                    'current_period_start': period_start,
                    'current_period_end': period_end,
                    'cancel_at_period_end': False,
                }
            )
            
            if not created:
                # Update existing subscription to ensure it's active and has the right plan
                subscription.plan = plan
                subscription.status = 'active'
                subscription.current_period_start = period_start
                subscription.current_period_end = period_end
                subscription.cancel_at_period_end = False
                subscription.save()
                self.stdout.write(self.style.SUCCESS(f"Updated existing subscription"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Created new subscription"))
            
            # 7) Update tenant's active_subscription reference
            tenant.active_subscription = subscription
            tenant.save()
            self.stdout.write(self.style.SUCCESS(f"Updated tenant's active subscription"))
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ Successfully set up admin access for {email}\n"
                    f"   - User is superuser: {user.is_superuser}\n"
                    f"   - Tenant: {tenant.name}\n"
                    f"   - Plan: {plan.name}\n"
                    f"   - Subscription status: {subscription.status}\n"
                    f"   - All features should now be accessible!"
                )
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error setting up admin access: {str(e)}")
            )
            raise
