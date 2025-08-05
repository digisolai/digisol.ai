from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TutorialViewSet, TutorialSectionViewSet, 
    TutorialStepViewSet, UserTutorialProgressViewSet
)

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'tutorials', TutorialViewSet, basename='tutorial')
router.register(r'sections', TutorialSectionViewSet, basename='tutorial-section')
router.register(r'steps', TutorialStepViewSet, basename='tutorial-step')
router.register(r'progress', UserTutorialProgressViewSet, basename='tutorial-progress')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
] 