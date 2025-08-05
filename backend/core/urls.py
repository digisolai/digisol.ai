# backend/core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TenantViewSet, ContactViewSet, CampaignViewSet,
    EmailTemplateViewSet, AutomationWorkflowViewSet, BrandProfileViewSet,
    AutomationExecutionViewSet, BrandAssetViewSet, health_check, simple_health_check
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'contacts', ContactViewSet, basename='contact') # This defines /contacts/
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'email-templates', EmailTemplateViewSet, basename='email-template')
router.register(r'automation-workflows', AutomationWorkflowViewSet, basename='automation-workflow')
router.register(r'automation-executions', AutomationExecutionViewSet, basename='automation-execution')
router.register(r'brand-profiles', BrandProfileViewSet, basename='brand-profile')
router.register(r'brand-assets', BrandAssetViewSet, basename='brand-asset')

app_name = 'core'

urlpatterns = [
    # CRITICAL CHANGE: Remove 'api/' prefix here. It's already handled by digisol_ai/urls.py
    path('', include(router.urls)), # <--- CHANGED FROM 'api/' to ''
    path('health/', simple_health_check, name='health_check'),
]