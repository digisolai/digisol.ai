from rest_framework import serializers
from .models import SubscriptionPlan, Customer, Subscription, PaymentTransaction
from core.models import Tenant # For CurrentPlanSerializer context

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'stripe_customer_id']

class SubscriptionSerializer(serializers.ModelSerializer):
    plan_info = SubscriptionPlanSerializer(source='plan', read_only=True)

    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'stripe_subscription_id']

class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class CurrentPlanSerializer(serializers.Serializer):
    # Combines data from Tenant's active_subscription and its plan
    plan_name = serializers.CharField(source='active_subscription.plan.name', read_only=True)
    monthly_cost = serializers.DecimalField(source='active_subscription.plan.monthly_cost', max_digits=10, decimal_places=2, read_only=True)
    annual_cost = serializers.DecimalField(source='active_subscription.plan.annual_cost', max_digits=10, decimal_places=2, read_only=True)
    description = serializers.CharField(source='active_subscription.plan.description', read_only=True)
    
    # Feature limits from the plan
    contact_limit = serializers.IntegerField(source='active_subscription.plan.contact_limit', read_only=True)
    email_send_limit = serializers.IntegerField(source='active_subscription.plan.email_send_limit', read_only=True)
    ai_text_credits_per_month = serializers.IntegerField(source='active_subscription.plan.ai_text_credits_per_month', read_only=True)
    ai_image_credits_per_month = serializers.IntegerField(source='active_subscription.plan.ai_image_credits_per_month', read_only=True)
    ai_planning_requests_per_month = serializers.IntegerField(source='active_subscription.plan.ai_planning_requests_per_month', read_only=True)
    user_seats = serializers.IntegerField(source='active_subscription.plan.user_seats', read_only=True)
    support_level = serializers.CharField(source='active_subscription.plan.support_level', read_only=True)


    # Current usage from the Tenant model
    contacts_used_current_period = serializers.IntegerField(source='contacts_used_current_period', read_only=True)
    emails_sent_current_period = serializers.IntegerField(source='emails_sent_current_period', read_only=True)
    ai_text_credits_used_current_period = serializers.IntegerField(source='ai_text_credits_used_current_period', read_only=True)
    ai_image_credits_used_current_period = serializers.IntegerField(source='ai_image_credits_used_current_period', read_only=True)
    ai_planning_requests_used_current_period = serializers.IntegerField(source='ai_planning_requests_used_current_period', read_only=True)

    # Subscription status
    subscription_status = serializers.CharField(source='active_subscription.status', read_only=True)
    current_period_end = serializers.DateTimeField(source='active_subscription.current_period_end', read_only=True)
    cancel_at_period_end = serializers.BooleanField(source='active_subscription.cancel_at_period_end', read_only=True)

    # Calculate remaining credits/limits
    remaining_text_credits = serializers.SerializerMethodField()
    remaining_image_credits = serializers.SerializerMethodField()
    remaining_planning_requests = serializers.SerializerMethodField()
    remaining_contacts = serializers.SerializerMethodField()
    remaining_emails = serializers.SerializerMethodField()

    def get_remaining_text_credits(self, obj):
        if obj.active_subscription and obj.active_subscription.plan.ai_text_credits_per_month == -1:
            return -1 # Unlimited
        return obj.active_subscription.plan.ai_text_credits_per_month - obj.ai_text_credits_used_current_period if obj.active_subscription else 0

    def get_remaining_image_credits(self, obj):
        if obj.active_subscription and obj.active_subscription.plan.ai_image_credits_per_month == -1:
            return -1 # Unlimited
        return obj.active_subscription.plan.ai_image_credits_per_month - obj.ai_image_credits_used_current_period if obj.active_subscription else 0

    def get_remaining_planning_requests(self, obj):
        if obj.active_subscription and obj.active_subscription.plan.ai_planning_requests_per_month == -1:
            return -1 # Unlimited
        return obj.active_subscription.plan.ai_planning_requests_per_month - obj.ai_planning_requests_used_current_period if obj.active_subscription else 0

    def get_remaining_contacts(self, obj):
        if obj.active_subscription and obj.active_subscription.plan.contact_limit == -1:
            return -1 # Unlimited
        return obj.active_subscription.plan.contact_limit - obj.contacts_used_current_period if obj.active_subscription else 0

    def get_remaining_emails(self, obj):
        if obj.active_subscription and obj.active_subscription.plan.email_send_limit == -1:
            return -1 # Unlimited
        return obj.active_subscription.plan.email_send_limit - obj.emails_sent_current_period if obj.active_subscription else 0

# Additional serializers for enhanced functionality
class SubscriptionPlanDetailSerializer(serializers.ModelSerializer):
    active_subscriptions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'
    
    def get_active_subscriptions_count(self, obj):
        return obj.subscription_set.filter(status='active').count()

class CustomerDetailSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    subscriptions = SubscriptionSerializer(many=True, read_only=True)
    active_subscription = SubscriptionSerializer(read_only=True)
    
    class Meta:
        model = Customer
        fields = '__all__'

class SubscriptionDetailSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    customer = CustomerSerializer(read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    payment_transactions = PaymentTransactionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Subscription
        fields = '__all__'

class PaymentTransactionDetailSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)
    subscription_plan = serializers.CharField(source='subscription.plan.name', read_only=True)
    
    class Meta:
        model = PaymentTransaction
        fields = '__all__' 