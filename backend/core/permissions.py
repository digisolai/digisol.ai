from rest_framework import permissions
from .admin_access import is_digisol_admin

class DigiSolAdminOrAuthenticated(permissions.BasePermission):
    """
    Custom permission class that allows DigiSol.AI admins to bypass authentication
    for development purposes, while still requiring authentication for other users.
    """
    
    def has_permission(self, request, view):
        # Allow DigiSol admins to bypass authentication
        if hasattr(request, 'user') and request.user and is_digisol_admin(request.user):
            return True
        
        # For all other users, require authentication
        return request.user and request.user.is_authenticated

class DigiSolAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission class that allows DigiSol.AI admins full access,
    but only read access for authenticated users.
    """
    
    def has_permission(self, request, view):
        # Allow DigiSol admins full access
        if hasattr(request, 'user') and request.user and is_digisol_admin(request.user):
            return True
        
        # For other users, only allow read operations if authenticated
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        return False
