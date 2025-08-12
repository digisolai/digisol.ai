#!/usr/bin/env python3
"""
Test Redis connection and Celery configuration
"""
import os
import sys
import django
import redis
from celery import Celery

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from django.conf import settings

def test_redis_connection():
    """Test Redis connection"""
    print("🔍 Testing Redis Connection")
    print("=" * 50)
    
    redis_url = getattr(settings, 'REDIS_URL', None)
    print(f"📡 Redis URL: {redis_url}")
    
    if not redis_url or redis_url == 'memory://':
        print("❌ Redis not configured - using memory broker")
        return False
    
    try:
        # Test Redis connection
        r = redis.from_url(redis_url)
        r.ping()
        print("✅ Redis connection successful!")
        
        # Test basic operations
        r.set('test_key', 'test_value', ex=60)
        value = r.get('test_key')
        if value == b'test_value':
            print("✅ Redis read/write operations successful!")
        else:
            print("❌ Redis read/write operations failed!")
            return False
        
        # Clean up
        r.delete('test_key')
        print("✅ Redis cleanup successful!")
        return True
        
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False

def test_celery_configuration():
    """Test Celery configuration"""
    print("\n🔍 Testing Celery Configuration")
    print("=" * 50)
    
    broker_url = getattr(settings, 'CELERY_BROKER_URL', None)
    result_backend = getattr(settings, 'CELERY_RESULT_BACKEND', None)
    
    print(f"📡 Broker URL: {broker_url}")
    print(f"📡 Result Backend: {result_backend}")
    
    if broker_url and broker_url != 'memory://':
        print("✅ Celery configured with Redis")
        return True
    else:
        print("⚠️  Celery using memory broker (not suitable for production)")
        return False

def test_celery_app():
    """Test Celery app creation"""
    print("\n🔍 Testing Celery App")
    print("=" * 50)
    
    try:
        from digisol_ai.celery import app
        print("✅ Celery app imported successfully!")
        
        # Test basic task
        @app.task
        def test_task():
            return "Hello from Celery!"
        
        print("✅ Test task created successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Celery app test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Redis and Celery Configuration Test")
    print("=" * 60)
    
    redis_success = test_redis_connection()
    celery_config_success = test_celery_configuration()
    celery_app_success = test_celery_app()
    
    print("\n" + "=" * 60)
    print("🏁 Test Results")
    print("=" * 60)
    
    if redis_success and celery_config_success and celery_app_success:
        print("✅ All tests passed! Redis and Celery are properly configured.")
        print("\n💡 Your production deployment will have:")
        print("   - Redis for task queuing and caching")
        print("   - Celery workers for background tasks")
        print("   - Proper async processing capabilities")
    else:
        print("⚠️  Some tests failed. Check your configuration.")
        
        if not redis_success:
            print("   - Redis connection failed")
        if not celery_config_success:
            print("   - Celery not configured with Redis")
        if not celery_app_success:
            print("   - Celery app creation failed")
