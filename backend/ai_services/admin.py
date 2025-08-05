from django.contrib import admin
from .models import (
    ContentGenerationRequest, ImageGenerationRequest, AIRecommendation,
    AIProfile, AITask, AIInteractionLog
)


@admin.register(ContentGenerationRequest)
class ContentGenerationRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'content_type', 'status', 'requested_by', 'tenant', 'created_at']
    list_filter = ['status', 'content_type', 'tenant', 'created_at']
    search_fields = ['prompt_text', 'generated_content', 'requested_by__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'completed_at', 'processing_time']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Request Information', {
            'fields': ('id', 'tenant', 'requested_by', 'content_type', 'status')
        }),
        ('Content', {
            'fields': ('prompt_text', 'context_data', 'generated_content')
        }),
        ('Credits & Timing', {
            'fields': ('credits_used', 'created_at', 'updated_at', 'completed_at', 'processing_time')
        }),
        ('Error Information', {
            'fields': ('error_message',),
            'classes': ('collapse',)
        }),
    )


@admin.register(ImageGenerationRequest)
class ImageGenerationRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'status', 'requested_by', 'tenant', 'design_type', 'credits_cost', 'is_edited', 'has_edits', 'created_at']
    list_filter = ['status', 'design_type', 'is_edited', 'tenant', 'created_at']
    search_fields = ['prompt_text', 'requested_by__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'final_image_url', 'has_edits']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Request Information', {
            'fields': ('id', 'tenant', 'requested_by', 'prompt_text', 'brand_profile', 'design_type', 'design_parameters', 'status')
        }),
        ('Generated Image', {
            'fields': ('generated_image_url', 'credits_cost')
        }),
        ('Edited Image', {
            'fields': ('edited_image_url', 'is_edited', 'final_image_url', 'has_edits')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(AIRecommendation)
class AIRecommendationAdmin(admin.ModelAdmin):
    list_display = ['id', 'type', 'user', 'tenant', 'priority', 'is_actionable', 'is_dismissed', 'generated_by_agent', 'created_at']
    list_filter = ['type', 'priority', 'is_actionable', 'is_dismissed', 'is_actioned', 'tenant', 'created_at']
    search_fields = ['recommendation_text', 'user__email', 'generated_by_agent__name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'is_active', 'recommendation_summary']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Recommendation Information', {
            'fields': ('id', 'tenant', 'user', 'type', 'priority', 'generated_by_agent')
        }),
        ('Content', {
            'fields': ('recommendation_text', 'context_data')
        }),
        ('Status', {
            'fields': ('is_actionable', 'is_dismissed', 'is_actioned', 'is_active')
        }),
        ('Timing', {
            'fields': ('created_at', 'updated_at', 'recommendation_summary')
        }),
    )


@admin.register(AIProfile)
class AIProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialization', 'is_active', 'is_global', 'tenant', 'api_model_name', 'created_at']
    list_filter = ['specialization', 'is_active', 'tenant', 'created_at']
    search_fields = ['name', 'personality_description']
    readonly_fields = ['id', 'created_at', 'updated_at', 'is_global']
    ordering = ['specialization', 'name']
    
    fieldsets = (
        ('Agent Information', {
            'fields': ('id', 'name', 'specialization', 'personality_description')
        }),
        ('Configuration', {
            'fields': ('api_model_name',)
        }),
        ('Status & Access', {
            'fields': ('is_active', 'is_global', 'tenant')
        }),
        ('Timing', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_queryset(self, request):
        """Show both tenant-specific and global agents."""
        qs = super().get_queryset(request)
        return qs


@admin.register(AITask)
class AITaskAdmin(admin.ModelAdmin):
    list_display = ['id', 'objective_preview', 'status', 'requester', 'assignee_agent', 'tenant', 'has_sub_tasks', 'created_at']
    list_filter = ['status', 'tenant', 'assignee_agent__specialization', 'created_at']
    search_fields = ['objective', 'requester__email', 'assignee_agent__name']
    readonly_fields = [
        'id', 'created_at', 'updated_at', 'is_completed', 
        'has_sub_tasks', 'all_sub_tasks_completed'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Task Information', {
            'fields': ('id', 'tenant', 'requester', 'assignee_agent', 'parent_task')
        }),
        ('Content', {
            'fields': ('objective', 'status')
        }),
        ('Data', {
            'fields': ('context_data', 'result_data')
        }),
        ('Status', {
            'fields': ('is_completed', 'has_sub_tasks', 'all_sub_tasks_completed')
        }),
        ('Timing', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def objective_preview(self, obj):
        """Show a preview of the objective."""
        return obj.objective[:50] + "..." if len(obj.objective) > 50 else obj.objective
    objective_preview.short_description = 'Objective'


@admin.register(AIInteractionLog)
class AIInteractionLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'role', 'ai_profile_name', 'user_name', 'ai_task', 'timestamp', 'message_preview']
    list_filter = ['role', 'ai_profile__specialization', 'timestamp']
    search_fields = ['message_content', 'ai_profile__name', 'user__email', 'ai_task__objective']
    readonly_fields = ['id', 'timestamp', 'message_preview']
    ordering = ['-timestamp']
    
    fieldsets = (
        ('Interaction Information', {
            'fields': ('id', 'tenant', 'ai_profile', 'user', 'ai_task')
        }),
        ('Content', {
            'fields': ('role', 'message_content', 'message_preview')
        }),
        ('Timing', {
            'fields': ('timestamp',)
        }),
    )
    
    def ai_profile_name(self, obj):
        """Get AI profile name."""
        return obj.ai_profile.name if obj.ai_profile else "System"
    ai_profile_name.short_description = 'AI Agent'
    
    def user_name(self, obj):
        """Get user name."""
        return obj.user.email if obj.user else "N/A"
    user_name.short_description = 'User'
    
    def get_queryset(self, request):
        """Filter by tenant."""
        qs = super().get_queryset(request)
        return qs
