from django.contrib import admin
from .models import Project, ProjectTask


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'manager', 'status', 'start_date', 'end_date', 'budget', 'tenant')
    list_filter = ('status', 'start_date', 'end_date', 'tenant')
    search_fields = ('name', 'description', 'manager__email')
    date_hierarchy = 'start_date'
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ProjectTask)
class ProjectTaskAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'assigned_to', 'status', 'start_date', 'end_date', 'estimated_hours', 'actual_hours')
    list_filter = ('status', 'start_date', 'end_date', 'project')
    search_fields = ('name', 'description', 'assigned_to__email', 'project__name')
    date_hierarchy = 'start_date'
    readonly_fields = ('created_at', 'updated_at')
    filter_horizontal = ('dependencies',)
