#!/usr/bin/env python
"""
Fix UUID field issue in SQLite database
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
import uuid

def fix_uuid_field():
    """Fix the UUID field in the campaigns table"""
    with connection.cursor() as cursor:
        try:
            # First, let's check if the id column is INTEGER
            cursor.execute("PRAGMA table_info(campaigns_marketingcampaign)")
            columns = cursor.fetchall()
            
            id_column = None
            for col in columns:
                if col[1] == 'id':
                    id_column = col
                    break
            
            if id_column and id_column[2] == 'INTEGER':
                print("⚠️  ID column is INTEGER, needs to be TEXT for UUID")
                
                # Create a new table with the correct schema
                cursor.execute("""
                    CREATE TABLE campaigns_marketingcampaign_new (
                        id TEXT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        campaign_type VARCHAR(50),
                        objective VARCHAR(50),
                        status VARCHAR(50),
                        start_date DATE,
                        end_date DATE,
                        target_audience_segment TEXT,
                        audience_criteria TEXT,
                        estimated_reach INTEGER,
                        budget DECIMAL(10,2),
                        target_roi DECIMAL(5,2),
                        auto_optimization_enabled BOOLEAN,
                        is_template BOOLEAN,
                        template_category VARCHAR(100),
                        conversion_goals TEXT,
                        optimizer_health_score INTEGER,
                        optimizer_optimized BOOLEAN,
                        optimizer_recommendations TEXT,
                        optimizer_suggestions TEXT,
                        actual_spent DECIMAL(10,2),
                        created_at DATETIME,
                        updated_at DATETIME,
                        last_optimized TIMESTAMP,
                        performance_metrics TEXT,
                        created_by_id INTEGER
                    )
                """)
                
                # Copy data from old table to new table
                cursor.execute("""
                    INSERT INTO campaigns_marketingcampaign_new 
                    SELECT 
                        id, name, description, campaign_type, objective, status,
                        start_date, end_date, target_audience_segment, audience_criteria,
                        estimated_reach, budget, target_roi, auto_optimization_enabled,
                        is_template, template_category, conversion_goals, optimizer_health_score,
                        optimizer_optimized, optimizer_recommendations, optimizer_suggestions,
                        actual_spent, created_at, updated_at, last_optimized, performance_metrics,
                        created_by_id
                    FROM campaigns_marketingcampaign
                """)
                
                # Drop old table and rename new table
                cursor.execute("DROP TABLE campaigns_marketingcampaign")
                cursor.execute("ALTER TABLE campaigns_marketingcampaign_new RENAME TO campaigns_marketingcampaign")
                
                print("✅ Successfully fixed UUID field")
            else:
                print("✅ ID column is already correct")
                
        except Exception as e:
            print(f"❌ Error fixing UUID field: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    print("🔧 Fixing UUID field in campaigns table...")
    fix_uuid_field()
    print("✅ Migration completed!")
