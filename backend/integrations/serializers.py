from rest_framework import serializers
from django.utils import timezone
from .models import (
    IntegrationProvider, Integration, DataFlow, WorkflowAutomation, 
    IntegrationHealthLog, ConnectusInsight
)


class IntegrationProviderSerializer(serializers.ModelSerializer):
    """
    Serializer for IntegrationProvider model.
    """
    class Meta:
        model = IntegrationProvider
        fields = [
            'id', 'name', 'display_name', 'category', 'description', 'logo_url',
            'auth_type', 'oauth_config', 'api_endpoints', 'rate_limits',
            'webhook_support', 'webhook_events', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DataFlowSerializer(serializers.ModelSerializer):
    """
    Serializer for DataFlow model.
    """
    class Meta:
        model = DataFlow
        fields = [
            'id', 'integration', 'name', 'description', 'direction', 'status',
            'source_fields', 'target_fields', 'transformation_rules',
            'sync_frequency', 'last_sync', 'next_sync',
            'records_processed', 'records_failed', 'last_error',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_sync', 'next_sync']


class WorkflowAutomationSerializer(serializers.ModelSerializer):
    """
    Serializer for WorkflowAutomation model.
    """
    class Meta:
        model = WorkflowAutomation
        fields = [
            'id', 'integration', 'name', 'description', 'trigger_type',
            'trigger_config', 'actions', 'conditions', 'status',
            'last_executed', 'execution_count', 'success_count', 'failure_count',
            'last_error', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_executed']


class IntegrationHealthLogSerializer(serializers.ModelSerializer):
    """
    Serializer for IntegrationHealthLog model.
    """
    class Meta:
        model = IntegrationHealthLog
        fields = [
            'id', 'integration', 'event_type', 'severity', 'message', 'details',
            'timestamp', 'resolved_at', 'resolved_by'
        ]
        read_only_fields = ['id', 'timestamp']


class ConnectusInsightSerializer(serializers.ModelSerializer):
    """
    Serializer for ConnectusInsight model.
    """
    class Meta:
        model = ConnectusInsight
        fields = [
            'id', 'tenant', 'integration', 'insight_type', 'priority', 'title',
            'description', 'recommendation', 'action_items', 'metadata',
            'is_read', 'is_resolved', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class IntegrationSerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for the Integration model with comprehensive data.
    """
    # Related data
    provider = IntegrationProviderSerializer(read_only=True)
    provider_id = serializers.UUIDField(write_only=True)
    data_flows = DataFlowSerializer(many=True, read_only=True)
    workflows = WorkflowAutomationSerializer(many=True, read_only=True)
    recent_health_logs = serializers.SerializerMethodField()
    
    # Frontend-compatible fields
    name = serializers.CharField(source='name', read_only=True)
    category = serializers.CharField(source='provider.category', read_only=True)
    is_connected = serializers.SerializerMethodField()
    connection_date = serializers.SerializerMethodField()
    description = serializers.CharField(source='provider.description', read_only=True)
    logo_url = serializers.CharField(source='provider.logo_url', read_only=True)
    health_status = serializers.SerializerMethodField()
    sync_status = serializers.SerializerMethodField()
    api_usage_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Integration
        fields = [
            'id', 'tenant', 'provider', 'provider_id', 'name', 'status',
            'auth_credentials', 'auth_expires_at', 'settings', 'data_mappings',
            'sync_config', 'last_sync', 'last_sync_status', 'sync_error_count',
            'health_score', 'api_calls_today', 'api_calls_limit',
            'data_synced_today', 'is_active', 'created_at', 'updated_at',
            # Related data
            'data_flows', 'workflows', 'recent_health_logs',
            # Frontend-compatible fields
            'category', 'is_connected', 'connection_date', 'description',
            'logo_url', 'health_status', 'sync_status', 'api_usage_percentage'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'last_sync', 'sync_error_count',
            'api_calls_today', 'data_synced_today'
        ]
        extra_kwargs = {
            'auth_credentials': {'write_only': True}  # Don't return sensitive data
        }

    def get_is_connected(self, obj):
        """Return connection status for frontend."""
        return obj.status == 'connected' and obj.is_active

    def get_connection_date(self, obj):
        """Return connection date if integration is active."""
        if obj.is_connected:
            return obj.created_at.strftime('%Y-%m-%d')
        return None

    def get_health_status(self, obj):
        """Return human-readable health status."""
        return obj.get_health_status()

    def get_sync_status(self, obj):
        """Return sync status information."""
        if not obj.last_sync:
            return "Never synced"
        
        time_diff = timezone.now() - obj.last_sync
        if time_diff.days > 7:
            return f"Last sync: {time_diff.days} days ago"
        elif time_diff.days > 0:
            return f"Last sync: {time_diff.days} day(s) ago"
        elif time_diff.seconds > 3600:
            return f"Last sync: {time_diff.seconds // 3600} hour(s) ago"
        else:
            return f"Last sync: {time_diff.seconds // 60} minute(s) ago"

    def get_api_usage_percentage(self, obj):
        """Calculate API usage percentage."""
        if obj.api_calls_limit == 0:
            return 0
        return min(100, (obj.api_calls_today / obj.api_calls_limit) * 100)

    def get_recent_health_logs(self, obj):
        """Get recent health logs for this integration."""
        recent_logs = obj.health_logs.all()[:5]  # Last 5 logs
        return IntegrationHealthLogSerializer(recent_logs, many=True).data

    def validate_provider_id(self, value):
        """Validate that the provider exists and is active."""
        try:
            provider = IntegrationProvider.objects.get(id=value, is_active=True)
            return value
        except IntegrationProvider.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive integration provider.")

    def validate_auth_credentials(self, value):
        """Validate authentication credentials structure."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Auth credentials must be a valid JSON object.")
        return value

    def validate_settings(self, value):
        """Validate settings structure."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Settings must be a valid JSON object.")
        return value

    def validate_sync_config(self, value):
        """Validate sync configuration."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Sync configuration must be a valid JSON object.")
        
        # Validate required fields
        required_fields = ['frequency', 'direction']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"Sync configuration must include '{field}'.")
        
        # Validate frequency
        valid_frequencies = ['real-time', 'hourly', 'daily', 'weekly']
        if value.get('frequency') not in valid_frequencies:
            raise serializers.ValidationError(f"Invalid sync frequency. Must be one of: {valid_frequencies}")
        
        # Validate direction
        valid_directions = ['inbound', 'outbound', 'bidirectional']
        if value.get('direction') not in valid_directions:
            raise serializers.ValidationError(f"Invalid sync direction. Must be one of: {valid_directions}")
        
        return value


class IntegrationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new integrations with simplified fields.
    """
    provider_id = serializers.UUIDField()
    name = serializers.CharField(max_length=100)
    auth_credentials = serializers.JSONField()
    settings = serializers.JSONField(default=dict)
    sync_config = serializers.JSONField(default=dict)

    class Meta:
        model = Integration
        fields = ['provider_id', 'name', 'auth_credentials', 'settings', 'sync_config']

    def create(self, validated_data):
        """Create a new integration with proper tenant assignment."""
        provider_id = validated_data.pop('provider_id')
        provider = IntegrationProvider.objects.get(id=provider_id)
        
        # Set default sync config if not provided
        if not validated_data.get('sync_config'):
            validated_data['sync_config'] = {
                'frequency': 'daily',
                'direction': 'inbound',
                'batch_size': 100
            }
        
        integration = Integration.objects.create(
            tenant=self.context['request'].user.tenant,
            provider=provider,
            **validated_data
        )
        return integration


class IntegrationTestSerializer(serializers.Serializer):
    """
    Serializer for testing integration connections.
    """
    provider_id = serializers.UUIDField()
    auth_credentials = serializers.JSONField()
    test_type = serializers.ChoiceField(choices=['connection', 'data_sync', 'webhook'])

    def validate_auth_credentials(self, value):
        """Validate authentication credentials."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Auth credentials must be a valid JSON object.")
        return value


class IntegrationHealthSummarySerializer(serializers.Serializer):
    """
    Serializer for integration health summary data.
    """
    total_integrations = serializers.IntegerField()
    connected_integrations = serializers.IntegerField()
    error_integrations = serializers.IntegerField()
    overall_health_score = serializers.FloatField()
    recent_alerts = serializers.ListField()
    api_usage_summary = serializers.DictField()
    recommendations = serializers.ListField()


class ConnectusQuerySerializer(serializers.Serializer):
    """
    Serializer for Connectus AI queries.
    """
    query = serializers.CharField(max_length=1000)
    context = serializers.JSONField(default=dict)
    integration_id = serializers.UUIDField(required=False, allow_null=True)

    def validate_query(self, value):
        """Validate query length and content."""
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Query must be at least 3 characters long.")
        return value.strip() 