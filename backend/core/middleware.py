import threading
from django.utils.deprecation import MiddlewareMixin


# Thread-local storage for current tenant
_thread_locals = threading.local()


class CurrentTenantMiddleware(MiddlewareMixin):
    """
    Middleware to handle multi-tenancy by storing the current tenant
    in thread-local storage for the duration of the request.
    """
    
    def process_request(self, request):
        """
        Process the request and set the current tenant in thread-local storage.
        """
        # Clear any existing tenant from thread-local storage
        if hasattr(_thread_locals, 'current_tenant'):
            delattr(_thread_locals, 'current_tenant')
        
        # Set current tenant if user is authenticated and has a tenant
        if hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'tenant') and request.user.tenant:
                _thread_locals.current_tenant = request.user.tenant
    
    def process_response(self, request, response):
        """
        Clean up thread-local storage after the request is processed.
        """
        # Clear tenant from thread-local storage
        if hasattr(_thread_locals, 'current_tenant'):
            delattr(_thread_locals, 'current_tenant')
        
        return response
    
    def process_exception(self, request, exception):
        """
        Clean up thread-local storage in case of exceptions.
        """
        # Clear tenant from thread-local storage
        if hasattr(_thread_locals, 'current_tenant'):
            delattr(_thread_locals, 'current_tenant')


def get_current_tenant():
    """
    Get the current tenant from thread-local storage.
    
    Returns:
        Tenant instance or None if no tenant is set
    """
    return getattr(_thread_locals, 'current_tenant', None)


def set_current_tenant(tenant):
    """
    Set the current tenant in thread-local storage.
    
    Args:
        tenant: Tenant instance to set as current
    """
    _thread_locals.current_tenant = tenant


def clear_current_tenant():
    """
    Clear the current tenant from thread-local storage.
    """
    if hasattr(_thread_locals, 'current_tenant'):
        delattr(_thread_locals, 'current_tenant')
