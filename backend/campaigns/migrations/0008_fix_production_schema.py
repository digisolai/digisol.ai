# Generated manually to fix production schema issues

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('campaigns', '0007_auto_20250814_1840'),
    ]

    operations = [
        # Add missing fields to MarketingCampaign with proper defaults
        migrations.AddField(
            model_name='marketingcampaign',
            name='last_optimized',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='marketingcampaign',
            name='performance_metrics',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='marketingcampaign',
            name='created_by',
            field=models.ForeignKey(
                blank=True, 
                null=True, 
                on_delete=django.db.models.deletion.SET_NULL,
                to='accounts.customuser'
            ),
        ),
        
        # Fix CampaignStep fields with proper defaults
        migrations.AddField(
            model_name='campaignstep',
            name='optimizer_optimized',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='campaignstep',
            name='optimizer_suggestions',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='campaignstep',
            name='performance_score',
            field=models.DecimalField(
                blank=True, 
                decimal_places=2, 
                max_digits=5, 
                null=True
            ),
        ),
        migrations.AddField(
            model_name='campaignstep',
            name='execution_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='campaignstep',
            name='last_executed',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
