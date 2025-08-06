# backend/core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tenants', views.TenantViewSet)
router.register(r'brand-profiles', views.BrandProfileViewSet)
router.register(r'contacts', views.ContactViewSet)
router.register(r'campaigns', views.CampaignViewSet)
router.register(r'automation-workflows', views.AutomationWorkflowViewSet)
router.register(r'automation-executions', views.AutomationExecutionViewSet)
router.register(r'brand-assets', views.BrandAssetViewSet)
router.register(r'client-portals', views.AgencyClientPortalViewSet, basename='client-portal')
router.register(r'client-users', views.AgencyClientUserViewSet, basename='client-user')
router.register(r'client-activities', views.AgencyClientActivityViewSet, basename='client-activity')
router.register(r'client-billing', views.AgencyClientBillingViewSet, basename='client-billing')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', views.health_check, name='health_check'),
]