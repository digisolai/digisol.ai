from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, ProjectTaskViewSet, ProjectMilestoneViewSet,
    ProjectFileViewSet, ProjectCommentViewSet, ProjectTemplateViewSet,
    PromanaInsightViewSet, ProjectAutomationRuleViewSet, ProjectRiskViewSet,
    ProjectReportViewSet, ClientPortalViewSet, TimeEntryViewSet
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', ProjectTaskViewSet, basename='task')
router.register(r'milestones', ProjectMilestoneViewSet, basename='milestone')
router.register(r'files', ProjectFileViewSet, basename='file')
router.register(r'comments', ProjectCommentViewSet, basename='comment')
router.register(r'templates', ProjectTemplateViewSet, basename='template')
router.register(r'promana-insights', PromanaInsightViewSet, basename='promana-insight')
router.register(r'automation-rules', ProjectAutomationRuleViewSet, basename='automation-rule')
router.register(r'risks', ProjectRiskViewSet, basename='risk')
router.register(r'reports', ProjectReportViewSet, basename='report')
router.register(r'client-portals', ClientPortalViewSet, basename='client-portal')
router.register(r'time-entries', TimeEntryViewSet, basename='time-entry')

urlpatterns = [
    path('', include(router.urls)),
] 