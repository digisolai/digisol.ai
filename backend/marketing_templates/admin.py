from django.contrib import admin
from .models import TemplateCategory, MarketingTemplate


@admin.register(TemplateCategory)
class TemplateCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant', 'is_global', 'created_at', 'updated_at']
    list_filter = ['created_at', 'tenant']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'description')
        }),
        ('Tenant Information', {
            'fields': ('tenant', 'is_global'),
            'description': 'Leave tenant blank for global categories'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        """Show all categories to superusers, filtered for others"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(tenant=request.user.tenant)


@admin.register(MarketingTemplate)
class MarketingTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'template_type', 'category', 'tenant', 'is_global', 'created_by', 'created_at']
    list_filter = ['template_type', 'category', 'created_at', 'tenant']
    search_fields = ['name', 'content_json']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'template_type', 'category')
        }),
        ('Content', {
            'fields': ('content_json', 'preview_image_url'),
            'description': 'Structured content for the template'
        }),
        ('Tenant Information', {
            'fields': ('tenant', 'is_global'),
            'description': 'Leave tenant blank for global templates'
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        """Show all templates to superusers, filtered for others"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs.select_related('category', 'created_by', 'tenant')
        return qs.filter(tenant=request.user.tenant).select_related('category', 'created_by')

    def save_model(self, request, obj, form, change):
        """Set created_by and validate global template permissions"""
        if not change:  # Only on creation
            obj.created_by = request.user
        
        # Validate global template permissions
        if obj.is_global and not request.user.is_superuser:
            self.message_user(request, "Only superusers can create global templates", level='ERROR')
            return
        
        super().save_model(request, obj, form, change)

    def has_change_permission(self, request, obj=None):
        """Only superusers can edit global templates"""
        if obj and obj.is_global and not request.user.is_superuser:
            return False
        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete global templates"""
        if obj and obj.is_global and not request.user.is_superuser:
            return False
        return super().has_delete_permission(request, obj)
