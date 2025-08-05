import uuid
import json
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from core.models import Tenant
from core.managers import TenantAwareManager


class IntegrationProvider(models.Model):
    """
    Predefined integration providers with their capabilities and configurations.
    """
    CATEGORY_CHOICES = [
        ('social_media', 'Social Media'),
        ('crm', 'CRM'),
        ('analytics', 'Analytics'),
        ('advertising', 'Advertising'),
        ('support', 'Support'),
        ('ecommerce', 'E-commerce'),
        ('project_management', 'Project Management'),
        ('workplace', 'Workplace'),
        ('email', 'Email Marketing'),
        ('automation', 'Automation'),
        ('communication', 'Communication'),
    ]

    AUTH_TYPE_CHOICES = [
        ('oauth2', 'OAuth 2.0'),
        ('api_key', 'API Key'),
        ('webhook', 'Webhook'),
        ('custom', 'Custom'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    logo_url = models.URLField(blank=True, null=True)
    auth_type = models.CharField(max_length=20, choices=AUTH_TYPE_CHOICES)
    oauth_config = models.JSONField(default=dict, blank=True)  # OAuth endpoints, scopes, etc.
    api_endpoints = models.JSONField(default=dict, blank=True)  # Available API endpoints
    rate_limits = models.JSONField(default=dict, blank=True)  # Rate limit information
    webhook_support = models.BooleanField(default=False)
    webhook_events = models.JSONField(default=list, blank=True)  # Available webhook events
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'integration_providers'
        verbose_name = 'Integration Provider'
        verbose_name_plural = 'Integration Providers'

    def __str__(self):
        return self.display_name


class Integration(models.Model):
    """
    Enhanced Integration model for managing third-party service integrations.
    """
    STATUS_CHOICES = [
        ('connected', 'Connected'),
        ('disconnected', 'Disconnected'),
        ('pending', 'Pending'),
        ('error', 'Error'),
        ('configuring', 'Configuring'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    provider = models.ForeignKey(IntegrationProvider, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)  # Custom name for this integration instance
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disconnected')
    
    # Authentication
    auth_credentials = models.JSONField(default=dict)  # Encrypted OAuth tokens, API keys, etc.
    auth_expires_at = models.DateTimeField(null=True, blank=True)  # For OAuth token expiration
    
    # Configuration
    settings = models.JSONField(default=dict)  # Integration-specific settings
    data_mappings = models.JSONField(default=dict)  # Field mappings between systems
    sync_config = models.JSONField(default=dict)  # Sync frequency, direction, etc.
    
    # Health monitoring
    last_sync = models.DateTimeField(null=True, blank=True)
    last_sync_status = models.CharField(max_length=20, default='unknown')
    sync_error_count = models.IntegerField(default=0)
    health_score = models.IntegerField(default=100)  # 0-100 health score
    
    # Usage tracking
    api_calls_today = models.IntegerField(default=0)
    api_calls_limit = models.IntegerField(default=0)
    data_synced_today = models.IntegerField(default=0)  # Number of records
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'integrations'
        verbose_name = 'Integration'
        verbose_name_plural = 'Integrations'
        unique_together = ['provider', 'tenant', 'name']

    def __str__(self):
        return f"{self.name} - {self.tenant.name}"

    @property
    def is_configured(self):
        """Check if the integration has the minimum required configuration."""
        return bool(self.auth_credentials and self.is_active and self.status == 'connected')

    @property
    def needs_reauthentication(self):
        """Check if OAuth tokens need to be refreshed."""
        if self.auth_expires_at and self.auth_expires_at <= timezone.now():
            return True
        return False

    def get_health_status(self):
        """Get human-readable health status."""
        if self.health_score >= 90:
            return "Excellent"
        elif self.health_score >= 70:
            return "Good"
        elif self.health_score >= 50:
            return "Fair"
        else:
            return "Poor"


class DataFlow(models.Model):
    """
    Represents data flows between integrations and DigiSol.AI modules.
    """
    DIRECTION_CHOICES = [
        ('inbound', 'Inbound (Third-party → DigiSol.AI)'),
        ('outbound', 'Outbound (DigiSol.AI → Third-party)'),
        ('bidirectional', 'Bidirectional'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('error', 'Error'),
        ('testing', 'Testing'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, related_name='data_flows')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    direction = models.CharField(max_length=20, choices=DIRECTION_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Data mapping
    source_fields = models.JSONField(default=list)  # Fields from source system
    target_fields = models.JSONField(default=list)  # Fields in target system
    transformation_rules = models.JSONField(default=dict)  # Data transformation logic
    
    # Sync configuration
    sync_frequency = models.CharField(max_length=20, default='daily')  # real-time, hourly, daily, weekly
    last_sync = models.DateTimeField(null=True, blank=True)
    next_sync = models.DateTimeField(null=True, blank=True)
    
    # Statistics
    records_processed = models.IntegerField(default=0)
    records_failed = models.IntegerField(default=0)
    last_error = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'integration_data_flows'
        verbose_name = 'Data Flow'
        verbose_name_plural = 'Data Flows'

    def __str__(self):
        return f"{self.name} - {self.integration.name}"


class WorkflowAutomation(models.Model):
    """
    Automated workflows triggered by integration events.
    """
    TRIGGER_TYPE_CHOICES = [
        ('webhook', 'Webhook Event'),
        ('schedule', 'Scheduled'),
        ('condition', 'Condition-based'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('draft', 'Draft'),
        ('error', 'Error'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, related_name='workflows')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    trigger_type = models.CharField(max_length=20, choices=TRIGGER_TYPE_CHOICES)
    trigger_config = models.JSONField(default=dict)  # Trigger-specific configuration
    actions = models.JSONField(default=list)  # List of actions to perform
    conditions = models.JSONField(default=dict)  # Conditions for execution
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Execution tracking
    last_executed = models.DateTimeField(null=True, blank=True)
    execution_count = models.IntegerField(default=0)
    success_count = models.IntegerField(default=0)
    failure_count = models.IntegerField(default=0)
    last_error = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'integration_workflows'
        verbose_name = 'Workflow Automation'
        verbose_name_plural = 'Workflow Automations'

    def __str__(self):
        return f"{self.name} - {self.integration.name}"


class IntegrationHealthLog(models.Model):
    """
    Log of integration health events and metrics.
    """
    EVENT_TYPE_CHOICES = [
        ('sync_success', 'Sync Success'),
        ('sync_failure', 'Sync Failure'),
        ('auth_error', 'Authentication Error'),
        ('rate_limit', 'Rate Limit Reached'),
        ('data_quality', 'Data Quality Issue'),
        ('connection_lost', 'Connection Lost'),
        ('recovered', 'Recovered'),
    ]

    SEVERITY_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, related_name='health_logs')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    message = models.TextField()
    details = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'integration_health_logs'
        verbose_name = 'Integration Health Log'
        verbose_name_plural = 'Integration Health Logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.integration.name} - {self.event_type} - {self.timestamp}"


class ConnectusInsight(models.Model):
    """
    AI-powered insights and recommendations from Connectus.
    """
    INSIGHT_TYPE_CHOICES = [
        ('recommendation', 'Recommendation'),
        ('optimization', 'Optimization'),
        ('alert', 'Alert'),
        ('opportunity', 'Opportunity'),
        ('troubleshooting', 'Troubleshooting'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, null=True, blank=True)
    insight_type = models.CharField(max_length=20, choices=INSIGHT_TYPE_CHOICES)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    title = models.CharField(max_length=200)
    description = models.TextField()
    recommendation = models.TextField(blank=True)
    action_items = models.JSONField(default=list)  # List of actionable items
    metadata = models.JSONField(default=dict)  # Additional context data
    is_read = models.BooleanField(default=False)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'connectus_insights'
        verbose_name = 'Connectus Insight'
        verbose_name_plural = 'Connectus Insights'
        ordering = ['-priority', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.tenant.name}"
