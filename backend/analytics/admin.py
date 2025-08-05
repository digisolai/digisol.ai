from django.contrib import admin
from .models import Event, ReportConfiguration, LeadFunnelEvent


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'tenant', 'contact', 'campaign', 'value', 'timestamp']
    list_filter = ['event_type', 'tenant', 'timestamp']
    search_fields = ['contact__email', 'campaign__name', 'tenant__name']
    readonly_fields = ['id', 'timestamp', 'has_value', 'event_summary']
    ordering = ['-timestamp']


@admin.register(ReportConfiguration)
class ReportConfigurationAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant', 'created_by', 'configuration_summary', 'created_at']
    list_filter = ['tenant', 'created_at']
    search_fields = ['name', 'tenant__name', 'created_by__email']
    readonly_fields = ['id', 'created_at', 'configuration_summary']
    ordering = ['-created_at']


@admin.register(LeadFunnelEvent)
class LeadFunnelEventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'tenant', 'contact', 'campaign', 'campaign_step', 'timestamp']
    list_filter = ['event_type', 'tenant', 'timestamp']
    search_fields = ['contact__email', 'campaign__name', 'campaign_step__name', 'tenant__name']
    readonly_fields = ['id', 'timestamp', 'event_summary', 'has_campaign_context', 'has_step_context']
    ordering = ['-timestamp']
    list_select_related = ['contact', 'campaign', 'campaign_step', 'tenant']
