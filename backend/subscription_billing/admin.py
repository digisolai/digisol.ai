from django.contrib import admin
from .models import SubscriptionPlan, Customer, Subscription, PaymentTransaction, UsageTracking

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'monthly_cost', 'annual_cost', 'monthly_tokens', 'support_level')
    list_filter = ('support_level', 'includes_design_studio', 'includes_ai_agents', 'includes_analytics')
    search_fields = ('name', 'description')
    readonly_fields = ('id',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'monthly_cost', 'annual_cost', 'stripe_price_id', 'stripe_annual_price_id')
        }),
        ('Token-Based System', {
            'fields': (
                'monthly_tokens', 'additional_token_pack_size', 'additional_token_pack_cost'
            )
        }),
        ('Feature Limits', {
            'fields': (
                'contact_limit', 'email_send_limit', 'automation_workflow_limit', 'integration_limit',
                'user_seats', 'support_level'
            )
        }),
        ('Legacy AI Credits', {
            'fields': (
                'ai_text_credits_per_month', 'ai_image_credits_per_month', 'ai_planning_requests_per_month'
            ),
            'classes': ('collapse',)
        }),
        ('Plan Features', {
            'fields': (
                'includes_design_studio', 'includes_ai_agents', 'includes_analytics',
                'includes_automations', 'includes_integrations', 'includes_learning_center',
                'includes_project_management', 'includes_team_collaboration', 'includes_white_label'
            )
        })
    )

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'stripe_customer_id', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'stripe_customer_id')
    readonly_fields = ('id', 'created_at', 'updated_at')
    raw_id_fields = ('user',)

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'plan', 'status', 'current_period_end', 'cancel_at_period_end')
    list_filter = ('status', 'cancel_at_period_end', 'plan', 'created_at')
    search_fields = ('user__email', 'plan__name', 'stripe_subscription_id')
    readonly_fields = ('id', 'created_at', 'updated_at')
    raw_id_fields = ('customer', 'plan', 'user')
    date_hierarchy = 'created_at'

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'subscription', 'amount', 'currency', 'status', 'payment_method', 'created_at')
    list_filter = ('status', 'currency', 'created_at')
    search_fields = ('stripe_payment_intent_id', 'subscription__user__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    raw_id_fields = ('subscription',)
    date_hierarchy = 'created_at'

@admin.register(UsageTracking)
class UsageTrackingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'contacts_used_current_period', 'emails_sent_current_period', 'tokens_used_current_period', 'current_period_start')
    list_filter = ('current_period_start', 'created_at')
    search_fields = ('user__email',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    raw_id_fields = ('user',)
    date_hierarchy = 'current_period_start'
