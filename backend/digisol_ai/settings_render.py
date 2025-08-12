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
# Include Render service and frontend domains by default; can be overridden via env
ALLOWED_HOSTS = os.environ.get(
    'ALLOWED_HOSTS',
    'digisol-backend.onrender.com,www.digisolai.ca,digisolai.ca'
).split(',')

# Security Settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# Behind a proxy (Render) ensure Django recognizes the original scheme/host
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

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

# Override STATICFILES_DIRS for production - don't include frontend build dir
# since it doesn't exist on the server and frontend is served separately
STATICFILES_DIRS = []

# Media files - Use local storage for Render free tier
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Email configuration - Use console backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@digisolai.ca')

# CORS Settings
# Merge env-provided origins with safe defaults to avoid accidentally blocking Netlify
_default_cors_origins = [
    'https://www.digisolai.ca',
    'https://digisolai.ca',
    'https://digisolai.netlify.app',
]
_env_cors_csv = os.environ.get('CORS_ALLOWED_ORIGINS', '').strip()
_env_cors_list = [o.strip() for o in _env_cors_csv.split(',') if o.strip()]

# Merge and de-duplicate
_merged_cors = list(dict.fromkeys(_env_cors_list + _default_cors_origins))
CORS_ALLOWED_ORIGINS = _merged_cors

# Regex origins for Netlify preview deploys (e.g., https://<hash>--site.netlify.app)
_cors_regex_env = os.environ.get('CORS_ALLOWED_ORIGIN_REGEXES', '').strip()
if _cors_regex_env:
    CORS_ALLOWED_ORIGIN_REGEXES = [r.strip() for r in _cors_regex_env.split(',') if r.strip()]
else:
    CORS_ALLOWED_ORIGIN_REGEXES = [r"^https://[a-z0-9-]+--digisolai\\.netlify\\.app$"]

CORS_ALLOW_CREDENTIALS = True

# CSRF trusted origins (needed for some auth flows; safe to include wildcards)
CSRF_TRUSTED_ORIGINS = os.environ.get(
    'CSRF_TRUSTED_ORIGINS',
    'https://*.digisolai.ca,https://*.netlify.app,https://*.onrender.com'
).split(',')

# Redis/Celery configuration
# If REDIS_URL is provided (e.g., in Render env vars), use it for Celery broker/result backend.
# Otherwise, fall back to in-memory broker suitable only for basic/free-tier setups (no background worker).
REDIS_URL = os.environ.get('REDIS_URL')
if REDIS_URL:
    CELERY_BROKER_URL = REDIS_URL
    CELERY_RESULT_BACKEND = REDIS_URL
else:
    CELERY_BROKER_URL = 'memory://'
    CELERY_RESULT_BACKEND = 'rpc://'

# URL Configuration
ROOT_URLCONF = 'digisol_ai.urls'

# Templates Configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI Application
WSGI_APPLICATION = 'digisol_ai.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'America/Denver'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'accounts.CustomUser'

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
    'core.middleware.CurrentTenantMiddleware',
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