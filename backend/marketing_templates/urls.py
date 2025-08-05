from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TemplateCategoryViewSet, MarketingTemplateViewSet

router = DefaultRouter()
router.register(r'categories', TemplateCategoryViewSet, basename='template-category')
router.register(r'templates', MarketingTemplateViewSet, basename='marketing-template')

urlpatterns = [
    path('', include(router.urls)),
]
