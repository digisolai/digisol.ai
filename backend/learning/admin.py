from django.contrib import admin
from .models import Tutorial, TutorialSection, TutorialStep, UserTutorialProgress


@admin.register(Tutorial)
class TutorialAdmin(admin.ModelAdmin):
    list_display = ['title', 'tenant', 'is_global', 'order', 'section_count', 'step_count', 'is_published', 'created_at']
    list_filter = ['is_published', 'tenant', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['id', 'is_global', 'section_count', 'step_count', 'created_at', 'updated_at']
    ordering = ['order', 'title']


@admin.register(TutorialSection)
class TutorialSectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'tutorial', 'order', 'step_count', 'created_at']
    list_filter = ['tutorial', 'created_at']
    search_fields = ['title', 'description', 'tutorial__title']
    readonly_fields = ['id', 'step_count', 'created_at', 'updated_at']
    ordering = ['tutorial__order', 'order', 'title']


@admin.register(TutorialStep)
class TutorialStepAdmin(admin.ModelAdmin):
    list_display = ['title', 'section', 'content_type', 'order', 'is_video', 'is_image', 'is_interactive', 'created_at']
    list_filter = ['content_type', 'section__tutorial', 'created_at']
    search_fields = ['title', 'content', 'section__title']
    readonly_fields = ['id', 'tutorial', 'is_video', 'is_image', 'is_interactive', 'created_at', 'updated_at']
    ordering = ['section__order', 'order', 'title']


@admin.register(UserTutorialProgress)
class UserTutorialProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'tutorial', 'is_completed', 'progress_percentage', 'started_at', 'completed_at']
    list_filter = ['is_completed', 'tutorial', 'started_at']
    search_fields = ['user__email', 'tutorial__title']
    readonly_fields = ['id', 'progress_percentage', 'next_step', 'started_at', 'completed_at']
    ordering = ['-started_at']
