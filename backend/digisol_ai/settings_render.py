"""
Render.com specific settings for digisol_ai project.
"""

import os
from pathlib import Path
from datetime import timedelta

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from .settings import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-fallback-key-for-render')

# Production hosts
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1,0.0.0.0').split(',')

# Add Render.com hostname if available
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Security Settings (less strict for Render)
SECURE_SSL_REDIRECT = False  # Render handles SSL
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# Session and CSRF Security
SESSION_COOKIE_SECURE = False  # Set to True if using custom domain with SSL
CSRF_COOKIE_SECURE = False     # Set to True if using custom domain with SSL
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_AGE = 3600  # 1 hour
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# Database - Use PostgreSQL in production (Render PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'digisol_ai_production'),
        'USER': os.environ.get('DB_USER', 'digisol_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# Static files configuration
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Add whitenoise middleware for static files
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# Media files - Use local storage for now (can be changed to S3 later)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Email configuration (optional for now)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Redis configuration for Celery (optional for now)
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL

# Override INSTALLED_APPS for production (remove development-only apps)
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    
    # Custom apps
    'core.apps.CoreConfig',
    'accounts.apps.AccountsConfig',
    'campaigns.apps.CampaignsConfig',
    'ai_services.apps.AiServicesConfig',
    'project_management.apps.ProjectManagementConfig',
    'billing.apps.BillingConfig',
    'subscription_billing.apps.SubscriptionBillingConfig',
    'templates_app.apps.TemplatesAppConfig',
    'marketing_templates.apps.MarketingTemplatesConfig',
    'learning.apps.LearningConfig',
    'budgeting.apps.BudgetingConfig',
    'analytics.apps.AnalyticsConfig',
    'integrations.apps.IntegrationsConfig',
]

# CORS settings for production
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'https://www.digisol.ca,https://digisol.ca').split(',')
CORS_ALLOW_CREDENTIALS = True

# Authentication backend
AUTHENTICATION_BACKENDS = [
    'accounts.authentication.EmailOrUsernameModelBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

# Cache configuration (simple for now)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
} 