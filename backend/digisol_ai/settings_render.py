"""
Render deployment settings for digisol_ai project.
Simplified for Render's free tier with SQLite database.
"""

import os
from pathlib import Path
from datetime import timedelta

from .settings import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("SECRET_KEY must be set in production")

# Production hosts
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'digisol-backend.onrender.com').split(',')

# Security Settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# Session and CSRF Security
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_AGE = 3600  # 1 hour
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# Database - Use SQLite for Render free tier
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Static files configuration
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files - Use local storage for Render free tier
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Email configuration - Use console backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@digisolai.ca')

# CORS Settings
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'https://www.digisolai.ca,https://digisolai.ca').split(',')
CORS_ALLOW_CREDENTIALS = True

# Redis configuration for Celery (use memory broker for free tier)
CELERY_BROKER_URL = 'memory://'
CELERY_RESULT_BACKEND = 'rpc://'

# Override INSTALLED_APPS for production
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
    'whitenoise.runserver_nostatic',
    
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

# Middleware - Add whitenoise for static files
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

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
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
} 