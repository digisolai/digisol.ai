# Generated manually to fix production schema issues

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('campaigns', '0007_auto_20250814_1840'),
    ]

    def add_field_if_not_exists(apps, schema_editor):
        """Add fields only if they don't exist"""
        db_alias = schema_editor.connection.alias
        
        # Check if fields exist before adding them
        with schema_editor.connection.cursor() as cursor:
            # Check MarketingCampaign fields
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'campaigns_marketingcampaign' 
                AND column_name IN ('last_optimized', 'performance_metrics', 'created_by_id')
            """)
            existing_marketing_fields = [row[0] for row in cursor.fetchall()]
            
            # Check CampaignStep fields
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'campaigns_campaignstep' 
                AND column_name IN ('optimizer_optimized', 'optimizer_suggestions', 'performance_score', 'execution_count', 'last_executed')
            """)
            existing_step_fields = [row[0] for row in cursor.fetchall()]
        
        # Add MarketingCampaign fields if they don't exist
        if 'last_optimized' not in existing_marketing_fields:
            cursor.execute("ALTER TABLE campaigns_marketingcampaign ADD COLUMN last_optimized TIMESTAMP NULL")
        
        if 'performance_metrics' not in existing_marketing_fields:
            cursor.execute("ALTER TABLE campaigns_marketingcampaign ADD COLUMN performance_metrics JSONB DEFAULT '{}'")
        
        if 'created_by_id' not in existing_marketing_fields:
            cursor.execute("ALTER TABLE campaigns_marketingcampaign ADD COLUMN created_by_id INTEGER NULL")
        
        # Add CampaignStep fields if they don't exist
        if 'optimizer_optimized' not in existing_step_fields:
            cursor.execute("ALTER TABLE campaigns_campaignstep ADD COLUMN optimizer_optimized BOOLEAN DEFAULT FALSE")
        
        if 'optimizer_suggestions' not in existing_step_fields:
            cursor.execute("ALTER TABLE campaigns_campaignstep ADD COLUMN optimizer_suggestions JSONB DEFAULT '{}'")
        
        if 'performance_score' not in existing_step_fields:
            cursor.execute("ALTER TABLE campaigns_campaignstep ADD COLUMN performance_score DECIMAL(5,2) NULL")
        
        if 'execution_count' not in existing_step_fields:
            cursor.execute("ALTER TABLE campaigns_campaignstep ADD COLUMN execution_count INTEGER DEFAULT 0")
        
        if 'last_executed' not in existing_step_fields:
            cursor.execute("ALTER TABLE campaigns_campaignstep ADD COLUMN last_executed TIMESTAMP NULL")

    def reverse_func(apps, schema_editor):
        """Reverse migration - remove fields if needed"""
        pass

    operations = [
        migrations.RunPython(add_field_if_not_exists, reverse_func),
    ]
