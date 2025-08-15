from django.contrib import admin
from .models import (
    MarketingCampaign, CampaignStep, OptimizerInsight, 
    CampaignPerformance, CampaignAudience, CampaignTemplate
)


@admin.register(MarketingCampaign)
class MarketingCampaignAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'campaign_type', 'objective', 'status', 
        'optimizer_health_score', 'budget', 'actual_spent', 'created_at'
    ]
    list_filter = [
        'status', 'campaign_type', 'objective', 'is_template', 
        'auto_optimization_enabled', 'created_at'
    ]
    search_fields = ['name', 'description', 'target_audience_segment']
    readonly_fields = ['created_at', 'updated_at', 'actual_spent']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'campaign_type', 'objective')
        }),
        ('Status & Lifecycle', {
            'fields': ('status', 'start_date', 'end_date')
        }),
        ('Targeting', {
            'fields': ('target_audience_segment', 'audience_criteria', 'estimated_reach')
        }),
        ('Budget & Performance', {
            'fields': ('budget', 'actual_spent', 'target_roi', 'performance_metrics', 'conversion_goals')
        }),
        ('AI Integration', {
            'fields': ('optimizer_health_score', 'optimizer_recommendations', 'auto_optimization_enabled', 'last_optimized')
        }),
        ('Template', {
            'fields': ('is_template', 'template_category')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CampaignStep)
class CampaignStepAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'campaign', 'step_type', 'order_index', 'is_enabled', 
        'optimizer_optimized', 'execution_count', 'created_at'
    ]
    list_filter = [
        'step_type', 'is_enabled', 'optimizer_optimized', 'created_at'
    ]
    search_fields = ['name', 'description', 'campaign__name']
    readonly_fields = ['created_at', 'updated_at', 'execution_count', 'last_executed']
    fieldsets = (
        ('Basic Information', {
            'fields': ('campaign', 'name', 'description', 'step_type', 'order_index')
        }),
        ('Configuration', {
            'fields': ('config', 'content_data', 'metadata')
        }),
        ('Flow Control', {
            'fields': ('parent_steps', 'true_path_next_step', 'false_path_next_step')
        }),
        ('AI Integration', {
            'fields': ('optimizer_optimized', 'optimizer_suggestions', 'performance_score')
        }),
        ('Execution', {
            'fields': ('is_enabled', 'execution_count', 'last_executed')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(OptimizerInsight)
class OptimizerInsightAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'campaign', 'insight_type', 'priority', 'confidence_score',
        'is_actioned', 'is_dismissed', 'created_at'
    ]
    list_filter = [
        'insight_type', 'priority', 'is_actioned', 'is_dismissed', 'created_at'
    ]
    search_fields = ['title', 'description', 'campaign__name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('campaign', 'step', 'title', 'description')
        }),
        ('Insight Details', {
            'fields': ('insight_type', 'recommendation', 'priority', 'predicted_impact', 'confidence_score')
        }),
        ('Status', {
            'fields': ('is_actioned', 'is_dismissed', 'action_taken')
        }),
        ('Context', {
            'fields': ('context_data', 'expires_at'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CampaignPerformance)
class CampaignPerformanceAdmin(admin.ModelAdmin):
    list_display = [
        'campaign', 'date', 'impressions', 'clicks', 'conversions',
        'revenue', 'cost', 'roi', 'created_at'
    ]
    list_filter = ['date', 'created_at']
    search_fields = ['campaign__name']
    readonly_fields = ['ctr', 'cpc', 'cpm', 'conversion_rate', 'roi', 'created_at', 'updated_at']
    fieldsets = (
        ('Campaign & Date', {
            'fields': ('campaign', 'step', 'date', 'hour')
        }),
        ('Key Metrics', {
            'fields': ('impressions', 'clicks', 'conversions', 'revenue', 'cost')
        }),
        ('Engagement Metrics', {
            'fields': ('opens', 'bounces', 'unsubscribes')
        }),
        ('Calculated Metrics', {
            'fields': ('ctr', 'cpc', 'cpm', 'conversion_rate', 'roi'),
            'classes': ('collapse',)
        }),
        ('Additional Data', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CampaignAudience)
class CampaignAudienceAdmin(admin.ModelAdmin):
    list_display = [
        'audience_name', 'campaign', 'size', 'engagement_rate', 
        'conversion_rate', 'optimizer_score', 'created_at'
    ]
    list_filter = ['created_at']
    search_fields = ['audience_name', 'campaign__name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('campaign', 'audience_name', 'audience_criteria')
        }),
        ('Size & Performance', {
            'fields': ('size', 'engagement_rate', 'conversion_rate')
        }),
        ('AI Integration', {
            'fields': ('optimizer_score', 'optimizer_recommendations')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CampaignTemplate)
class CampaignTemplateAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'usage_count', 'created_at'
    ]
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['usage_count', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category')
        }),
        ('Template Data', {
            'fields': ('campaign_data', 'steps_data'),
            'classes': ('collapse',)
        }),
        ('Usage', {
            'fields': ('usage_count',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 