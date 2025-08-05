from django.contrib import admin
from .models import (
    IntegrationProvider, Integration, DataFlow, WorkflowAutomation,
    IntegrationHealthLog, ConnectusInsight
)


@admin.register(IntegrationProvider)
class IntegrationProviderAdmin(admin.ModelAdmin):
    """Admin configuration for IntegrationProvider model."""
    list_display = ['display_name', 'category', 'auth_type', 'webhook_support', 'is_active']
    list_filter = ['category', 'auth_type', 'webhook_support', 'is_active', 'created_at']
    search_fields = ['name', 'display_name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'display_name', 'category', 'description', 'logo_url')
        }),
        ('Authentication', {
            'fields': ('auth_type', 'oauth_config'),
            'classes': ('collapse',)
        }),
        ('API Configuration', {
            'fields': ('api_endpoints', 'rate_limits', 'webhook_support', 'webhook_events'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Integration)
class IntegrationAdmin(admin.ModelAdmin):
    """Admin configuration for the Integration model."""
    list_display = ['name', 'provider', 'tenant', 'status', 'health_score', 'is_active', 'created_at']
    list_filter = ['status', 'is_active', 'created_at', 'tenant', 'provider__category']
    search_fields = ['name', 'provider__display_name', 'tenant__name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_sync', 'api_calls_today', 'data_synced_today']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'tenant', 'provider', 'name', 'status', 'is_active')
        }),
        ('Authentication', {
            'fields': ('auth_credentials', 'auth_expires_at'),
            'classes': ('collapse',)
        }),
        ('Configuration', {
            'fields': ('settings', 'data_mappings', 'sync_config'),
            'classes': ('collapse',)
        }),
        ('Health Monitoring', {
            'fields': ('last_sync', 'last_sync_status', 'sync_error_count', 'health_score'),
            'classes': ('collapse',)
        }),
        ('Usage Tracking', {
            'fields': ('api_calls_today', 'api_calls_limit', 'data_synced_today'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Show all integrations in admin (not filtered by tenant)."""
        return Integration.objects.all_tenants()


@admin.register(DataFlow)
class DataFlowAdmin(admin.ModelAdmin):
    """Admin configuration for DataFlow model."""
    list_display = ['name', 'integration', 'direction', 'status', 'sync_frequency', 'records_processed']
    list_filter = ['direction', 'status', 'sync_frequency', 'created_at']
    search_fields = ['name', 'integration__name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_sync', 'next_sync']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'integration', 'name', 'description', 'direction', 'status')
        }),
        ('Data Mapping', {
            'fields': ('source_fields', 'target_fields', 'transformation_rules'),
            'classes': ('collapse',)
        }),
        ('Sync Configuration', {
            'fields': ('sync_frequency', 'last_sync', 'next_sync'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('records_processed', 'records_failed', 'last_error'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(WorkflowAutomation)
class WorkflowAutomationAdmin(admin.ModelAdmin):
    """Admin configuration for WorkflowAutomation model."""
    list_display = ['name', 'integration', 'trigger_type', 'status', 'execution_count', 'success_count']
    list_filter = ['trigger_type', 'status', 'created_at']
    search_fields = ['name', 'integration__name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_executed']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'integration', 'name', 'description', 'trigger_type', 'status')
        }),
        ('Configuration', {
            'fields': ('trigger_config', 'actions', 'conditions'),
            'classes': ('collapse',)
        }),
        ('Execution Tracking', {
            'fields': ('last_executed', 'execution_count', 'success_count', 'failure_count', 'last_error'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(IntegrationHealthLog)
class IntegrationHealthLogAdmin(admin.ModelAdmin):
    """Admin configuration for IntegrationHealthLog model."""
    list_display = ['integration', 'event_type', 'severity', 'timestamp', 'resolved_at']
    list_filter = ['event_type', 'severity', 'timestamp', 'resolved_at']
    search_fields = ['message', 'integration__name']
    readonly_fields = ['id', 'timestamp']
    
    fieldsets = (
        ('Event Information', {
            'fields': ('id', 'integration', 'event_type', 'severity', 'message', 'details')
        }),
        ('Resolution', {
            'fields': ('resolved_at', 'resolved_by'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('timestamp',),
            'classes': ('collapse',)
        }),
    )


@admin.register(ConnectusInsight)
class ConnectusInsightAdmin(admin.ModelAdmin):
    """Admin configuration for ConnectusInsight model."""
    list_display = ['title', 'tenant', 'insight_type', 'priority', 'is_read', 'is_resolved', 'created_at']
    list_filter = ['insight_type', 'priority', 'is_read', 'is_resolved', 'created_at']
    search_fields = ['title', 'description', 'tenant__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'tenant', 'integration', 'insight_type', 'priority', 'title')
        }),
        ('Content', {
            'fields': ('description', 'recommendation', 'action_items', 'metadata'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_read', 'is_resolved'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
