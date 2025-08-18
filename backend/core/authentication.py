from rest_framework import authentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from .admin_access import is_digisol_admin

User = get_user_model()

class DigiSolAdminAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class that allows DigiSol.AI admins to be identified
    from request headers or query parameters for development purposes.
    """
    
    def authenticate(self, request):
        # Check for DigiSol admin email in headers or query params
        admin_email = request.META.get('HTTP_X_DIGISOL_ADMIN') or request.GET.get('admin_email')
        
        if admin_email:
            try:
                user = User.objects.get(email=admin_email)
                if is_digisol_admin(user):
                    return (user, None)
            except User.DoesNotExist:
                # If user doesn't exist but email is in admin list, create them
                if admin_email in ['admin@digisolai.ca', 'cameron@digisolai.ca']:
                    # Create a superuser for DigiSol admin
                    user = User.objects.create_user(
                        username=admin_email,
                        email=admin_email,
                        password='admin123456',  # Default password
                        first_name='DigiSol',
                        last_name='Admin',
                        is_superuser=True,
                        is_staff=True,
                        is_active=True
                    )
                    return (user, None)
                pass
        
        # Check for superuser bypass in development
        if hasattr(request, 'META') and request.META.get('HTTP_X_SUPERUSER_BYPASS') == 'true':
            # Find the first superuser
            superuser = User.objects.filter(is_superuser=True).first()
            if superuser:
                return (superuser, None)
        
        return None

class JWTAuthenticationWithDigiSolBypass(JWTAuthentication):
    """
    JWT Authentication with DigiSol admin bypass for development.
    Falls back to DigiSol admin authentication if JWT fails.
    """
    
    def authenticate(self, request):
        # Try JWT authentication first
        jwt_auth = super().authenticate(request)
        if jwt_auth:
            return jwt_auth
        
        # Fall back to DigiSol admin authentication
        digisol_auth = DigiSolAdminAuthentication()
        return digisol_auth.authenticate(request)
