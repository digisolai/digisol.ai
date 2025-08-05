from django.db import models
from .middleware import get_current_tenant


class TenantAwareManager(models.Manager):
    """
    Manager that automatically filters querysets by the current tenant.
    Uses thread-local storage to get the current tenant from middleware.
    """
    
    def get_queryset(self):
        """
        Override get_queryset to automatically filter by current tenant.
        Superusers bypass tenant filtering and can access all data.
        Global objects (tenant=None) are always accessible.
        Models without tenant field are always accessible.
        """
        queryset = super().get_queryset()
        current_tenant = get_current_tenant()
        
        # Check if this model has a tenant field
        model = queryset.model
        has_tenant_field = hasattr(model, 'tenant')
        
        if not has_tenant_field:
            # If model doesn't have tenant field, return all objects
            return queryset
        
        if current_tenant:
            # Filter by tenant if we have a current tenant
            # Also include global objects (tenant=None)
            return queryset.filter(models.Q(tenant=current_tenant) | models.Q(tenant=None))
        else:
            # If no current tenant, only return global objects (tenant=None)
            return queryset.filter(tenant=None)
    
    def for_tenant(self, tenant):
        """
        Explicitly filter by a specific tenant.
        Useful for admin operations or cross-tenant queries.
        """
        return super().get_queryset().filter(tenant=tenant)
    
    def all_tenants(self):
        """
        Get all records across all tenants (use with caution).
        Only use this for admin operations or system-wide queries.
        """
        return super().get_queryset()
    
    def for_superuser(self):
        """
        Get all records across all tenants for superuser access.
        This bypasses tenant filtering completely.
        """
        return super().get_queryset() 