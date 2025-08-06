from django.contrib import admin
from .models import SubscriptionPlan, Customer, Subscription, PaymentTransaction

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'monthly_cost', 'annual_cost', 'monthly_tokens', 'is_active', 'created_at')
    list_filter = ('is_active', 'support_level', 'includes_design_studio', 'includes_advanced_analytics')
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')
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
                'includes_design_studio', 'includes_advanced_analytics', 'includes_project_management',
                'includes_budgeting', 'includes_learning_center', 'includes_dedicated_support',
                'includes_white_label', 'includes_custom_integrations'
            )
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'tenant', 'stripe_customer_id', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'tenant__name', 'stripe_customer_id')
    readonly_fields = ('id', 'created_at', 'updated_at')
    raw_id_fields = ('user', 'tenant')

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'plan', 'status', 'current_period_end', 'cancel_at_period_end')
    list_filter = ('status', 'cancel_at_period_end', 'plan', 'created_at')
    search_fields = ('tenant__name', 'plan__name', 'stripe_subscription_id')
    readonly_fields = ('id', 'created_at', 'updated_at')
    raw_id_fields = ('customer', 'plan', 'tenant')
    date_hierarchy = 'created_at'

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'amount', 'currency', 'status', 'transaction_type', 'created_at')
    list_filter = ('status', 'transaction_type', 'currency', 'created_at')
    search_fields = ('tenant__name', 'stripe_charge_id')
    readonly_fields = ('id', 'created_at')
    raw_id_fields = ('tenant', 'customer', 'subscription')
    date_hierarchy = 'created_at'
