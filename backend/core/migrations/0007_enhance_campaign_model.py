# Generated manually for enhanced Campaign model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_alter_brandprofile_logo_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='campaign',
            name='objective',
            field=models.TextField(blank=True, help_text="What is the campaign trying to achieve? (e.g., 'Lead Generation', 'Brand Awareness', 'Customer Retention')", null=True),
        ),
        migrations.AddField(
            model_name='campaign',
            name='budget_allocated',
            field=models.DecimalField(decimal_places=2, default=0.0, help_text='Total budget allocated for this campaign', max_digits=10),
        ),
        migrations.AddField(
            model_name='campaign',
            name='target_audience_description',
            field=models.TextField(blank=True, help_text='Description of who the campaign is targeting', null=True),
        ),
        migrations.AddField(
            model_name='campaign',
            name='channel_details',
            field=models.JSONField(blank=True, default=dict, help_text="Channel-specific settings (e.g., {'email_subject_line': 'X', 'social_hashtags': ['#Y']})"),
        ),
        migrations.AddField(
            model_name='campaign',
            name='expected_roi',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='Expected Return on Investment (e.g., 1.5 for 150%)', max_digits=5, null=True),
        ),
        migrations.AddField(
            model_name='campaign',
            name='kpis',
            field=models.JSONField(blank=True, default=dict, help_text="Key Performance Indicators (e.g., {'open_rate': 0.2, 'click_through_rate': 0.05, 'conversions': 100})"),
        ),
        migrations.AddField(
            model_name='campaign',
            name='notes',
            field=models.TextField(blank=True, help_text='General campaign notes and observations', null=True),
        ),
    ] 