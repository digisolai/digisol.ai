from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MarketingCampaignViewSet, CampaignStepViewSet, OptimizerInsightViewSet,
    CampaignPerformanceViewSet, CampaignAudienceViewSet, CampaignTemplateViewSet,
    CampaignDashboardView, OptimizerRecommendationView
)

router = DefaultRouter()
router.register(r'campaigns', MarketingCampaignViewSet, basename='campaign')
router.register(r'steps', CampaignStepViewSet, basename='step')
router.register(r'insights', OptimizerInsightViewSet, basename='insight')
router.register(r'performance', CampaignPerformanceViewSet, basename='performance')
router.register(r'audiences', CampaignAudienceViewSet, basename='audience')
router.register(r'templates', CampaignTemplateViewSet, basename='template')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', CampaignDashboardView.as_view(), name='campaign-dashboard'),
    path('recommendations/', OptimizerRecommendationView.as_view(), name='optimizer-recommendations'),
] 