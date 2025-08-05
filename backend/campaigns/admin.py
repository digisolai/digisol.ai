from django.contrib import admin
from .models import (
    MarketingCampaign, CampaignStep, CatalystInsight, 
    CampaignPerformance, CampaignAudience, CampaignTemplate
)


@admin.register(MarketingCampaign)
class MarketingCampaignAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'tenant', 'campaign_type', 'objective', 'status', 
        'catalyst_health_score', 'budget', 'spent_budget', 'created_at'
    ]
    list_filter = [
        'status', 'campaign_type', 'objective', 'is_template', 
        'auto_optimization_enabled', 'created_at'
    ]
    search_fields = ['name', 'description', 'target_audience_segment']
    readonly_fields = ['created_at', 'updated_at', 'spent_budget']
    fieldsets = (
        ('Basic Information', {
            'fields': ('tenant', 'name', 'description', 'campaign_type', 'objective')
        }),
        ('Status & Lifecycle', {
            'fields': ('status', 'start_date', 'end_date')
        }),
        ('Targeting', {
            'fields': ('target_audience_segment', 'audience_criteria', 'estimated_reach')
        }),
        ('Budget & Performance', {
            'fields': ('budget', 'spent_budget', 'target_roi', 'performance_metrics', 'conversion_goals')
        }),
        ('AI Integration', {
            'fields': ('catalyst_health_score', 'catalyst_recommendations', 'auto_optimization_enabled', 'last_optimized')
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
        'name', 'campaign', 'step_type', 'order', 'is_enabled', 
        'catalyst_optimized', 'execution_count', 'created_at'
    ]
    list_filter = [
        'step_type', 'is_enabled', 'catalyst_optimized', 'created_at'
    ]
    search_fields = ['name', 'description', 'campaign__name']
    readonly_fields = ['created_at', 'updated_at', 'execution_count', 'last_executed']
    fieldsets = (
        ('Basic Information', {
            'fields': ('campaign', 'name', 'description', 'step_type', 'order')
        }),
        ('Configuration', {
            'fields': ('config', 'content_data', 'metadata')
        }),
        ('Flow Control', {
            'fields': ('parent_steps', 'true_path_next_step', 'false_path_next_step')
        }),
        ('AI Integration', {
            'fields': ('catalyst_optimized', 'catalyst_suggestions', 'performance_score')
        }),
        ('Execution', {
            'fields': ('is_enabled', 'execution_count', 'last_executed')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CatalystInsight)
class CatalystInsightAdmin(admin.ModelAdmin):
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
            'fields': ('tenant', 'campaign', 'step', 'title', 'description')
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
        'name', 'tenant', 'segment_type', 'estimated_size', 'actual_size',
        'engagement_rate', 'conversion_rate', 'catalyst_score', 'is_active'
    ]
    list_filter = ['segment_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('tenant', 'name', 'description', 'segment_type')
        }),
        ('Audience Criteria', {
            'fields': ('criteria', 'filters')
        }),
        ('Size & Performance', {
            'fields': ('estimated_size', 'actual_size', 'engagement_rate', 'conversion_rate')
        }),
        ('AI Integration', {
            'fields': ('catalyst_score', 'catalyst_recommendations')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CampaignTemplate)
class CampaignTemplateAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'usage_count', 'rating', 'is_public', 
        'is_featured', 'created_at'
    ]
    list_filter = ['category', 'is_public', 'is_featured', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['usage_count', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('tenant', 'name', 'description', 'category')
        }),
        ('Template Data', {
            'fields': ('campaign_data', 'steps_data', 'settings'),
            'classes': ('collapse',)
        }),
        ('Usage & Popularity', {
            'fields': ('usage_count', 'rating')
        }),
        ('Visibility', {
            'fields': ('is_public', 'is_featured')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 