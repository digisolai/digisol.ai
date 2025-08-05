# backend/subscription_billing/management/commands/clean_old_subscription_plans.py
from django.core.management.base import BaseCommand
from subscription_billing.models import SubscriptionPlan

class Command(BaseCommand):
    help = 'Deletes old or duplicate SubscriptionPlan tiers by name.'

    def handle(self, *args, **options):
        # List the exact names of the old/duplicate plans you want to delete
        old_plan_names_to_delete = [
            'Enterprise Catalyst', # Old name, replaced by 'Elite Strategist'
            'Starter', # Old plan name
            'Professional', # Old plan name
            'Business', # Old plan name
            'Enterprise', # Old plan name
        ]

        self.stdout.write(self.style.WARNING(f'Attempting to delete old plans: {old_plan_names_to_delete}'))

        deleted_count = 0
        for plan_name in old_plan_names_to_delete:
            try:
                plan = SubscriptionPlan.objects.get(name=plan_name)
                plan.delete()
                deleted_count += 1
                self.stdout.write(self.style.SUCCESS(f'Successfully deleted plan: {plan_name}'))
            except SubscriptionPlan.DoesNotExist:
                self.stdout.write(self.style.NOTICE(f'Plan not found (already deleted or name is wrong): {plan_name}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error deleting plan {plan_name}: {e}'))

        self.stdout.write(self.style.SUCCESS(f'Cleanup complete. Deleted {deleted_count} old plans.')) 