from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IntegrationProviderViewSet, IntegrationViewSet, DataFlowViewSet,
    WorkflowAutomationViewSet, ConnectusInsightViewSet
)

router = DefaultRouter()
router.register(r'providers', IntegrationProviderViewSet, basename='integration-provider')
router.register(r'integrations', IntegrationViewSet, basename='integration')
router.register(r'data-flows', DataFlowViewSet, basename='data-flow')
router.register(r'workflows', WorkflowAutomationViewSet, basename='workflow')
router.register(r'connectus', ConnectusInsightViewSet, basename='connectus')

urlpatterns = [
    path('', include(router.urls)),
] 