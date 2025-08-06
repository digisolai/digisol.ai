import uuid
from django.db import models
from core.models import CustomUser, Tenant, TenantAwareManager # Import CustomUser, Tenant, and TenantAwareManager

class SubscriptionPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    stripe_price_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    monthly_cost = models.DecimalField(max_digits=10, decimal_places=2)
    annual_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stripe_annual_price_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    
    # New Token-Based System
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
    includes_design_studio = models.BooleanField(default=False, help_text="Access to full design studio features")
    includes_advanced_analytics = models.BooleanField(default=False, help_text="Access to advanced analytics and predictive insights")
    includes_project_management = models.BooleanField(default=False, help_text="Access to project management tools")
    includes_budgeting = models.BooleanField(default=False, help_text="Access to budgeting and financial tools")
    includes_learning_center = models.BooleanField(default=False, help_text="Access to personalized learning paths")
    includes_dedicated_support = models.BooleanField(default=False, help_text="Dedicated account manager and priority support")
    includes_white_label = models.BooleanField(default=False, help_text="White-label solutions available")
    includes_custom_integrations = models.BooleanField(default=False, help_text="Custom API development and integration support")
    
    # Agency/Client Portal Features
    includes_client_portals = models.BooleanField(default=False, help_text="Access to client portal management features")
    client_portals_limit = models.IntegerField(default=0, help_text="Number of client portals allowed")
    includes_client_billing = models.BooleanField(default=False, help_text="Access to client billing and invoicing")
    includes_client_analytics = models.BooleanField(default=False, help_text="Access to client-specific analytics")
    includes_white_label_portals = models.BooleanField(default=False, help_text="White-label client portals with custom branding")
    includes_client_support = models.BooleanField(default=False, help_text="Dedicated support for client portal management")

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = models.Manager() # Subscription plans are global

    def __str__(self):
        return self.name

class Customer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(CustomUser, on_delete=models.SET_NULL, related_name='subscription_billing_customer', null=True, blank=True)
    tenant = models.OneToOneField(Tenant, on_delete=models.SET_NULL, related_name='subscription_billing_customer_tenant', null=True, blank=True)
    stripe_customer_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager() # Not tenant-filtered, as it links to a specific user/tenant but is global for Stripe customer management

    def __str__(self):
        return f"Customer for {self.tenant.name if self.tenant else 'N/A'}"

class Subscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT) # Protect from deleting plans if active subscriptions exist
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='subscription_billing_subscriptions') # Direct link for multi-tenancy
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

    objects = TenantAwareManager() # Subscriptions are tenant-specific

    def __str__(self):
        return f"Subscription for {self.tenant.name} - Plan: {self.plan.name} - Status: {self.status}"

class PaymentTransaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='subscription_billing_payment_transactions')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True)
    stripe_charge_id = models.CharField(max_length=255, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='usd')
    status = models.CharField(max_length=50, choices=(
        ('succeeded', 'Succeeded'), ('pending', 'Pending'), ('failed', 'Failed')
    ), default='pending')
    transaction_type = models.CharField(max_length=50, choices=(
        ('subscription', 'Subscription'), ('credits_purchase', 'Credits Purchase'), ('other', 'Other')
    ), default='subscription')
    created_at = models.DateTimeField(auto_now_add=True)

    objects = TenantAwareManager()

    def __str__(self):
        return f"Payment {self.id} for {self.tenant.name} - Amount: {self.amount} - Status: {self.status}"
