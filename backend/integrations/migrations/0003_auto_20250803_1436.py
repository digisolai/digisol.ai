# Generated manually for Connectus integration enhancement - Phase 2

from django.db import migrations, models
import django.db.models.deletion


def add_new_fields_to_integrations(apps, schema_editor):
    """Add new fields to existing integrations."""
    Integration = apps.get_model('integrations', 'Integration')
    IntegrationProvider = apps.get_model('integrations', 'IntegrationProvider')
    
    # Get or create a default provider for existing integrations
    default_provider, created = IntegrationProvider.objects.get_or_create(
        name='legacy',
        defaults={
            'display_name': 'Legacy Integration',
            'category': 'other',
            'description': 'Legacy integration migrated from old system',
            'auth_type': 'api_key',
            'oauth_config': {},
            'api_endpoints': {},
            'rate_limits': {},
            'webhook_support': False,
            'webhook_events': []
        }
    )
    
    # Update existing integrations with new fields
    for integration in Integration.objects.all():
        # Set default values for new fields
        if not hasattr(integration, 'provider'):
            integration.provider = default_provider
        
        if not hasattr(integration, 'name'):
            integration.name = getattr(integration, 'service_name', 'Legacy Integration')
        
        if not hasattr(integration, 'status'):
            integration.status = 'connected' if integration.is_active else 'disconnected'
        
        if not hasattr(integration, 'auth_credentials'):
            old_api_key = getattr(integration, 'api_key', '')
            integration.auth_credentials = {'api_key': old_api_key} if old_api_key else {}
        
        if not hasattr(integration, 'settings'):
            old_settings = getattr(integration, 'settings_json', {})
            integration.settings = old_settings if old_settings else {}
        
        if not hasattr(integration, 'sync_config'):
            integration.sync_config = {
                'frequency': 'daily',
                'direction': 'inbound',
                'batch_size': 100
            }
        
        # Save the integration
        integration.save()


class Migration(migrations.Migration):

    dependencies = [
        ('integrations', '0002_auto_20250803_1435'),
    ]

    operations = [
        # Add new fields to Integration model
        migrations.AddField(
            model_name='integration',
            name='provider',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='integrations.integrationprovider'),
        ),
        migrations.AddField(
            model_name='integration',
            name='name',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='integration',
            name='status',
            field=models.CharField(choices=[('connected', 'Connected'), ('disconnected', 'Disconnected'), ('pending', 'Pending'), ('error', 'Error'), ('configuring', 'Configuring')], default='disconnected', max_length=20),
        ),
        migrations.AddField(
            model_name='integration',
            name='auth_credentials',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='integration',
            name='auth_expires_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='integration',
            name='settings',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='integration',
            name='data_mappings',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='integration',
            name='sync_config',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='integration',
            name='last_sync',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='integration',
            name='last_sync_status',
            field=models.CharField(default='unknown', max_length=20),
        ),
        migrations.AddField(
            model_name='integration',
            name='sync_error_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='integration',
            name='health_score',
            field=models.IntegerField(default=100),
        ),
        migrations.AddField(
            model_name='integration',
            name='api_calls_today',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='integration',
            name='api_calls_limit',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='integration',
            name='data_synced_today',
            field=models.IntegerField(default=0),
        ),
        
        # Run data migration
        migrations.RunPython(add_new_fields_to_integrations, reverse_code=migrations.RunPython.noop),
        
        # Make provider field required after data migration
        migrations.AlterField(
            model_name='integration',
            name='provider',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='integrations.integrationprovider'),
        ),
        migrations.AlterField(
            model_name='integration',
            name='name',
            field=models.CharField(max_length=100),
        ),
        
        # Update unique constraint
        migrations.AlterUniqueTogether(
            name='integration',
            unique_together={('provider', 'tenant', 'name')},
        ),
    ]
