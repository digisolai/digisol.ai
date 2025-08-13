import uuid
from django.db import models
from accounts.models import CustomUser

class SubscriptionPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    stripe_price_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    monthly_cost = models.DecimalField(max_digits=10, decimal_places=2)
    annual_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stripe_annual_price_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    
    # Token-Based System
    monthly_tokens = models.IntegerField(default=0, help_text="Number of tokens included per month")
    additional_token_pack_size = models.IntegerField(default=0, help_text="Size of additional token packs")
    additional_token_pack_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Cost of additional token pack")
    
    # Feature Limits/Allocations:
    contact_limit = models.IntegerField(default=0) # -1 for unlimited
    email_send_limit = models.IntegerField(default=0)
    automation_workflow_limit = models.IntegerField(default=0, help_text="Number of active automation workflows allowed")
    integration_limit = models.IntegerField(default=0, help_text="Number of social media integrations allowed")
    
    # Legacy AI Credits (keeping for backward compatibility)
    ai_text_credits_per_month = models.IntegerField(default=0)
    ai_image_credits_per_month = models.IntegerField(default=0)
    ai_planning_requests_per_month = models.IntegerField(default=0)
    
    user_seats = models.IntegerField(default=1)
    support_level = models.CharField(max_length=50, choices=(('standard', 'Standard'), ('priority', 'Priority')), default='standard')
    
    # Plan Features
    includes_design_studio = models.BooleanField(default=True)
    includes_ai_agents = models.BooleanField(default=True)
    includes_analytics = models.BooleanField(default=True)
    includes_automations = models.BooleanField(default=True)
    includes_integrations = models.BooleanField(default=True)
    includes_learning_center = models.BooleanField(default=True)
    includes_project_management = models.BooleanField(default=True)
    includes_team_collaboration = models.BooleanField(default=False)
    includes_white_label = models.BooleanField(default=False)
    
    objects = models.Manager() # Subscription plans are global

    def __str__(self):
        return self.name

class Customer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='subscription_customer')
    stripe_customer_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    def __str__(self):
        return f"Customer for {self.user.email}"

class Subscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='subscription')
    stripe_subscription_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    status = models.CharField(max_length=50, choices=(
        ('active', 'Active'), ('trialing', 'Trialing'), ('past_due', 'Past Due'), 
        ('canceled', 'Canceled'), ('unpaid', 'Unpaid')
    ), default='trialing')
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()
    cancel_at_period_end = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    def __str__(self):
        return f"Subscription for {self.user.email} - Plan: {self.plan.name} - Status: {self.status}"

class PaymentTransaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='transactions')
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=50, choices=(
        ('pending', 'Pending'), ('succeeded', 'Succeeded'), ('failed', 'Failed'), 
        ('canceled', 'Canceled')
    ), default='pending')
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    def __str__(self):
        return f"Payment {self.stripe_payment_intent_id} - {self.amount} {self.currency} - {self.status}"

class UsageTracking(models.Model):
    """Track user usage for billing and limits"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='usage_tracking')
    
    # Current period usage
    contacts_used_current_period = models.IntegerField(default=0)
    emails_sent_current_period = models.IntegerField(default=0)
    tokens_used_current_period = models.IntegerField(default=0)
    
    # Legacy AI Credits
    ai_text_credits_used_current_period = models.IntegerField(default=0)
    ai_image_credits_used_current_period = models.IntegerField(default=0)
    ai_planning_requests_used_current_period = models.IntegerField(default=0)
    
    # Period tracking
    current_period_start = models.DateTimeField(auto_now_add=True)
    current_period_end = models.DateTimeField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    class Meta:
        unique_together = ['user', 'current_period_start']

    def __str__(self):
        return f"Usage for {self.user.email} - Period: {self.current_period_start.date()}"
