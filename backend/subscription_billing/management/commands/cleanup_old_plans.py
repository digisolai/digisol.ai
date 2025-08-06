from django.core.management.base import BaseCommand
from subscription_billing.models import SubscriptionPlan, Subscription
from django.db import transaction


class Command(BaseCommand):
    help = 'Safely cleans up old subscription plans by updating existing subscriptions first'

    def handle(self, *args, **options):
        # List of old plans to remove
        old_plans = [
            'Ignite',
            'Growth Accelerator', 
            'Elite Strategist',
            'Corporate Core'
        ]
        
        # List of new plans to keep
        new_plans = [
            'Explorer',
            'Startup',
            'Growth',
            'Enterprise'
        ]
        
        # Mapping of old plans to new plans (for migration)
        plan_mapping = {
            'Ignite': 'Startup',
            'Growth Accelerator': 'Growth',
            'Elite Strategist': 'Enterprise',
            'Corporate Core': 'Enterprise'
        }
        
        removed_count = 0
        kept_count = 0
        migrated_count = 0
        
        with transaction.atomic():
            # First, migrate existing subscriptions to new plans
            for old_plan_name, new_plan_name in plan_mapping.items():
                try:
                    old_plan = SubscriptionPlan.objects.get(name=old_plan_name)
                    new_plan = SubscriptionPlan.objects.get(name=new_plan_name)
                    
                    # Update all subscriptions using the old plan
                    subscriptions = Subscription.objects.filter(plan=old_plan)
                    for subscription in subscriptions:
                        subscription.plan = new_plan
                        subscription.save()
                        migrated_count += 1
                        self.stdout.write(
                            self.style.WARNING(f'Migrated subscription for {subscription.tenant.name} from {old_plan_name} to {new_plan_name}')
                        )
                    
                    # Now safe to delete the old plan
                    old_plan.delete()
                    removed_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Removed old plan: {old_plan_name} (migrated {subscriptions.count()} subscriptions)')
                    )
                    
                except SubscriptionPlan.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'Old plan not found: {old_plan_name}')
                    )
        
        # Verify new plans exist
        for plan_name in new_plans:
            try:
                plan = SubscriptionPlan.objects.get(name=plan_name)
                kept_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Kept new plan: {plan_name} ({plan.monthly_tokens:,} tokens)')
                )
            except SubscriptionPlan.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'New plan missing: {plan_name}')
                )
        
        # Show final count
        total_plans = SubscriptionPlan.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'\nCleanup complete!')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Migrated: {migrated_count} subscriptions')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Removed: {removed_count} old plans')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Kept: {kept_count} new plans')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Total plans in database: {total_plans}')
        ) 