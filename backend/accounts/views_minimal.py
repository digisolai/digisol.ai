from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model

from .serializers_minimal import (
    UserRegistrationSerializer, 
    UserProfileSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    Register a new user account - simplified version.
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def perform_create(self, serializer):
        # Simplified registration without tenant creation
        user = serializer.save()


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve and update user profile information.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain view with additional user data.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get the user from the serializer
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.user
            
            response.data['user'] = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'tenant': {
                    'id': user.tenant.id,
                    'name': user.tenant.name,
                    'subdomain': user.tenant.subdomain
                } if user.tenant else None
            }
        
        return response


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view.
    """
    pass