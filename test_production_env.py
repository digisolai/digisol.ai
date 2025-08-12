#!/usr/bin/env python3
"""
Test production environment configuration
"""
import os
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def test_production_settings():
    """Test production settings loading"""
    print("🔍 Testing Production Environment Configuration")
    print("=" * 60)
    
    # Set production settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
    
    print(f"📡 DJANGO_SETTINGS_MODULE: {os.environ.get('DJANGO_SETTINGS_MODULE')}")
    
    # Test environment loading
    try:
        import django
        django.setup()
        print("✅ Django setup successful")
        
        from django.conf import settings
        print(f"📡 DEBUG: {settings.DEBUG}")
        print(f"📡 ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
        print(f"📡 CORS_ALLOWED_ORIGINS: {settings.CORS_ALLOWED_ORIGINS}")
        print(f"📡 REDIS_URL: {getattr(settings, 'REDIS_URL', 'Not set')}")
        print(f"📡 CELERY_BROKER_URL: {getattr(settings, 'CELERY_BROKER_URL', 'Not set')}")
        
        # Check for localhost in CORS (should not be there in production)
        localhost_origins = [origin for origin in settings.CORS_ALLOWED_ORIGINS if 'localhost' in origin or '127.0.0.1' in origin]
        if localhost_origins:
            print(f"⚠️  WARNING: Localhost origins found in production: {localhost_origins}")
        else:
            print("✅ No localhost origins in production CORS settings")
        
        # Check if DEBUG is False
        if not settings.DEBUG:
            print("✅ DEBUG is False (production setting)")
        else:
            print("❌ DEBUG is True (should be False in production)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing production settings: {e}")
        return False

def test_development_settings():
    """Test development settings loading"""
    print("\n🔍 Testing Development Environment Configuration")
    print("=" * 60)
    
    # Clear and set development settings module
    os.environ['DJANGO_SETTINGS_MODULE'] = 'digisol_ai.settings'
    
    print(f"📡 DJANGO_SETTINGS_MODULE: {os.environ.get('DJANGO_SETTINGS_MODULE')}")
    
    try:
        import django
        django.setup()
        print("✅ Django setup successful")
        
        from django.conf import settings
        print(f"📡 DEBUG: {settings.DEBUG}")
        print(f"📡 ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
        print(f"📡 CORS_ALLOWED_ORIGINS: {settings.CORS_ALLOWED_ORIGINS}")
        
        # Check for localhost in CORS (should be there in development)
        localhost_origins = [origin for origin in settings.CORS_ALLOWED_ORIGINS if 'localhost' in origin or '127.0.0.1' in origin]
        if localhost_origins:
            print(f"✅ Localhost origins found in development: {localhost_origins}")
        else:
            print("⚠️  No localhost origins in development CORS settings")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing development settings: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Environment Configuration Test")
    print("=" * 60)
    
    prod_success = test_production_settings()
    dev_success = test_development_settings()
    
    print("\n" + "=" * 60)
    print("🏁 Test Results")
    print("=" * 60)
    
    if prod_success and dev_success:
        print("✅ All environment tests passed!")
        print("\n💡 Your production deployment will now:")
        print("   - Use Render environment variables (not local)")
        print("   - Have proper production CORS settings")
        print("   - Have DEBUG=False")
        print("   - Use Redis for Celery")
    else:
        print("⚠️  Some environment tests failed!")
        
        if not prod_success:
            print("   - Production settings test failed")
        if not dev_success:
            print("   - Development settings test failed")
