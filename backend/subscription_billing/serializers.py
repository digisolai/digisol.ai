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
    plan_name = serializers.SerializerMethodField()
    monthly_cost = serializers.SerializerMethodField()
    annual_cost = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    
    # Feature limits from the plan
    contact_limit = serializers.SerializerMethodField()
    email_send_limit = serializers.SerializerMethodField()
    ai_text_credits_per_month = serializers.SerializerMethodField()
    ai_image_credits_per_month = serializers.SerializerMethodField()
    ai_planning_requests_per_month = serializers.SerializerMethodField()
    user_seats = serializers.SerializerMethodField()
    support_level = serializers.SerializerMethodField()


    # Current usage from the Tenant model
    contacts_used_current_period = serializers.IntegerField(source='contacts_used_current_period', read_only=True)
    emails_sent_current_period = serializers.IntegerField(source='emails_sent_current_period', read_only=True)
    ai_text_credits_used_current_period = serializers.IntegerField(source='ai_text_credits_used_current_period', read_only=True)
    ai_image_credits_used_current_period = serializers.IntegerField(source='ai_image_credits_used_current_period', read_only=True)
    ai_planning_requests_used_current_period = serializers.IntegerField(source='ai_planning_requests_used_current_period', read_only=True)

    # Subscription status
    subscription_status = serializers.SerializerMethodField()
    current_period_end = serializers.SerializerMethodField()
    cancel_at_period_end = serializers.SerializerMethodField()

    # Calculate remaining credits/limits
    remaining_text_credits = serializers.SerializerMethodField()
    remaining_image_credits = serializers.SerializerMethodField()
    remaining_planning_requests = serializers.SerializerMethodField()
    remaining_contacts = serializers.SerializerMethodField()
    remaining_emails = serializers.SerializerMethodField()

    def get_plan_name(self, obj):
        return obj.active_subscription.plan.name if obj.active_subscription and obj.active_subscription.plan else None

    def get_monthly_cost(self, obj):
        return str(obj.active_subscription.plan.monthly_cost) if obj.active_subscription and obj.active_subscription.plan else "0.00"

    def get_annual_cost(self, obj):
        return str(obj.active_subscription.plan.annual_cost) if obj.active_subscription and obj.active_subscription.plan else "0.00"

    def get_description(self, obj):
        return obj.active_subscription.plan.description if obj.active_subscription and obj.active_subscription.plan else "No active subscription"

    def get_contact_limit(self, obj):
        return obj.active_subscription.plan.contact_limit if obj.active_subscription and obj.active_subscription.plan else 0

    def get_email_send_limit(self, obj):
        return obj.active_subscription.plan.email_send_limit if obj.active_subscription and obj.active_subscription.plan else 0

    def get_ai_text_credits_per_month(self, obj):
        return obj.active_subscription.plan.ai_text_credits_per_month if obj.active_subscription and obj.active_subscription.plan else 0

    def get_ai_image_credits_per_month(self, obj):
        return obj.active_subscription.plan.ai_image_credits_per_month if obj.active_subscription and obj.active_subscription.plan else 0

    def get_ai_planning_requests_per_month(self, obj):
        return obj.active_subscription.plan.ai_planning_requests_per_month if obj.active_subscription and obj.active_subscription.plan else 0

    def get_user_seats(self, obj):
        return obj.active_subscription.plan.user_seats if obj.active_subscription and obj.active_subscription.plan else 0

    def get_support_level(self, obj):
        return obj.active_subscription.plan.support_level if obj.active_subscription and obj.active_subscription.plan else "none"



    def get_subscription_status(self, obj):
        return obj.active_subscription.status if obj.active_subscription else "no_subscription"

    def get_current_period_end(self, obj):
        return obj.active_subscription.current_period_end if obj.active_subscription else None

    def get_cancel_at_period_end(self, obj):
        return obj.active_subscription.cancel_at_period_end if obj.active_subscription else False

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