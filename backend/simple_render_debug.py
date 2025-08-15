#!/usr/bin/env python
"""
Simple Render diagnostic script - no virtual environment assumptions
"""
import os
import sys
import traceback

def check_basic_environment():
    """Check basic environment setup"""
    print("🔍 Checking basic environment...")
    
    # Check Python version
    print(f"✅ Python version: {sys.version}")
    
    # Check current directory
    print(f"✅ Current directory: {os.getcwd()}")
    
    # Check if we can find manage.py
    if os.path.exists('manage.py'):
        print("✅ manage.py found")
    else:
        print("❌ manage.py not found in current directory")
        return False
    
    return True

def check_environment_variables():
    """Check environment variables"""
    print("\n🔍 Checking environment variables...")
    
    required_vars = ['SECRET_KEY', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST']
    missing_vars = []
    
    for var in required_vars:
        value = os.environ.get(var)
        if value:
            print(f"✅ {var}: {value[:10]}...")
        else:
            print(f"❌ {var}: MISSING")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"⚠️  Missing variables: {missing_vars}")
        return False
    
    return True

def check_django_setup():
    """Check if Django can be set up"""
    print("\n🔍 Checking Django setup...")
    
    try:
        # Set Django settings
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
        
        # Try to import Django
        import django
        print(f"✅ Django version: {django.get_version()}")
        
        # Try to set up Django
        django.setup()
        print("✅ Django setup successful")
        
        return True
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        traceback.print_exc()
        return False

def check_database():
    """Check database connection"""
    print("\n🔍 Checking database connection...")
    
    try:
        from django.db import connection
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT version()")
            version = cursor.fetchone()
            print(f"✅ Database connected: {version[0][:50]}...")
        
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        traceback.print_exc()
        return False

def check_campaigns_model():
    """Check if campaigns model works"""
    print("\n🔍 Checking campaigns model...")
    
    try:
        from campaigns.models import MarketingCampaign
        
        # Try to count campaigns
        count = MarketingCampaign.objects.count()
        print(f"✅ Campaigns table accessible, count: {count}")
        
        return True
    except Exception as e:
        print(f"❌ Campaigns model error: {e}")
        traceback.print_exc()
        return False

def check_campaigns_serializer():
    """Check campaigns serializer"""
    print("\n🔍 Checking campaigns serializer...")
    
    try:
        from campaigns.models import MarketingCampaign
        from campaigns.serializers import MarketingCampaignSerializer
        
        # Get first campaign or create one
        campaign = MarketingCampaign.objects.first()
        if not campaign:
            campaign = MarketingCampaign.objects.create(
                name="Test Campaign",
                campaign_type="email",
                objective="leads",
                status="Draft"
            )
            print("✅ Created test campaign")
        
        # Test serializer
        serializer = MarketingCampaignSerializer(campaign)
        data = serializer.data
        print(f"✅ Serializer works: {data.get('name', 'Unknown')}")
        
        # Clean up if we created a test campaign
        if campaign.name == "Test Campaign":
            campaign.delete()
            print("✅ Test campaign cleaned up")
        
        return True
    except Exception as e:
        print(f"❌ Serializer error: {e}")
        traceback.print_exc()
        return False

def test_endpoint():
    """Test the actual endpoint"""
    print("\n🔍 Testing campaigns endpoint...")
    
    try:
        from django.test import Client
        
        client = Client()
        response = client.get('/api/campaigns/campaigns/')
        
        print(f"✅ Endpoint response: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Endpoint working correctly!")
            return True
        else:
            print(f"❌ Endpoint returned {response.status_code}")
            print(f"Response content: {response.content[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Endpoint test failed: {e}")
        traceback.print_exc()
        return False

def main():
    """Run all checks"""
    print("🚀 Simple Render Diagnostic for DigiSol.AI")
    print("=" * 50)
    
    checks = [
        ("Basic Environment", check_basic_environment),
        ("Environment Variables", check_environment_variables),
        ("Django Setup", check_django_setup),
        ("Database Connection", check_database),
        ("Campaigns Model", check_campaigns_model),
        ("Campaigns Serializer", check_campaigns_serializer),
        ("Endpoint Test", test_endpoint),
    ]
    
    results = []
    for check_name, check_func in checks:
        print(f"\n🧪 Running {check_name}...")
        try:
            result = check_func()
            results.append((check_name, result))
        except Exception as e:
            print(f"❌ {check_name} failed with exception: {e}")
            traceback.print_exc()
            results.append((check_name, False))
    
    print("\n" + "=" * 50)
    print("📊 Diagnostic Results:")
    for check_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {check_name}: {status}")
    
    all_passed = all(result for _, result in results)
    if all_passed:
        print("\n🎉 All checks passed! The campaigns endpoint should work.")
    else:
        print("\n⚠️  Some checks failed. Check the errors above.")
        print("\n💡 Next steps:")
        print("1. Check Render logs for more detailed error messages")
        print("2. Verify all environment variables are set correctly")
        print("3. Check if the database migrations have been applied")

if __name__ == "__main__":
    main()
