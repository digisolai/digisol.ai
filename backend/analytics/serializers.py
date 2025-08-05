from rest_framework import serializers
from .models import (
    Event, ReportConfiguration, LeadFunnelEvent, ReportTemplate, SavedReport, 
    ReportExecution, AnalyticsModel, AnalyticsInsight, SEOAnalysis, SWOTAnalysis, 
    IndustryAnalysis, DataSource, DataSyncLog
)
from accounts.serializers import CustomUserSerializer
from core.serializers import TenantSerializer


class EventSerializer(serializers.ModelSerializer):
    """Serializer for Event model."""
    contact_email = serializers.CharField(source='contact.email', read_only=True)
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'event_type', 'event_type_display', 'timestamp', 'contact', 
            'contact_email', 'campaign', 'campaign_name', 'value', 'details', 
            'metadata', 'has_value', 'event_summary'
        ]
        read_only_fields = ['id', 'timestamp', 'has_value', 'event_summary']


class ReportConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for ReportConfiguration model."""
    created_by = CustomUserSerializer(read_only=True)
    configuration_summary = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = ReportConfiguration
        fields = [
            'id', 'name', 'configuration_json', 'created_by', 'created_at',
            'configuration_summary', 'is_active'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'configuration_summary', 'is_active']


class LeadFunnelEventSerializer(serializers.ModelSerializer):
    """Serializer for LeadFunnelEvent model."""
    contact_email = serializers.CharField(source='contact.email', read_only=True)
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    campaign_step_name = serializers.CharField(source='campaign_step.name', read_only=True)
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)

    class Meta:
        model = LeadFunnelEvent
        fields = [
            'id', 'contact', 'contact_email', 'event_type', 'event_type_display',
            'campaign', 'campaign_name', 'campaign_step', 'campaign_step_name',
            'event_data', 'timestamp', 'event_summary', 'has_campaign_context',
            'has_step_context'
        ]
        read_only_fields = [
            'id', 'timestamp', 'event_summary', 'has_campaign_context', 'has_step_context'
        ]


# ===== QUANTIA (REPORTS) SERIALIZERS =====

class ReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for ReportTemplate model."""
    created_by = CustomUserSerializer(read_only=True)
    template_type_display = serializers.CharField(source='get_template_type_display', read_only=True)

    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'description', 'template_type', 'template_type_display',
            'configuration', 'is_global', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class SavedReportSerializer(serializers.ModelSerializer):
    """Serializer for SavedReport model."""
    template = ReportTemplateSerializer(read_only=True)
    created_by = CustomUserSerializer(read_only=True)
    is_scheduled = serializers.BooleanField(read_only=True)

    class Meta:
        model = SavedReport
        fields = [
            'id', 'name', 'description', 'template', 'configuration', 
            'schedule_config', 'created_by', 'created_at', 'updated_at',
            'last_generated', 'is_scheduled'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at', 'last_generated', 'is_scheduled'
        ]


class ReportExecutionSerializer(serializers.ModelSerializer):
    """Serializer for ReportExecution model."""
    report = SavedReportSerializer(read_only=True)
    executed_by = CustomUserSerializer(read_only=True)

    class Meta:
        model = ReportExecution
        fields = [
            'id', 'report', 'executed_by', 'execution_config', 'results',
            'status', 'error_message', 'started_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'report', 'executed_by', 'started_at', 'completed_at'
        ]


# ===== METRIKA (ADVANCED ANALYTICS) SERIALIZERS =====

class AnalyticsModelSerializer(serializers.ModelSerializer):
    """Serializer for AnalyticsModel model."""
    created_by = CustomUserSerializer(read_only=True)
    model_type_display = serializers.CharField(source='get_model_type_display', read_only=True)

    class Meta:
        model = AnalyticsModel
        fields = [
            'id', 'name', 'model_type', 'model_type_display', 'description',
            'model_config', 'model_file_path', 'training_data_config',
            'performance_metrics', 'is_active', 'created_by', 'created_at',
            'updated_at', 'last_trained'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at', 'last_trained'
        ]


class AnalyticsInsightSerializer(serializers.ModelSerializer):
    """Serializer for AnalyticsInsight model."""
    insight_type_display = serializers.CharField(source='get_insight_type_display', read_only=True)

    class Meta:
        model = AnalyticsInsight
        fields = [
            'id', 'insight_type', 'insight_type_display', 'title', 'description',
            'data_sources', 'confidence_score', 'impact_score', 'recommendations',
            'visualizations', 'created_at', 'expires_at', 'is_actioned'
        ]
        read_only_fields = ['id', 'created_at']


# ===== SEO ANALYSIS SERIALIZERS =====

class SEOAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for SEOAnalysis model."""
    created_by = CustomUserSerializer(read_only=True)

    class Meta:
        model = SEOAnalysis
        fields = [
            'id', 'analysis_date', 'domain', 'gsc_data', 'ga_data',
            'technical_seo', 'keyword_data', 'competitor_data', 'insights',
            'recommendations', 'created_by', 'updated_at'
        ]
        read_only_fields = ['id', 'analysis_date', 'created_by', 'updated_at']


# ===== SWOT ANALYSIS SERIALIZERS =====

class SWOTAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for SWOTAnalysis model."""
    created_by = CustomUserSerializer(read_only=True)

    class Meta:
        model = SWOTAnalysis
        fields = [
            'id', 'analysis_date', 'analysis_period', 'strengths', 'weaknesses',
            'opportunities', 'threats', 'data_sources', 'strategic_recommendations',
            'market_context', 'created_by', 'updated_at'
        ]
        read_only_fields = ['id', 'analysis_date', 'created_by', 'updated_at']


