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

# Database - Use AWS RDS PostgreSQL in production
# Check if AWS RDS environment variables are set
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT', '5432')

if DB_NAME and DB_USER and DB_PASSWORD and DB_HOST:
    # Use AWS RDS PostgreSQL
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': DB_NAME,
            'USER': DB_USER,
            'PASSWORD': DB_PASSWORD,
            'HOST': DB_HOST,
            'PORT': DB_PORT,
            'OPTIONS': {
                'sslmode': 'require',
            },
        }
    }
    print(f"🔧 Using AWS RDS PostgreSQL: {DB_HOST}:{DB_PORT}/{DB_NAME}")
else:
    # Fallback to Render's DATABASE_URL (SQLite)
    try:
        import dj_database_url
        DATABASES = {
            'default': dj_database_url.config(
                default=os.environ.get('DATABASE_URL'),
                conn_max_age=600,
                conn_health_checks=True,
            )
        }
        print("⚠️  Using Render's DATABASE_URL (fallback)")
    except ImportError:
        # Final fallback to SQLite
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
        print("⚠️  Using local SQLite (final fallback)")

# Static files configuration
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Override STATICFILES_DIRS for production - don't include frontend build dir
# since it doesn't exist on the server and frontend is served separately
STATICFILES_DIRS = []

# Media files - Use S3 in production
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}
AWS_DEFAULT_ACL = 'private'
AWS_S3_FILE_OVERWRITE = False
AWS_QUERYSTRING_AUTH = False

# Use S3 for media files if AWS credentials are configured
if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and AWS_STORAGE_BUCKET_NAME:
    try:
        DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
        MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/'
        # Add django-storages to INSTALLED_APPS
        if 'storages' not in INSTALLED_APPS:
            INSTALLED_APPS.append('storages')
    except ImportError:
        # Fallback to local storage if django-storages is not available
        MEDIA_URL = '/media/'
        MEDIA_ROOT = BASE_DIR / 'media'
else:
    # Fallback to local storage
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'

# Email configuration - Use console backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@digisolai.ca')

# CORS Settings - Production only
CORS_ALLOWED_ORIGINS = [
    'https://www.digisolai.ca',
    'https://digisolai.ca',
    'https://digisolai.netlify.app',
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

# Additional CORS settings for better preflight handling
CORS_ALLOW_ALL_HEADERS = True

# Ensure OPTIONS requests are handled properly
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Allow all common headers including preflight headers
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'access-control-request-method',
    'access-control-request-headers',
]

CORS_EXPOSE_HEADERS = [
    'content-type',
    'content-length',
    'content-disposition',
]

# Important: Set preflight max age and ensure proper handling
CORS_PREFLIGHT_MAX_AGE = 86400  # 24 hours
CORS_URLS_REGEX = r'^api/.*$'

# Additional settings to ensure proper CORS handling
# CORS_REPLACE_HTTPS_REFERER = True  # Removed - deprecated setting

# CSRF trusted origins (needed for some auth flows; safe to include wildcards)
CSRF_TRUSTED_ORIGINS = os.environ.get(
    'CSRF_TRUSTED_ORIGINS',
    'https://*.digisolai.ca,https://*.netlify.app,https://*.onrender.com'
).split(',')

# Redis/Celery configuration
REDIS_URL = os.environ.get('REDIS_URL')
if REDIS_URL:
    CELERY_BROKER_URL = REDIS_URL
    CELERY_RESULT_BACKEND = REDIS_URL
    # Celery configuration for production
    CELERY_ACCEPT_CONTENT = ['json']
    CELERY_TASK_SERIALIZER = 'json'
    CELERY_RESULT_SERIALIZER = 'json'
    CELERY_TIMEZONE = 'America/Denver'
    CELERY_TASK_TRACK_STARTED = True
    CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes
    CELERY_WORKER_PREFETCH_MULTIPLIER = 1
    CELERY_WORKER_MAX_TASKS_PER_CHILD = 1000
else:
    CELERY_BROKER_URL = 'memory://'
    CELERY_RESULT_BACKEND = 'rpc://'

# Google Analytics Settings
GOOGLE_ANALYTICS_ID = os.environ.get('GOOGLE_ANALYTICS_ID')
GOOGLE_ANALYTICS_MEASUREMENT_ID = os.environ.get('GOOGLE_ANALYTICS_MEASUREMENT_ID')

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
    'USERNAME_FIELD': 'email',
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