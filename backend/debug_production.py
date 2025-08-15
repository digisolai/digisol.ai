#!/usr/bin/env python
"""
Production diagnostic script for Render deployment
Run this on Render to identify the cause of 500 errors
"""
import os
import sys
import django
import traceback

# Add the current directory to Python path (Render environment)
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Set up Django with production settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')

def check_environment():
    """Check if all required environment variables are set"""
    print("🔍 Checking environment variables...")
    
    required_vars = [
        'SECRET_KEY',
        'DB_NAME',
        'DB_USER', 
        'DB_PASSWORD',
        'DB_HOST'
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.environ.get(var)
        if not value:
            missing_vars.append(var)
        else:
            # Show first few characters for security
            print(f"✅ {var}: {value[:10]}...")
    
    if missing_vars:
        print(f"❌ Missing environment variables: {missing_vars}")
        return False
    else:
        print("✅ All required environment variables are set")
        return True

def check_database_connection():
    """Test database connection"""
    print("\n🔍 Testing database connection...")
    
    try:
        django.setup()
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

def check_campaigns_table():
    """Check if campaigns table exists and is accessible"""
    print("\n🔍 Checking campaigns table...")
    
    try:
        from campaigns.models import MarketingCampaign
        
        # Try to count campaigns
        count = MarketingCampaign.objects.count()
        print(f"✅ Campaigns table accessible, count: {count}")
        
        # Check if we can create a test campaign
        test_campaign = MarketingCampaign.objects.create(
            name="Test Campaign",
            description="Test campaign for debugging",
            campaign_type="email",
            objective="leads",
            status="Draft"
        )
        print(f"✅ Test campaign created: {test_campaign.id}")
        
        # Clean up
        test_campaign.delete()
        print("✅ Test campaign cleaned up")
        
        return True
    except Exception as e:
        print(f"❌ Campaigns table error: {e}")
        traceback.print_exc()
        return False

def check_campaigns_serializer():
    """Test the campaigns serializer"""
    print("\n🔍 Testing campaigns serializer...")
    
    try:
        from campaigns.models import MarketingCampaign
        from campaigns.serializers import MarketingCampaignSerializer
        
        # Get first campaign or create one
        campaign = MarketingCampaign.objects.first()
        if not campaign:
            campaign = MarketingCampaign.objects.create(
                name="Serializer Test Campaign",
                campaign_type="email",
                objective="leads",
                status="Draft"
            )
        
        # Test serializer
        serializer = MarketingCampaignSerializer(campaign)
        data = serializer.data
        print(f"✅ Serializer works: {data.get('name', 'Unknown')}")
        
        # Clean up if we created a test campaign
        if campaign.name == "Serializer Test Campaign":
            campaign.delete()
        
        return True
    except Exception as e:
        print(f"❌ Serializer error: {e}")
        traceback.print_exc()
        return False

def check_campaigns_viewset():
    """Test the campaigns viewset"""
    print("\n🔍 Testing campaigns viewset...")
    
    try:
        from campaigns.views import MarketingCampaignViewSet
        from rest_framework.test import APIRequestFactory
        
        factory = APIRequestFactory()
        request = factory.get('/api/campaigns/campaigns/')
        
        viewset = MarketingCampaignViewSet()
        viewset.request = request
        viewset.action = 'list'
        
        response = viewset.list(request)
        print(f"✅ ViewSet works: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ ViewSet error: {e}")
        traceback.print_exc()
        return False

def check_urls():
    """Test URL routing"""
    print("\n🔍 Testing URL routing...")
    
    try:
        from django.urls import reverse
        from django.test import RequestFactory
        
        factory = RequestFactory()
        request = factory.get('/api/campaigns/campaigns/')
        
        # Test if the URL pattern exists
        try:
            url = reverse('campaign-list')
            print(f"✅ URL pattern found: {url}")
        except Exception as e:
            print(f"⚠️  URL pattern error: {e}")
        
        return True
    except Exception as e:
        print(f"❌ URL routing error: {e}")
        traceback.print_exc()
        return False

def main():
    """Run all diagnostic checks"""
    print("🚀 Production Diagnostic for DigiSol.AI")
    print("=" * 50)
    
    checks = [
        ("Environment Variables", check_environment),
        ("Database Connection", check_database_connection),
        ("Campaigns Table", check_campaigns_table),
        ("Campaigns Serializer", check_campaigns_serializer),
        ("Campaigns ViewSet", check_campaigns_viewset),
        ("URL Routing", check_urls),
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
