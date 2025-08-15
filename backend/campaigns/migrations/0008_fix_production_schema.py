# Generated manually to fix production schema issues

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('campaigns', '0007_auto_20250814_1840'),
    ]

    operations = [
        # Add missing fields to MarketingCampaign
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
        
        # Fix CampaignStep fields
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
        
        # Add missing models if they don't exist
        migrations.CreateModel(
            name='OptimizerInsight',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ('insight_type', models.CharField(max_length=50)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('recommendation', models.TextField()),
                ('priority', models.CharField(max_length=20)),
                ('predicted_impact', models.DecimalField(decimal_places=2, max_digits=5)),
                ('confidence_score', models.DecimalField(decimal_places=2, max_digits=5)),
                ('is_actioned', models.BooleanField(default=False)),
                ('is_dismissed', models.BooleanField(default=False)),
                ('action_taken', models.TextField(blank=True)),
                ('context_data', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('campaign', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='campaigns.marketingcampaign')),
                ('step', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='campaigns.campaignstep')),
            ],
        ),
        migrations.CreateModel(
            name='CampaignPerformance',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ('date', models.DateField()),
                ('hour', models.IntegerField(blank=True, null=True)),
                ('impressions', models.IntegerField(default=0)),
                ('clicks', models.IntegerField(default=0)),
                ('conversions', models.IntegerField(default=0)),
                ('revenue', models.DecimalField(decimal_places=2, max_digits=10, default=0)),
                ('cost', models.DecimalField(decimal_places=2, max_digits=10, default=0)),
                ('opens', models.IntegerField(default=0)),
                ('bounces', models.IntegerField(default=0)),
                ('unsubscribes', models.IntegerField(default=0)),
                ('ctr', models.DecimalField(decimal_places=4, max_digits=6, default=0)),
                ('cpc', models.DecimalField(decimal_places=2, max_digits=6, default=0)),
                ('cpm', models.DecimalField(decimal_places=2, max_digits=8, default=0)),
                ('conversion_rate', models.DecimalField(decimal_places=4, max_digits=6, default=0)),
                ('roi', models.DecimalField(decimal_places=4, max_digits=8, default=0)),
                ('metadata', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('campaign', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='campaigns.marketingcampaign')),
                ('step', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='campaigns.campaignstep')),
            ],
        ),
        migrations.CreateModel(
            name='CampaignAudience',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('segment_type', models.CharField(max_length=50)),
                ('criteria', models.JSONField(default=dict)),
                ('filters', models.JSONField(default=dict)),
                ('estimated_size', models.IntegerField(default=0)),
                ('actual_size', models.IntegerField(default=0)),
                ('engagement_rate', models.DecimalField(decimal_places=4, max_digits=6, default=0)),
                ('conversion_rate', models.DecimalField(decimal_places=4, max_digits=6, default=0)),
                ('optimizer_score', models.DecimalField(decimal_places=2, max_digits=5, default=0)),
                ('optimizer_recommendations', models.JSONField(default=dict)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='accounts.customuser')),
            ],
        ),
        migrations.CreateModel(
            name='CampaignTemplate',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('category', models.CharField(max_length=100)),
                ('campaign_data', models.JSONField(default=dict)),
                ('steps_data', models.JSONField(default=dict)),
                ('settings', models.JSONField(default=dict)),
                ('usage_count', models.IntegerField(default=0)),
                ('rating', models.DecimalField(decimal_places=2, max_digits=3, default=0)),
                ('is_public', models.BooleanField(default=False)),
                ('is_featured', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='accounts.customuser')),
            ],
        ),
    ]
