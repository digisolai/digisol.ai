#!/usr/bin/env python
"""
Production Setup Verification Script
This script verifies that all production services are working correctly.
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
    django.setup()

def check_database():
    """Check database connection and type"""
    print("🔍 Checking database connection...")
    try:
        from django.db import connection
        from django.conf import settings
        
        # Check database engine
        engine = settings.DATABASES['default']['ENGINE']
        print(f"✅ Database engine: {engine}")
        
        # Test connection
        with connection.cursor() as cursor:
            if 'postgresql' in engine:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()
                print(f"✅ PostgreSQL version: {version[0]}")
            else:
                cursor.execute("SELECT sqlite_version();")
                version = cursor.fetchone()
                print(f"✅ SQLite version: {version[0]}")
        
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def check_redis():
    """Check Redis connection"""
    print("🔍 Checking Redis connection...")
    try:
        import redis
        from django.conf import settings
        
        redis_url = getattr(settings, 'REDIS_URL', None)
        if not redis_url:
            print("⚠️  REDIS_URL not configured")
            return False
        
        r = redis.from_url(redis_url)
        r.ping()
        print("✅ Redis connection successful")
        return True
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False

def check_celery():
    """Check Celery configuration"""
    print("🔍 Checking Celery configuration...")
    try:
        from django.conf import settings
        
        broker_url = getattr(settings, 'CELERY_BROKER_URL', None)
        result_backend = getattr(settings, 'CELERY_RESULT_BACKEND', None)
        
        if not broker_url:
            print("❌ CELERY_BROKER_URL not configured")
            return False
        
        print(f"✅ Celery broker: {broker_url}")
        print(f"✅ Celery result backend: {result_backend}")
        return True
    except Exception as e:
        print(f"❌ Celery configuration failed: {e}")
        return False

def check_s3():
    """Check S3 configuration"""
    print("🔍 Checking S3 configuration...")
    try:
        from django.conf import settings
        
        aws_access_key = getattr(settings, 'AWS_ACCESS_KEY_ID', None)
        aws_secret_key = getattr(settings, 'AWS_SECRET_ACCESS_KEY', None)
        bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
        
        if aws_access_key and aws_secret_key and bucket_name:
            print("✅ S3 credentials configured")
            print(f"✅ S3 bucket: {bucket_name}")
            
            # Check storage backend
            storage_backend = getattr(settings, 'DEFAULT_FILE_STORAGE', None)
            if storage_backend and 's3' in storage_backend:
                print("✅ S3 storage backend active")
                return True
            else:
                print("⚠️  S3 storage backend not active")
                return False
        else:
            print("⚠️  S3 credentials not fully configured")
            return False
    except Exception as e:
        print(f"❌ S3 configuration check failed: {e}")
        return False

def check_environment():
    """Check environment variables"""
    print("🔍 Checking environment variables...")
    required_vars = [
        'SECRET_KEY',
        'ALLOWED_HOSTS',
        'DATABASE_URL',
        'REDIS_URL',
    ]
    
    optional_vars = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_STORAGE_BUCKET_NAME',
        'GOOGLE_GEMINI_API_KEY',
    ]
    
    all_good = True
    
    for var in required_vars:
        value = os.environ.get(var)
        if value:
            print(f"✅ {var}: Configured")
        else:
            print(f"❌ {var}: Missing")
            all_good = False
    
    for var in optional_vars:
        value = os.environ.get(var)
        if value:
            print(f"✅ {var}: Configured")
        else:
            print(f"⚠️  {var}: Not configured (optional)")
    
    return all_good

def check_superuser():
    """Check if superuser exists"""
    print("🔍 Checking superuser...")
    try:
        from accounts.models import CustomUser
        
        superusers = CustomUser.objects.filter(is_superuser=True)
        if superusers.exists():
            print(f"✅ Superuser exists: {superusers.first().email}")
            return True
        else:
            print("⚠️  No superuser found")
            return False
    except Exception as e:
        print(f"❌ Superuser check failed: {e}")
        return False

def check_health_endpoints():
    """Check if health endpoints are accessible"""
    print("🔍 Checking health endpoints...")
    try:
        import requests
        
        base_url = "https://digisol-backend.onrender.com"
        endpoints = [
            "/health/",
            "/api/core/health/",
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{base_url}{endpoint}", timeout=10)
                if response.status_code == 200:
                    print(f"✅ {endpoint}: Accessible")
                else:
                    print(f"⚠️  {endpoint}: Status {response.status_code}")
            except Exception as e:
                print(f"❌ {endpoint}: {e}")
        
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def main():
    """Main verification process"""
    print("🚀 DigiSol.AI Production Setup Verification")
    print("=" * 50)
    
    # Setup Django
    setup_django()
    
    # Run all checks
    checks = [
        ("Environment Variables", check_environment),
        ("Database", check_database),
        ("Redis", check_redis),
        ("Celery", check_celery),
        ("S3 Configuration", check_s3),
        ("Superuser", check_superuser),
        ("Health Endpoints", check_health_endpoints),
    ]
    
    results = {}
    for name, check_func in checks:
        print(f"\n📋 {name}")
        print("-" * 30)
        try:
            results[name] = check_func()
        except Exception as e:
            print(f"❌ {name} check failed with exception: {e}")
            results[name] = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} checks passed")
    
    if passed == total:
        print("🎉 All checks passed! Production setup is complete.")
    else:
        print("⚠️  Some checks failed. Review the issues above.")
    
    return passed == total

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
