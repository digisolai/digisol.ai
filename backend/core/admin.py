from django.contrib import admin
from .models import (
    Tenant, Contact, Campaign, EmailTemplate, 
    AutomationWorkflow, AutomationExecution, BrandProfile, BrandAsset
)


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ['name', 'subdomain', 'is_active', 'active_subscription', 'tokens_used_current_period', 'contacts_used_current_period', 'emails_sent_current_period', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'subdomain']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'subdomain', 'is_active', 'active_subscription')
        }),
        ('Usage Tracking', {
            'fields': (
                'tokens_used_current_period', 'tokens_purchased_additional',
                'contacts_used_current_period', 'emails_sent_current_period'
            )
        }),
        ('Legacy AI Credits', {
            'fields': (
                'ai_text_credits_used_current_period', 'ai_image_credits_used_current_period',
                'ai_planning_requests_used_current_period'
            ),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'company', 'lead_status', 'priority', 'score', 'tenant', 'created_at']
    list_filter = ['tenant', 'lead_status', 'priority', 'lead_source', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'company', 'job_title', 'notes']
    readonly_fields = ['created_at', 'updated_at', 'full_name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('tenant', 'first_name', 'last_name', 'email', 'phone_number', 'company', 'job_title')
        }),
        ('Lead Management', {
            'fields': ('lead_source', 'lead_status', 'priority', 'score', 'last_contact_date')
        }),
        ('Communication & Notes', {
            'fields': ('notes', 'tags')
        }),
        ('AI Insights', {
            'fields': ('last_activity_summary', 'next_action_suggestion'),
            'classes': ('collapse',)
        }),
        ('Legacy Fields', {
            'fields': ('phone', 'title', 'custom_fields'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['name', 'campaign_type', 'status', 'created_by', 'tenant', 'start_date', 'end_date']
    list_filter = ['campaign_type', 'status', 'tenant', 'created_at']
    search_fields = ['name', 'objective', 'created_by__email']
    readonly_fields = ['created_at', 'updated_at', 'duration_days', 'is_active_campaign']
    ordering = ['-created_at']


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'tenant', 'created_at']
    list_filter = ['tenant', 'created_at']
    search_fields = ['name', 'subject', 'body_html']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']


@admin.register(AutomationWorkflow)
class AutomationWorkflowAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'tenant', 'created_at']
    list_filter = ['is_active', 'tenant', 'created_at']
    search_fields = ['name', 'tenant__name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']


@admin.register(AutomationExecution)
class AutomationExecutionAdmin(admin.ModelAdmin):
    list_display = ['id', 'workflow', 'contact', 'status', 'current_step_index', 'tenant', 'started_at']
    list_filter = ['status', 'tenant', 'started_at']
    search_fields = ['workflow__name', 'contact__email']
    readonly_fields = ['id', 'started_at', 'last_executed_at', 'completed_at', 'is_completed', 'is_failed']
    ordering = ['-started_at']


@admin.register(BrandProfile)
class BrandProfileAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'name', 'industry', 'primary_color', 'secondary_color', 'created_at']
    list_filter = ['created_at', 'industry']
    search_fields = ['tenant__name', 'name', 'description', 'industry']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('tenant', 'name', 'description')
        }),
        ('Visual Identity', {
            'fields': ('logo_url', 'primary_color', 'secondary_color', 'font_family')
        }),
        ('Brand Voice & Messaging', {
            'fields': ('brand_voice', 'tone_of_voice_description', 'key_messaging', 'brand_values')
        }),
        ('Mission & Vision', {
            'fields': ('mission', 'vision')
        }),
        ('Target Audience', {
            'fields': ('target_audience', 'target_audience_description')
        }),
        ('Industry & Contact', {
            'fields': ('industry', 'website_url', 'contact_email', 'phone_number')
        }),
        ('Social Media & Competition', {
            'fields': ('social_media_links', 'competitors')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(BrandAsset)
class BrandAssetAdmin(admin.ModelAdmin):
    list_display = ['name', 'asset_type', 'tenant', 'created_by', 'is_ai_generated', 'is_edited_version', 'is_shared_with_clients', 'created_at']
    list_filter = ['asset_type', 'is_shared_with_clients', 'tenant', 'created_at']
    search_fields = ['name', 'description', 'created_by__email', 'tenant__name']
    readonly_fields = ['id', 'is_ai_generated', 'is_edited_version', 'tag_list', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Asset Information', {
            'fields': ('id', 'name', 'asset_type', 'file_url', 'description')
        }),
        ('Organization', {
            'fields': ('tenant', 'created_by', 'tags', 'tag_list')
        }),
        ('Sharing & AI', {
            'fields': ('is_shared_with_clients', 'original_image_request', 'is_ai_generated', 'is_edited_version')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