# ===== INDUSTRY ANALYSIS SERIALIZERS =====

class IndustryAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for IndustryAnalysis model."""
    created_by = CustomUserSerializer(read_only=True)

    class Meta:
        model = IndustryAnalysis
        fields = [
            'id', 'analysis_date', 'industry', 'sub_industry', 'market_size',
            'growth_rates', 'market_segments', 'competitors', 'competitive_landscape',
            'trends', 'consumer_behavior', 'regulations', 'strategic_implications',
            'data_sources', 'created_by', 'updated_at'
        ]
        read_only_fields = ['id', 'analysis_date', 'created_by', 'updated_at']


# ===== DATA INTEGRATION SERIALIZERS =====

class DataSourceSerializer(serializers.ModelSerializer):
    """Serializer for DataSource model."""
    source_type_display = serializers.CharField(source='get_source_type_display', read_only=True)

    class Meta:
        model = DataSource
        fields = [
            'id', 'name', 'source_type', 'source_type_display', 'connection_config',
            'is_active', 'last_sync', 'sync_frequency', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DataSyncLogSerializer(serializers.ModelSerializer):
    """Serializer for DataSyncLog model."""
    data_source = DataSourceSerializer(read_only=True)

    class Meta:
        model = DataSyncLog
        fields = [
            'id', 'data_source', 'sync_started', 'sync_completed', 'status',
            'records_processed', 'error_message', 'sync_config'
        ]
        read_only_fields = ['id', 'sync_started']


# ===== DASHBOARD & SUMMARY SERIALIZERS =====

class DashboardSummarySerializer(serializers.Serializer):
    """Serializer for dashboard summary data."""
    active_campaigns = serializers.IntegerField()
    next_scheduled = serializers.DateField(allow_null=True)
    total_emails_sent = serializers.IntegerField()
    recent_leads = serializers.ListField(child=serializers.DictField())
    ai_text_credits_used = serializers.IntegerField()
    ai_image_credits_used = serializers.IntegerField()


class AnalyticsSummarySerializer(serializers.Serializer):
    """Serializer for comprehensive analytics summary."""
    total_leads = serializers.IntegerField()
    conversion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_deal_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    top_performing_campaigns = serializers.ListField(child=serializers.DictField())
    recent_events = serializers.ListField(child=serializers.DictField())


# ===== QUANTIA INSIGHTS SERIALIZERS =====

class QuantiaInsightSerializer(serializers.Serializer):
    """Serializer for Quantia's AI-generated insights."""
    insight_type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    confidence_score = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    recommendations = serializers.ListField(child=serializers.CharField())
    related_data = serializers.DictField()


class QuantiaReportDataSerializer(serializers.Serializer):
    """Serializer for Quantia report data."""
    report_id = serializers.UUIDField()
    report_name = serializers.CharField()
    template_type = serializers.CharField()
    metrics = serializers.DictField()
    visualizations = serializers.ListField(child=serializers.DictField())
    insights = QuantiaInsightSerializer(many=True)
    generated_at = serializers.DateTimeField()


# ===== METRIKA ANALYSIS SERIALIZERS =====

class MetrikaAnalysisSerializer(serializers.Serializer):
    """Serializer for Metrika's advanced analysis results."""
    analysis_id = serializers.UUIDField()
    analysis_type = serializers.CharField()
    problem_statement = serializers.CharField()
    methodology = serializers.CharField()
    results = serializers.DictField()
    insights = AnalyticsInsightSerializer(many=True)
    recommendations = serializers.ListField(child=serializers.DictField())
    confidence_level = serializers.DecimalField(max_digits=5, decimal_places=2)
    created_at = serializers.DateTimeField()


class MetrikaModelPerformanceSerializer(serializers.Serializer):
    """Serializer for Metrika model performance metrics."""
    model_id = serializers.UUIDField()
    model_name = serializers.CharField()
    model_type = serializers.CharField()
    accuracy = serializers.DecimalField(max_digits=5, decimal_places=4, allow_null=True)
    precision = serializers.DecimalField(max_digits=5, decimal_places=4, allow_null=True)
    recall = serializers.DecimalField(max_digits=5, decimal_places=4, allow_null=True)
    f1_score = serializers.DecimalField(max_digits=5, decimal_places=4, allow_null=True)
    training_date = serializers.DateTimeField()
    last_updated = serializers.DateTimeField()


# ===== COMPREHENSIVE REPORT SERIALIZERS =====

class ComprehensiveReportSerializer(serializers.Serializer):
    """Serializer for comprehensive reports combining multiple data sources."""
    report_id = serializers.UUIDField()
    report_name = serializers.CharField()
    report_type = serializers.CharField()  # 'quantia' or 'metrika'
    date_range = serializers.DictField()
    data_sources = serializers.ListField(child=serializers.CharField())
    
    # Quantia-specific fields
    quantia_insights = QuantiaInsightSerializer(many=True, required=False)
    report_metrics = serializers.DictField(required=False)
    
    # Metrika-specific fields
    metrika_analysis = MetrikaAnalysisSerializer(required=False)
    model_performance = MetrikaModelPerformanceSerializer(required=False)
    
    # Common fields
    seo_analysis = SEOAnalysisSerializer(required=False)
    swot_analysis = SWOTAnalysisSerializer(required=False)
    industry_analysis = IndustryAnalysisSerializer(required=False)
    
    generated_at = serializers.DateTimeField()
    generated_by = CustomUserSerializer()