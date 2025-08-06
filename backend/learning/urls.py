from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TutorialViewSet, TutorialSectionViewSet, 
    TutorialStepViewSet, UserTutorialProgressViewSet
)
from .gamification_views import (
    BadgeViewSet, UserBadgeViewSet, LearningAchievementViewSet,
    MarketingResourceViewSet, UserResourceProgressViewSet, GamificationStatsViewSet
)

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'tutorials', TutorialViewSet, basename='tutorial')
router.register(r'sections', TutorialSectionViewSet, basename='tutorial-section')
router.register(r'steps', TutorialStepViewSet, basename='tutorial-step')
router.register(r'progress', UserTutorialProgressViewSet, basename='tutorial-progress')

# Gamification endpoints
router.register(r'badges', BadgeViewSet, basename='badge')
router.register(r'user-badges', UserBadgeViewSet, basename='user-badge')
router.register(r'achievements', LearningAchievementViewSet, basename='achievement')
router.register(r'marketing-resources', MarketingResourceViewSet, basename='marketing-resource')
router.register(r'resource-progress', UserResourceProgressViewSet, basename='resource-progress')
router.register(r'stats', GamificationStatsViewSet, basename='gamification-stats')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
] 