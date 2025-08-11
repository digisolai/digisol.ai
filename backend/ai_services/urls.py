from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContentGenerationView,
    ContentGenerationStatusView,
    content_generation_history,
    cancel_content_generation,
    GenerateImageView,
    ImageGenerationStatusView,
    AIRecommendationViewSet,
    AIProfileViewSet,
    AITaskViewSet,
    AIInteractionLogViewSet,
    AIOrchestrationView,
    ImageGenerationRequestViewSet,
    AIPlanningView,
    StructuraInsightViewSet,
    AIEcosystemHealthViewSet,
    GeminiChatView,
    setup_ai_agents
)

app_name = 'ai_services'

# Create router for ViewSets
router = DefaultRouter()
router.register(r'recommendations', AIRecommendationViewSet, basename='ai-recommendation')
router.register(r'profiles', AIProfileViewSet, basename='ai-profile')
router.register(r'tasks', AITaskViewSet, basename='ai-task')
router.register(r'interaction-logs', AIInteractionLogViewSet, basename='ai-interaction-log')
router.register(r'image-generation-requests', ImageGenerationRequestViewSet, basename='image-generation-request')
router.register(r'structura-insights', StructuraInsightViewSet, basename='structura-insight')
router.register(r'ecosystem-health', AIEcosystemHealthViewSet, basename='ecosystem-health')

urlpatterns = [
    # Content generation endpoints
    path('generate-content/', ContentGenerationView.as_view(), name='generate_content'),
    path('generate-content/status/<uuid:request_id>/', ContentGenerationStatusView.as_view(), name='content_status'),
    path('generate-content/history/', content_generation_history, name='content_history'),
    path('generate-content/cancel/<uuid:request_id>/', cancel_content_generation, name='cancel_content'),
    path('generate-image/', GenerateImageView.as_view(), name='generate-image'),
    path('generate-image/status/<uuid:request_id>/', ImageGenerationStatusView.as_view(), name='generate-image-status'),
    
    # AI Planning and Orchestration
    path('planning/', AIPlanningView.as_view(), name='ai-planning'),
    path('orchestrate-plan/', AIOrchestrationView.as_view(), name='orchestrate-plan'),
    
    # Gemini Chat
    path('gemini-chat/', GeminiChatView.as_view(), name='gemini-chat'),
    
    # Setup endpoint
    path('setup-agents/', setup_ai_agents, name='setup-ai-agents'),
    
    # Router URLs
    path('', include(router.urls)),
] 