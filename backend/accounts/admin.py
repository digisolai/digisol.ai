from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'tenant', 'is_active', 'is_tenant_admin']
    list_filter = ['role', 'is_active', 'is_tenant_admin', 'tenant', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name', 'tenant__name']
    ordering = ['email']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'profile_picture', 'bio', 'phone_number', 'job_title')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_tenant_admin', 'is_hr_admin', 'is_agency_admin', 'has_corporate_suite', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'tenant', 'role'),
        }),
    )
