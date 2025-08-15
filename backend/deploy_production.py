#!/usr/bin/env python
"""
Production deployment script for DigiSol.AI campaigns
This script fixes common production issues and makes the campaigns page ready for deployment
"""
import os
import sys
import django
import traceback

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')

def setup_django():
    """Set up Django for production"""
    try:
        django.setup()
        print("✅ Django setup successful")
        return True
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return False

def run_migrations():
    """Run database migrations"""
    try:
        from django.core.management import execute_from_command_line
        
        print("🔄 Running migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migrations completed")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def create_sample_campaign():
    """Create a sample campaign for testing"""
    try:
        from campaigns.models import MarketingCampaign
        
        # Check if we already have campaigns
        if MarketingCampaign.objects.count() > 0:
            print("✅ Campaigns already exist")
            return True
        
        # Create a sample campaign
        campaign = MarketingCampaign.objects.create(
            name="Sample Marketing Campaign",
            description="This is a sample campaign for testing the production environment",
            campaign_type="email",
            objective="leads",
            status="Draft",
            budget=1000.00,
            target_roi=2.5,
            auto_optimization_enabled=True
        )
        
        print(f"✅ Created sample campaign: {campaign.name}")
        return True
    except Exception as e:
        print(f"❌ Failed to create sample campaign: {e}")
        return False

def test_endpoints():
    """Test the campaign endpoints"""
    try:
        from django.test import Client
        
        client = Client()
        
        # Test the simple campaigns endpoint
        response = client.get('/api/campaigns/simple/campaigns/')
        if response.status_code == 200:
            print("✅ Simple campaigns endpoint working")
        else:
            print(f"❌ Simple campaigns endpoint failed: {response.status_code}")
            return False
        
        # Test the stats endpoint
        response = client.get('/api/campaigns/simple/campaigns/stats/')
        if response.status_code == 200:
            print("✅ Campaigns stats endpoint working")
        else:
            print(f"❌ Campaigns stats endpoint failed: {response.status_code}")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Endpoint testing failed: {e}")
        return False

def check_database():
    """Check database connection and schema"""
    try:
        from django.db import connection
        from campaigns.models import MarketingCampaign
        
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Test campaigns table
        count = MarketingCampaign.objects.count()
        print(f"✅ Database connection successful, campaigns count: {count}")
        
        return True
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

def main():
    """Run the production deployment"""
    print("🚀 DigiSol.AI Production Deployment")
    print("=" * 50)
    
    steps = [
        ("Django Setup", setup_django),
        ("Database Check", check_database),
        ("Run Migrations", run_migrations),
        ("Create Sample Campaign", create_sample_campaign),
        ("Test Endpoints", test_endpoints),
    ]
    
    results = []
    for step_name, step_func in steps:
        print(f"\n🔄 Running {step_name}...")
        try:
            result = step_func()
            results.append((step_name, result))
        except Exception as e:
            print(f"❌ {step_name} failed with exception: {e}")
            traceback.print_exc()
            results.append((step_name, False))
    
    print("\n" + "=" * 50)
    print("📊 Deployment Results:")
    for step_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {step_name}: {status}")
    
    all_passed = all(result for _, result in results)
    if all_passed:
        print("\n🎉 Production deployment successful!")
        print("\n✅ Your campaigns page should now work at:")
        print("   https://digisolai.ca/campaigns")
        print("\n✅ API endpoints available:")
        print("   - https://digisol-backend.onrender.com/api/campaigns/simple/campaigns/")
        print("   - https://digisol-backend.onrender.com/api/campaigns/simple/campaigns/stats/")
    else:
        print("\n⚠️  Some deployment steps failed. Check the errors above.")
        print("\n💡 Next steps:")
        print("1. Check Render logs for detailed error messages")
        print("2. Verify environment variables are set correctly")
        print("3. Try running the deployment script again")

if __name__ == "__main__":
    main()
