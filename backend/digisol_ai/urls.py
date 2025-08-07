# backend/digisol_ai/urls.py
"""
URL configuration for digisol_ai project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve

# The include_docs_urls import is not typically used here if you're using DRF's default router for documentation
# from rest_framework.documentation import include_docs_urls

@csrf_exempt
def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'message': 'DigiSol.AI backend is running',
        'timestamp': timezone.now().isoformat()
    })

@csrf_exempt
def root_handler(request):
    """Root endpoint for Render health checks"""
    return JsonResponse({
        'message': 'DigiSol.AI Backend API',
        'status': 'online',
        'health_check': '/health/',
        'api_docs': '/admin/',
        'timestamp': timezone.now().isoformat()
    })

def serve_frontend(request, path=''):
    """Serve the React frontend for any non-API routes"""
    return serve(request, 'index.html', settings.FRONTEND_BUILD_DIR)

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('admin/', admin.site.urls),

    # IMPORTANT: Each API app MUST have a UNIQUE sub-path under /api/
    path('api/accounts/', include('accounts.urls')),
    path('api/core/', include('core.urls')), # Note: This handles general core models
    path('api/ai-services/', include('ai_services.urls')),
    path('api/project-management/', include('project_management.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/subscription-billing/', include('subscription_billing.urls')),
    path('api/templates/', include('templates_app.urls')),
    path('api/marketing-templates/', include('marketing_templates.urls')),
    path('api/learning/', include('learning.urls')),
    path('api/budgeting/', include('budgeting.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/integrations/', include('integrations.urls')),
    
    # Serve static files
    *static(settings.STATIC_URL, document_root=settings.STATIC_ROOT),
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
    
    # Catch-all for React Router - must be last
    re_path(r'^(?P<path>.*)$', serve_frontend, name='frontend'),
]