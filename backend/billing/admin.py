from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count
from .models import SubscriptionPlan, Customer, Subscription, PaymentTransaction

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'monthly_cost', 'is_active', 'active_subscriptions_count', 'created_at')
    list_filter = ('is_active', 'support_level', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at', 'active_subscriptions_count')
    list_editable = ('is_active', 'monthly_cost')
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'monthly_cost', 'stripe_price_id')
        }),
        ('Feature Limits', {
            'fields': (
                'contact_limit', 'email_send_limit', 'ai_text_credits_per_month',
                'ai_image_credits_per_month', 'ai_planning_requests_per_month',
                'user_seats', 'support_level'
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
    
    def active_subscriptions_count(self, obj):
        count = obj.subscription_set.filter(status='active').count()
        return format_html('<span style="color: green;">{}</span>', count)
    active_subscriptions_count.short_description = 'Active Subscriptions'

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'tenant', 'stripe_customer_id', 'subscription_status', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'tenant__name', 'stripe_customer_id')
    readonly_fields = ('id', 'created_at', 'updated_at', 'subscription_status')
    raw_id_fields = ('user', 'tenant')
    
    def subscription_status(self, obj):
        active_sub = obj.subscription_set.filter(status='active').first()
        if active_sub:
            return format_html('<span style="color: green;">Active - {}</span>', active_sub.plan.name)
        elif obj.subscription_set.exists():
            latest_sub = obj.subscription_set.order_by('-created_at').first()
            return format_html('<span style="color: orange;">{}</span>', latest_sub.status)
        else:
            return format_html('<span style="color: red;">No Subscription</span>')
    subscription_status.short_description = 'Subscription Status'

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'plan', 'status', 'current_period_end', 'cancel_at_period_end', 'amount_display')
    list_filter = ('status', 'cancel_at_period_end', 'plan', 'created_at', 'current_period_end')
    search_fields = ('tenant__name', 'plan__name', 'stripe_subscription_id')
    readonly_fields = ('id', 'created_at', 'updated_at', 'amount_display')
    raw_id_fields = ('customer', 'plan', 'tenant')
    list_editable = ('status', 'cancel_at_period_end')
    date_hierarchy = 'created_at'
    actions = ['cancel_subscriptions', 'reactivate_subscriptions']
    
    def amount_display(self, obj):
        return f"${obj.plan.monthly_cost}"
    amount_display.short_description = 'Monthly Amount'
    
    def cancel_subscriptions(self, request, queryset):
        updated = queryset.update(cancel_at_period_end=True)
        self.message_user(request, f'{updated} subscription(s) marked for cancellation at period end.')
    cancel_subscriptions.short_description = "Mark selected subscriptions for cancellation"
    
    def reactivate_subscriptions(self, request, queryset):
        updated = queryset.update(cancel_at_period_end=False)
        self.message_user(request, f'{updated} subscription(s) reactivated.')
    reactivate_subscriptions.short_description = "Reactivate selected subscriptions"

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'amount_display', 'currency', 'status', 'transaction_type', 'created_at')
    list_filter = ('status', 'transaction_type', 'currency', 'created_at')
    search_fields = ('tenant__name', 'stripe_charge_id')
    readonly_fields = ('id', 'created_at', 'amount_display')
    raw_id_fields = ('tenant', 'customer', 'subscription')
    list_editable = ('status',)
    date_hierarchy = 'created_at'
    actions = ['mark_as_succeeded', 'mark_as_failed']
    
    def amount_display(self, obj):
        color = 'green' if obj.status == 'succeeded' else 'orange' if obj.status == 'pending' else 'red'
        return format_html('<span style="color: {};">${}</span>', color, obj.amount)
    amount_display.short_description = 'Amount'
    
    def mark_as_succeeded(self, request, queryset):
        updated = queryset.update(status='succeeded')
        self.message_user(request, f'{updated} transaction(s) marked as succeeded.')
    mark_as_succeeded.short_description = "Mark selected transactions as succeeded"
    
    def mark_as_failed(self, request, queryset):
        updated = queryset.update(status='failed')
        self.message_user(request, f'{updated} transaction(s) marked as failed.')
    mark_as_failed.short_description = "Mark selected transactions as failed"
