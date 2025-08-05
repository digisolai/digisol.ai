# Generated manually for Connectus integration enhancement

from django.db import migrations, models
import django.db.models.deletion
import uuid


def create_default_providers(apps, schema_editor):
    """Create default integration providers."""
    IntegrationProvider = apps.get_model('integrations', 'IntegrationProvider')
    
    providers = [
        {
            'name': 'hubspot',
            'display_name': 'HubSpot',
            'category': 'crm',
            'description': 'CRM and marketing automation platform for managing leads and customers.',
            'auth_type': 'oauth2',
            'oauth_config': {
                'scopes': ['contacts', 'companies', 'deals'],
                'authorization_url': 'https://app.hubspot.com/oauth/authorize',
                'token_url': 'https://api.hubapi.com/oauth/v1/token'
            },
            'api_endpoints': {
                'contacts': '/crm/v3/objects/contacts',
                'companies': '/crm/v3/objects/companies',
                'deals': '/crm/v3/objects/deals'
            },
            'rate_limits': {'requests_per_second': 10, 'daily_limit': 250000},
            'webhook_support': True,
            'webhook_events': ['contact.creation', 'contact.propertyChange', 'deal.stageChange']
        },
        {
            'name': 'salesforce',
            'display_name': 'Salesforce',
            'category': 'crm',
            'description': 'Enterprise CRM solution for sales, service, and marketing teams.',
            'auth_type': 'oauth2',
            'oauth_config': {
                'scopes': ['api', 'refresh_token'],
                'authorization_url': 'https://login.salesforce.com/services/oauth2/authorize',
                'token_url': 'https://login.salesforce.com/services/oauth2/token'
            },
            'api_endpoints': {
                'leads': '/services/data/v58.0/sobjects/Lead',
                'contacts': '/services/data/v58.0/sobjects/Contact',
                'opportunities': '/services/data/v58.0/sobjects/Opportunity'
            },
            'rate_limits': {'requests_per_second': 25, 'daily_limit': 150000},
            'webhook_support': True,
            'webhook_events': ['Lead', 'Contact', 'Opportunity']
        },
        {
            'name': 'mailchimp',
            'display_name': 'Mailchimp',
            'category': 'email',
            'description': 'Email marketing platform for creating and sending campaigns.',
            'auth_type': 'api_key',
            'oauth_config': {
                'required_fields': ['api_key', 'server_prefix'],
                'setup_instructions': 'Get your API key from Account > Extras > API Keys'
            },
            'api_endpoints': {
                'lists': '/3.0/lists',
                'campaigns': '/3.0/campaigns',
                'members': '/3.0/lists/{list_id}/members'
            },
            'rate_limits': {'requests_per_second': 10, 'daily_limit': 100000},
            'webhook_support': True,
            'webhook_events': ['subscribe', 'unsubscribe', 'campaign']
        },
        {
            'name': 'slack',
            'display_name': 'Slack',
            'category': 'communication',
            'description': 'Team communication and collaboration platform.',
            'auth_type': 'oauth2',
            'oauth_config': {
                'scopes': ['channels:read', 'chat:write', 'users:read'],
                'authorization_url': 'https://slack.com/oauth/v2/authorize',
                'token_url': 'https://slack.com/api/oauth.v2.access'
            },
            'api_endpoints': {
                'channels': '/api/conversations.list',
                'messages': '/api/chat.postMessage',
                'users': '/api/users.list'
            },
            'rate_limits': {'requests_per_second': 50, 'daily_limit': 1000000},
            'webhook_support': True,
            'webhook_events': ['message', 'channel_created', 'member_joined_channel']
        },
        {
            'name': 'google_ads',
            'display_name': 'Google Ads',
            'category': 'advertising',
            'description': 'Online advertising platform for Google search and display networks.',
            'auth_type': 'oauth2',
            'oauth_config': {
                'scopes': ['https://www.googleapis.com/auth/adwords'],
                'authorization_url': 'https://accounts.google.com/o/oauth2/auth',
                'token_url': 'https://oauth2.googleapis.com/token'
            },
            'api_endpoints': {
                'campaigns': '/googleads/api/v14/customers/{customer_id}/googleAds:search',
                'ad_groups': '/googleads/api/v14/customers/{customer_id}/googleAds:search',
                'keywords': '/googleads/api/v14/customers/{customer_id}/googleAds:search'
            },
            'rate_limits': {'requests_per_second': 5, 'daily_limit': 50000},
            'webhook_support': False,
            'webhook_events': []
        },
        {
            'name': 'facebook_ads',
            'display_name': 'Facebook Ads',
            'category': 'advertising',
            'description': 'Social media advertising platform for Facebook and Instagram.',
            'auth_type': 'oauth2',
            'oauth_config': {
                'scopes': ['ads_management', 'ads_read', 'business_management'],
                'authorization_url': 'https://www.facebook.com/v18.0/dialog/oauth',
                'token_url': 'https://graph.facebook.com/v18.0/oauth/access_token'
            },
            'api_endpoints': {
                'campaigns': '/v18.0/act_{ad_account_id}/campaigns',
                'ad_sets': '/v18.0/act_{ad_account_id}/adsets',
                'ads': '/v18.0/act_{ad_account_id}/ads'
            },
            'rate_limits': {'requests_per_second': 200, 'daily_limit': 1000000},
            'webhook_support': True,
            'webhook_events': ['ad_account', 'campaign', 'adset', 'ad']
        },
        {
            'name': 'zapier',
            'display_name': 'Zapier',
            'category': 'automation',
            'description': 'Automation platform for connecting apps and services.',
            'auth_type': 'api_key',
            'oauth_config': {
                'required_fields': ['api_key'],
                'setup_instructions': 'Get your API key from your Zapier account settings'
            },
            'api_endpoints': {
                'zaps': '/v1/zaps',
                'tasks': '/v1/tasks',
                'hooks': '/v1/hooks'
            },
            'rate_limits': {'requests_per_second': 10, 'daily_limit': 100000},
            'webhook_support': True,
            'webhook_events': ['zap_triggered', 'task_completed', 'hook_received']
        }
    ]
    
    for provider_data in providers:
        IntegrationProvider.objects.get_or_create(
            name=provider_data['name'],
            defaults=provider_data
        )


