#!/usr/bin/env python
"""
Script to fix campaigns database issues on live deployment
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from django.db import connection
from campaigns.models import MarketingCampaign
from django.core.management import execute_from_command_line

def fix_campaigns_database():
    """Fix campaigns database issues"""
    print("🔧 Fixing campaigns database...")
    
    try:
        # Check if campaigns table exists
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='campaigns_marketingcampaign';
            """)
            table_exists = cursor.fetchone()
            
            if not table_exists:
                print("❌ Campaigns table doesn't exist. Creating it...")
                execute_from_command_line(['manage.py', 'migrate', 'campaigns'])
            else:
                print("✅ Campaigns table exists")
                
                # Check table structure
                cursor.execute("PRAGMA table_info(campaigns_marketingcampaign);")
                columns = cursor.fetchall()
                column_names = [col[1] for col in columns]
                
                print(f"📋 Table columns: {column_names}")
                
                # Check for problematic columns
                if 'tenant_id' in column_names:
                    print("⚠️  Found tenant_id column - this should be removed")
                    cursor.execute("ALTER TABLE campaigns_marketingcampaign DROP COLUMN tenant_id;")
                    print("✅ Removed tenant_id column")
                
                if 'catalyst_health_score' in column_names:
                    print("⚠️  Found catalyst_health_score column - renaming to optimizer_health_score")
                    cursor.execute("ALTER TABLE campaigns_marketingcampaign RENAME COLUMN catalyst_health_score TO optimizer_health_score;")
                    print("✅ Renamed catalyst_health_score to optimizer_health_score")
                
                if 'catalyst_optimized' in column_names:
                    print("⚠️  Found catalyst_optimized column - renaming to optimizer_optimized")
                    cursor.execute("ALTER TABLE campaigns_marketingcampaign RENAME COLUMN catalyst_optimized TO optimizer_optimized;")
                    print("✅ Renamed catalyst_optimized to optimizer_optimized")
        
        # Test creating a campaign
        print("🧪 Testing campaign creation...")
        campaign = MarketingCampaign.objects.create(
            name="Test Campaign",
            campaign_type="email",
            objective="leads",
            status="Draft"
        )
        print(f"✅ Successfully created campaign: {campaign.name} (ID: {campaign.id})")
        
        # Clean up test campaign
        campaign.delete()
        print("🧹 Cleaned up test campaign")
        
        print("🎉 Database fix completed successfully!")
        
    except Exception as e:
        print(f"❌ Error fixing database: {e}")
        return False
    
    return True

if __name__ == "__main__":
    fix_campaigns_database()
