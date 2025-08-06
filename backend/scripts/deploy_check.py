#!/usr/bin/env python3
"""
Deployment check script to verify all requirements are met before deployment.
"""

import os
import sys
import subprocess
from pathlib import Path

def check_environment_variables():
    """Check if all required environment variables are set."""
    required_vars = [
        'SECRET_KEY',
        'ALLOWED_HOSTS',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'EMAIL_HOST',
        'EMAIL_HOST_USER',
        'EMAIL_HOST_PASSWORD',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_STORAGE_BUCKET_NAME',
        'OPENAI_API_KEY',
        'STRIPE_SECRET_KEY',
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        return False
    else:
        print("✅ All required environment variables are set")
        return True

def check_secret_key_strength():
    """Check if SECRET_KEY is strong enough."""
    secret_key = os.environ.get('SECRET_KEY', '')
    if len(secret_key) < 50:
        print(f"❌ SECRET_KEY is too short ({len(secret_key)} characters). Minimum 50 required.")
        return False
    elif secret_key.startswith('django-insecure-'):
        print("❌ SECRET_KEY appears to be the default Django key. Generate a new one.")
        return False
    else:
        print("✅ SECRET_KEY is strong enough")
        return True

def check_database_connection():
    """Check if database connection works."""
    try:
        import django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_production')
        django.setup()
        
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def check_static_files():
    """Check if static files can be collected."""
    try:
        result = subprocess.run(
            ['python', 'manage.py', 'collectstatic', '--dry-run'],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent
        )
        if result.returncode == 0:
            print("✅ Static files collection check passed")
            return True
        else:
            print(f"❌ Static files collection failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Static files check failed: {e}")
        return False

def check_migrations():
    """Check if all migrations are applied."""
    try:
        result = subprocess.run(
            ['python', 'manage.py', 'showmigrations'],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent
        )
        if result.returncode == 0:
            print("✅ Migration check passed")
            return True
        else:
            print(f"❌ Migration check failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Migration check failed: {e}")
        return False

def check_security_settings():
    """Check security-related settings."""
    try:
        import django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_production')
        django.setup()
        
        from django.conf import settings
        
        checks = [
            ('DEBUG', not settings.DEBUG, "DEBUG should be False in production"),
            ('SECURE_SSL_REDIRECT', settings.SECURE_SSL_REDIRECT, "SSL redirect should be enabled"),
            ('SESSION_COOKIE_SECURE', settings.SESSION_COOKIE_SECURE, "Secure session cookies should be enabled"),
            ('CSRF_COOKIE_SECURE', settings.CSRF_COOKIE_SECURE, "Secure CSRF cookies should be enabled"),
        ]
        
        all_passed = True
        for setting_name, condition, message in checks:
            if condition:
                print(f"✅ {setting_name}: {message}")
            else:
                print(f"❌ {setting_name}: {message}")
                all_passed = False
        
        return all_passed
    except Exception as e:
        print(f"❌ Security settings check failed: {e}")
        return False

def main():
    """Run all deployment checks."""
    print("🔍 Running deployment checks...")
    print("=" * 50)
    
    checks = [
        ("Environment Variables", check_environment_variables),
        ("Secret Key Strength", check_secret_key_strength),
        ("Database Connection", check_database_connection),
        ("Static Files", check_static_files),
        ("Migrations", check_migrations),
        ("Security Settings", check_security_settings),
    ]
    
    results = []
    for check_name, check_func in checks:
        print(f"\n📋 {check_name}:")
        try:
            result = check_func()
            results.append((check_name, result))
        except Exception as e:
            print(f"❌ {check_name} check failed with error: {e}")
            results.append((check_name, False))
    
    print("\n" + "=" * 50)
    print("📊 DEPLOYMENT CHECK SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for check_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {check_name}")
    
    print(f"\nOverall: {passed}/{total} checks passed")
    
    if passed == total:
        print("🎉 All checks passed! Ready for deployment.")
        return 0
    else:
        print("⚠️  Some checks failed. Please fix the issues before deploying.")
        return 1

if __name__ == '__main__':
    sys.exit(main()) 