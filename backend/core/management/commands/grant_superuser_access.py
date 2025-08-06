from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import CustomUser, Tenant
from subscription_billing.models import SubscriptionPlan, Subscription, Customer
from datetime import timedelta

class Command(BaseCommand):
    help = 'Grant unlimited access to superuser for testing purposes'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Superuser email address')

    def handle(self, *args, **options):
        email = options['email'] or 'cam.r.brown82@gmail.com'
        
        try:
            # Get the superuser
            user = CustomUser.objects.get(email=email, is_superuser=True)
            tenant = user.tenant
            
            self.stdout.write(f"Found superuser: {user.email}")
            self.stdout.write(f"Tenant: {tenant.name}")
            
            # Create or get an unlimited plan
            unlimited_plan, created = SubscriptionPlan.objects.get_or_create(
                name="Unlimited Testing Plan",
                defaults={
                    'monthly_cost': 0.00,
                    'annual_cost': 0.00,
                    'monthly_tokens': -1,  # Unlimited
                    'contact_limit': -1,  # Unlimited
                    'email_send_limit': -1,  # Unlimited
                    'automation_workflow_limit': -1,  # Unlimited
                    'integration_limit': -1,  # Unlimited
                    'ai_text_credits_per_month': -1,  # Unlimited
                    'ai_image_credits_per_month': -1,  # Unlimited
                    'ai_planning_requests_per_month': -1,  # Unlimited
                    'user_seats': -1,  # Unlimited
                    'includes_design_studio': True,
                    'includes_advanced_analytics': True,
                    'includes_project_management': True,
                    'includes_budgeting': True,
                    'includes_learning_center': True,
                    'includes_dedicated_support': True,
                    'includes_white_label': True,
                    'includes_custom_integrations': True,
                    'includes_client_portals': True,  # Enable client portals
                    'client_portals_limit': -1,  # Unlimited client portals
                    'includes_client_billing': True,
                    'includes_client_analytics': True,
                    'includes_white_label_portals': True,
                    'includes_client_support': True,
                    'is_active': True,
                }
            )
            
            if created:
                self.stdout.write("Created unlimited testing plan")
            else:
                self.stdout.write("Using existing unlimited testing plan")
            
            # Create or get customer
            customer, created = Customer.objects.get_or_create(
                user=user,
                defaults={
                    'tenant': tenant,
                }
            )
            
            if created:
                self.stdout.write("Created customer record")
            else:
                self.stdout.write("Using existing customer record")
            
            # Create or update subscription
            subscription, created = Subscription.objects.get_or_create(
                customer=customer,
                defaults={
                    'plan': unlimited_plan,
                    'tenant': tenant,
                    'status': 'active',
                    'current_period_start': timezone.now(),
                    'current_period_end': timezone.now() + timedelta(days=365),  # 1 year
                    'cancel_at_period_end': False,
                }
            )
            
            if not created:
                # Update existing subscription to unlimited plan
                subscription.plan = unlimited_plan
                subscription.status = 'active'
                subscription.current_period_end = timezone.now() + timedelta(days=365)
                subscription.cancel_at_period_end = False
                subscription.save()
                self.stdout.write("Updated existing subscription to unlimited plan")
            else:
                self.stdout.write("Created new unlimited subscription")
            
            # Update tenant to have unlimited tokens
            tenant.tokens_used_current_period = 0
            tenant.tokens_purchased_additional = 0
            tenant.ai_text_credits_used_current_period = 0
            tenant.ai_image_credits_used_current_period = 0
            tenant.ai_planning_requests_used_current_period = 0
            tenant.save()
            
            self.stdout.write("Reset tenant token usage to 0")
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully granted unlimited access to {user.email}'
                )
            )
            
            # Display current access
            self.stdout.write("\nCurrent Access Summary:")
            self.stdout.write(f"- Tokens: Unlimited ({tenant.get_remaining_tokens()} remaining)")
            self.stdout.write(f"- AI Text Credits: Unlimited ({tenant.get_remaining_ai_text_credits()} remaining)")
            self.stdout.write(f"- AI Image Credits: Unlimited ({tenant.get_remaining_ai_image_credits()} remaining)")
            self.stdout.write(f"- Client Portals: Enabled (Unlimited)")
            self.stdout.write(f"- All Features: Enabled")
            
        except CustomUser.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Superuser with email {email} not found')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error: {str(e)}')
            ) 