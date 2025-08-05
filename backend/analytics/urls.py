from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'events', views.EventViewSet, basename='event')
router.register(r'report-configurations', views.ReportConfigurationViewSet, basename='report-configuration')
router.register(r'lead-funnel-events', views.LeadFunnelEventViewSet, basename='lead-funnel-event')

# Quantia (Reports) endpoints
router.register(r'report-templates', views.ReportTemplateViewSet, basename='report-template')
router.register(r'saved-reports', views.SavedReportViewSet, basename='saved-report')
router.register(r'report-executions', views.ReportExecutionViewSet, basename='report-execution')

# Metrika (Advanced Analytics) endpoints
router.register(r'analytics-models', views.AnalyticsModelViewSet, basename='analytics-model')
router.register(r'analytics-insights', views.AnalyticsInsightViewSet, basename='analytics-insight')

# SEO Analysis endpoints
router.register(r'seo-analyses', views.SEOAnalysisViewSet, basename='seo-analysis')

# SWOT Analysis endpoints
router.register(r'swot-analyses', views.SWOTAnalysisViewSet, basename='swot-analysis')

# Industry Analysis endpoints
router.register(r'industry-analyses', views.IndustryAnalysisViewSet, basename='industry-analysis')

# Data Integration endpoints
router.register(r'data-sources', views.DataSourceViewSet, basename='data-source')
router.register(r'data-sync-logs', views.DataSyncLogViewSet, basename='data-sync-log')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Dashboard and summary endpoints
    path('dashboard-summary/', views.DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('analytics-summary/', views.AnalyticsSummaryView.as_view(), name='analytics-summary'),
    
    # Campaign-specific endpoints
    path('campaigns/<uuid:campaign_id>/summary/', views.CampaignSummaryView.as_view(), name='campaign-summary'),
    
    # Quantia (Reports) endpoints
    path('quantia/insights/', views.QuantiaInsightsView.as_view(), name='quantia-insights'),
    
    # Metrika (Advanced Analytics) endpoints
    path('metrika/analysis/', views.MetrikaAnalysisView.as_view(), name='metrika-analysis'),
    
    # Comprehensive reporting endpoints
    path('comprehensive-report/', views.ComprehensiveReportView.as_view(), name='comprehensive-report'),
] 