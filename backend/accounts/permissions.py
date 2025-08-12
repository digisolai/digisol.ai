from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated


class IsTenantUser(permissions.BasePermission):
    """
    Custom permission to only allow users associated with a tenant.
    """
    
    def has_permission(self, request, view):
        # Allow superusers to access everything
        if request.user.is_superuser:
            return True
        
        # Check if user has a tenant
        return hasattr(request.user, 'tenant') and request.user.tenant is not None

    def has_object_permission(self, request, view, obj):
        # Allow superusers to access everything
        if request.user.is_superuser:
            return True
        
        # Check if user has a tenant and the object belongs to that tenant
        if hasattr(request.user, 'tenant') and request.user.tenant:
            # Check if the object has a tenant field
            if hasattr(obj, 'tenant'):
                return obj.tenant == request.user.tenant
            # If object doesn't have tenant field, check if user can access it
            return True
        
        return False 

class AllowOptionsPermission(IsAuthenticated):
    """
    Custom permission class that allows OPTIONS requests (for CORS preflight)
    while requiring authentication for other methods.
    """
    
    def has_permission(self, request, view):
        # Allow OPTIONS requests without authentication (for CORS preflight)
        if request.method == 'OPTIONS':
            return True
        
        # For all other methods, require authentication
        return super().has_permission(request, view) 