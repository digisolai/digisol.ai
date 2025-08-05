from datetime import datetime, timedelta
from django.utils import timezone
from .models import Subscription, Customer, SubscriptionPlan

def get_active_subscription(tenant):
    """
    Get the active subscription for a tenant
    """
    return Subscription.objects.filter(
        tenant=tenant,
        status__in=['active', 'trialing']
    ).first()

def get_subscription_limits(tenant):
    """
    Get the current subscription limits for a tenant
    """
    subscription = get_active_subscription(tenant)
    if not subscription:
        return None
    
    plan = subscription.plan
    return {
        'contact_limit': plan.contact_limit,
        'email_send_limit': plan.email_send_limit,
        'ai_text_credits_per_month': plan.ai_text_credits_per_month,
        'ai_image_credits_per_month': plan.ai_image_credits_per_month,
        'ai_planning_requests_per_month': plan.ai_planning_requests_per_month,
        'user_seats': plan.user_seats,
        'support_level': plan.support_level,

    }

def check_feature_access(tenant, feature_name):
    """
    Check if a tenant has access to a specific feature
    """
    subscription = get_active_subscription(tenant)
    if not subscription:
        return False
    
    plan = subscription.plan
    
    # Check if subscription is active
    if subscription.status not in ['active', 'trialing']:
        return False
    
    # Check if subscription is not canceled
    if subscription.cancel_at_period_end:
        return False
    
    # Feature-specific checks

    
    return True

def get_usage_period_dates(tenant):
    """
    Get the current usage period start and end dates for a tenant
    """
    subscription = get_active_subscription(tenant)
    if not subscription:
        return None
    
    return {
        'period_start': subscription.current_period_start,
        'period_end': subscription.current_period_end,
    }

def is_subscription_expiring_soon(tenant, days_threshold=7):
    """
    Check if a subscription is expiring soon
    """
    subscription = get_active_subscription(tenant)
    if not subscription:
        return False
    
    if subscription.cancel_at_period_end:
        return True
    
    days_until_expiry = (subscription.current_period_end - timezone.now()).days
    return days_until_expiry <= days_threshold

def create_customer_for_user(user, tenant=None):
    """
    Create a customer record for a user
    """
    if not tenant:
        tenant = user.tenant
    
    customer, created = Customer.objects.get_or_create(
        user=user,
        defaults={'tenant': tenant}
    )
    return customer

def get_subscription_summary(tenant):
    """
    Get a summary of the tenant's subscription
    """
    subscription = get_active_subscription(tenant)
    if not subscription:
        return {
            'has_subscription': False,
            'message': 'No active subscription found'
        }
    
    plan = subscription.plan
    days_until_expiry = (subscription.current_period_end - timezone.now()).days
    
    return {
        'has_subscription': True,
        'plan_name': plan.name,
        'plan_cost': float(plan.monthly_cost),
        'status': subscription.status,
        'days_until_expiry': days_until_expiry,
        'cancel_at_period_end': subscription.cancel_at_period_end,
        'limits': get_subscription_limits(tenant),
        'period_dates': get_usage_period_dates(tenant),
    } 