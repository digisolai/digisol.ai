# backend/digisol_ai/urls_minimal.py
"""
Minimal URL configuration for basic authentication functionality on Render.com
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone


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


urlpatterns = [
    path('', root_handler, name='root'),  # Handle root URL
    path('health/', health_check, name='health_check'),
    path('admin/', admin.site.urls),

    # Essential API endpoints for authentication only
    path('api/accounts/', include('auth_minimal.urls')),
]