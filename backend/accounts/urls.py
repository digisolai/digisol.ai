from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, UserProfileView, UserManagementViewSet, ContactViewSet, CustomTokenObtainPairView, CustomTokenRefreshView

# Create router for ViewSets
router = DefaultRouter()
router.register(r'users', UserManagementViewSet, basename='user-management')
router.register(r'contacts', ContactViewSet, basename='contacts')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
    path('', include(router.urls)),  # Include ViewSet routes
] 