class Migration(migrations.Migration):

    dependencies = [
        ('integrations', '0001_initial'),
    ]

    operations = [
        # Create new models first
        migrations.CreateModel(
            name='IntegrationProvider',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('display_name', models.CharField(max_length=100)),
                ('category', models.CharField(choices=[('social_media', 'Social Media'), ('crm', 'CRM'), ('analytics', 'Analytics'), ('advertising', 'Advertising'), ('support', 'Support'), ('ecommerce', 'E-commerce'), ('project_management', 'Project Management'), ('workplace', 'Workplace'), ('email', 'Email Marketing'), ('automation', 'Automation'), ('communication', 'Communication')], max_length=50)),
                ('description', models.TextField()),
                ('logo_url', models.URLField(blank=True, null=True)),
                ('auth_type', models.CharField(choices=[('oauth2', 'OAuth 2.0'), ('api_key', 'API Key'), ('webhook', 'Webhook'), ('custom', 'Custom')], max_length=20)),
                ('oauth_config', models.JSONField(blank=True, default=dict)),
                ('api_endpoints', models.JSONField(blank=True, default=dict)),
                ('rate_limits', models.JSONField(blank=True, default=dict)),
                ('webhook_support', models.BooleanField(default=False)),
                ('webhook_events', models.JSONField(blank=True, default=list)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Integration Provider',
                'verbose_name_plural': 'Integration Providers',
                'db_table': 'integration_providers',
            },
        ),
        
        migrations.CreateModel(
            name='DataFlow',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('direction', models.CharField(choices=[('inbound', 'Inbound (Third-party → DigiSol.AI)'), ('outbound', 'Outbound (DigiSol.AI → Third-party)'), ('bidirectional', 'Bidirectional')], max_length=20)),
                ('status', models.CharField(choices=[('active', 'Active'), ('paused', 'Paused'), ('error', 'Error'), ('testing', 'Testing')], default='active', max_length=20)),
                ('source_fields', models.JSONField(default=list)),
                ('target_fields', models.JSONField(default=list)),
                ('transformation_rules', models.JSONField(default=dict)),
                ('sync_frequency', models.CharField(default='daily', max_length=20)),
                ('last_sync', models.DateTimeField(blank=True, null=True)),
                ('next_sync', models.DateTimeField(blank=True, null=True)),
                ('records_processed', models.IntegerField(default=0)),
                ('records_failed', models.IntegerField(default=0)),
                ('last_error', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('integration', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='data_flows', to='integrations.integration')),
            ],
            options={
                'verbose_name': 'Data Flow',
                'verbose_name_plural': 'Data Flows',
                'db_table': 'integration_data_flows',
            },
        ),
        
        migrations.CreateModel(
            name='WorkflowAutomation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('trigger_type', models.CharField(choices=[('webhook', 'Webhook Event'), ('schedule', 'Scheduled'), ('condition', 'Condition-based')], max_length=20)),
                ('trigger_config', models.JSONField(default=dict)),
                ('actions', models.JSONField(default=list)),
                ('conditions', models.JSONField(default=dict)),
                ('status', models.CharField(choices=[('active', 'Active'), ('paused', 'Paused'), ('draft', 'Draft'), ('error', 'Error')], default='draft', max_length=20)),
                ('last_executed', models.DateTimeField(blank=True, null=True)),
                ('execution_count', models.IntegerField(default=0)),
                ('success_count', models.IntegerField(default=0)),
                ('failure_count', models.IntegerField(default=0)),
                ('last_error', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('integration', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workflows', to='integrations.integration')),
            ],
            options={
                'verbose_name': 'Workflow Automation',
                'verbose_name_plural': 'Workflow Automations',
                'db_table': 'integration_workflows',
            },
        ),
        
        migrations.CreateModel(
            name='IntegrationHealthLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('event_type', models.CharField(choices=[('sync_success', 'Sync Success'), ('sync_failure', 'Sync Failure'), ('auth_error', 'Authentication Error'), ('rate_limit', 'Rate Limit Reached'), ('data_quality', 'Data Quality Issue'), ('connection_lost', 'Connection Lost'), ('recovered', 'Recovered')], max_length=20)),
                ('severity', models.CharField(choices=[('info', 'Info'), ('warning', 'Warning'), ('error', 'Error'), ('critical', 'Critical')], max_length=20)),
                ('message', models.TextField()),
                ('details', models.JSONField(default=dict)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('resolved_by', models.CharField(blank=True, max_length=100)),
                ('integration', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='health_logs', to='integrations.integration')),
            ],
            options={
                'verbose_name': 'Integration Health Log',
                'verbose_name_plural': 'Integration Health Logs',
                'db_table': 'integration_health_logs',
                'ordering': ['-timestamp'],
            },
        ),
        
        migrations.CreateModel(
            name='ConnectusInsight',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('insight_type', models.CharField(choices=[('recommendation', 'Recommendation'), ('optimization', 'Optimization'), ('alert', 'Alert'), ('opportunity', 'Opportunity'), ('troubleshooting', 'Troubleshooting')], max_length=20)),
                ('priority', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')], default='medium', max_length=20)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('recommendation', models.TextField(blank=True)),
                ('action_items', models.JSONField(default=list)),
                ('metadata', models.JSONField(default=dict)),
                ('is_read', models.BooleanField(default=False)),
                ('is_resolved', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('integration', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='integrations.integration')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.tenant')),
            ],
            options={
                'verbose_name': 'Connectus Insight',
                'verbose_name_plural': 'Connectus Insights',
                'db_table': 'connectus_insights',
                'ordering': ['-priority', '-created_at'],
            },
        ),
        
        # Run data migration to create default providers
        migrations.RunPython(create_default_providers, reverse_code=migrations.RunPython.noop),
    ]
