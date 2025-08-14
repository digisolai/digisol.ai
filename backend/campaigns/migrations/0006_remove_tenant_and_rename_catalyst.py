# Generated manually to fix tenant and catalyst references

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('campaigns', '0005_remove_tenant_field'),
    ]

    operations = [
        # Remove tenant fields
        migrations.RemoveField(
            model_name='campaignaudience',
            name='tenant',
        ),
        migrations.RemoveField(
            model_name='campaigntemplate',
            name='tenant',
        ),
        
        # Rename Catalyst to Optimizer fields
        migrations.RenameField(
            model_name='marketingcampaign',
            old_name='catalyst_health_score',
            new_name='optimizer_health_score',
        ),
        migrations.RenameField(
            model_name='marketingcampaign',
            old_name='catalyst_recommendations',
            new_name='optimizer_recommendations',
        ),
        migrations.RenameField(
            model_name='campaignstep',
            old_name='catalyst_optimized',
            new_name='optimizer_optimized',
        ),
        migrations.RenameField(
            model_name='campaignstep',
            old_name='catalyst_suggestions',
            new_name='optimizer_suggestions',
        ),
        migrations.RenameField(
            model_name='campaignaudience',
            old_name='catalyst_score',
            new_name='optimizer_score',
        ),
        migrations.RenameField(
            model_name='campaignaudience',
            old_name='catalyst_recommendations',
            new_name='optimizer_recommendations',
        ),
        
        # Rename CatalystInsight model to OptimizerInsight
        migrations.RenameModel(
            old_name='CatalystInsight',
            new_name='OptimizerInsight',
        ),
    ]
