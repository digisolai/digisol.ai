#!/usr/bin/env python
"""
Custom migration script to fix missing fields in campaigns table
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings')
django.setup()

from django.db import connection
from django.db import migrations

def add_missing_fields(apps, schema_editor):
    """Add missing fields to the campaigns table"""
    with connection.cursor() as cursor:
        # Add missing fields one by one
        try:
            cursor.execute("""
                ALTER TABLE campaigns_marketingcampaign 
                ADD COLUMN last_optimized TIMESTAMP NULL
            """)
            print("✅ Added last_optimized field")
        except Exception as e:
            print(f"⚠️  last_optimized field already exists or error: {e}")
        
        try:
            cursor.execute("""
                ALTER TABLE campaigns_marketingcampaign 
                ADD COLUMN performance_metrics TEXT DEFAULT '{}'
            """)
            print("✅ Added performance_metrics field")
        except Exception as e:
            print(f"⚠️  performance_metrics field already exists or error: {e}")
        
        try:
            cursor.execute("""
                ALTER TABLE campaigns_marketingcampaign 
                ADD COLUMN created_by_id INTEGER NULL
            """)
            print("✅ Added created_by_id field")
        except Exception as e:
            print(f"⚠️  created_by_id field already exists or error: {e}")

def remove_missing_fields(apps, schema_editor):
    """Remove the added fields (reverse migration)"""
    with connection.cursor() as cursor:
        try:
            cursor.execute("ALTER TABLE campaigns_marketingcampaign DROP COLUMN last_optimized")
        except:
            pass
        try:
            cursor.execute("ALTER TABLE campaigns_marketingcampaign DROP COLUMN performance_metrics")
        except:
            pass
        try:
            cursor.execute("ALTER TABLE campaigns_marketingcampaign DROP COLUMN created_by_id")
        except:
            pass

class Migration(migrations.Migration):
    dependencies = [
        ('campaigns', '0007_auto_20250814_1840'),
    ]

    operations = [
        migrations.RunPython(add_missing_fields, remove_missing_fields),
    ]

if __name__ == "__main__":
    # Run the migration directly
    print("🔧 Running custom migration to fix missing fields...")
    add_missing_fields(None, None)
    print("✅ Migration completed!")
