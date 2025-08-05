import uuid
from django.db import models
from django.core.validators import MinValueValidator
from core.models import Tenant, Contact, Campaign
from core.managers import TenantAwareManager
from accounts.models import CustomUser
from campaigns.models import MarketingCampaign, CampaignStep

# Create your models here.

class Event(models.Model):
    """
    Event model to log marketing campaign activities and analytics events.
    """
    EVENT_TYPE_CHOICES = [
        ('email_sent', 'Email Sent'),
        ('email_opened', 'Email Opened'),
        ('email_clicked', 'Email Clicked'),
        ('social_post_viewed', 'Social Post Viewed'),
        ('social_post_clicked', 'Social Post Clicked'),
        ('lead_converted', 'Lead Converted'),
        ('conversion_event', 'Conversion Event'),
        ('campaign_sent', 'Campaign Sent'),
        ('form_submitted', 'Form Submitted'),
        ('unsubscribed', 'Unsubscribed'),
        ('sms_sent', 'SMS Sent'),
        ('sms_delivered', 'SMS Delivered'),
        ('sms_clicked', 'SMS Clicked'),
        # Add more as needed
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    contact = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True)
    campaign = models.ForeignKey(Campaign, on_delete=models.SET_NULL, null=True, blank=True)
    value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    details = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'events'
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.event_type} ({self.tenant.name}) at {self.timestamp}"

    @property
    def has_value(self):
        """Check if the event has a monetary value."""
        return self.value is not None

    @property
    def event_summary(self):
        """Return a summary of the event for display."""
        summary = f"{self.get_event_type_display()}"
        if self.contact:
            summary += f" - {self.contact.email}"
        if self.campaign:
            summary += f" - {self.campaign.name}"
        if self.value:
            summary += f" - ${self.value}"
        return summary


class ReportConfiguration(models.Model):
    """
    Model for storing saved report configurations and custom analytics setups.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    configuration_json = models.JSONField()
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='created_reports')
    created_at = models.DateTimeField(auto_now_add=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'report_configurations'
        verbose_name = 'Report Configuration'
        verbose_name_plural = 'Report Configurations'
        unique_together = ['name', 'tenant']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.tenant.name}"

    @property
    def configuration_summary(self):
        """Return a summary of the report configuration."""
        config = self.configuration_json
        summary_parts = []
        
        if 'time_range' in config:
            summary_parts.append(f"Time: {config['time_range']}")
        if 'metrics' in config:
            summary_parts.append(f"Metrics: {', '.join(config['metrics'])}")
        if 'chart_type' in config:
            summary_parts.append(f"Chart: {config['chart_type']}")
            
        return ' | '.join(summary_parts) if summary_parts else "Basic configuration"

    @property
    def is_active(self):
        """Check if the report configuration is currently active."""
        config = self.configuration_json
        return config.get('is_active', True)


class LeadFunnelEvent(models.Model):
    """
    Model to track crucial lead progression events related to campaigns.
    Foundation for campaign performance reporting and funnel visualizations.
    """
    EVENT_TYPE_CHOICES = [
        ('MQL_Achieved', 'MQL Achieved'),
        ('SQL_Achieved', 'SQL Achieved'),
        ('Won_Opportunity', 'Won Opportunity'),
        ('Campaign_Touchpoint', 'Campaign Touchpoint'),
        ('Form_Submission', 'Form Submission'),
        ('Page_Visit', 'Page Visit'),
        ('Email_Opened', 'Email Opened'),
        ('Email_Clicked', 'Email Clicked'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='funnel_events')
    event_type = models.CharField(max_length=100, choices=EVENT_TYPE_CHOICES)
    campaign = models.ForeignKey(MarketingCampaign, on_delete=models.SET_NULL, null=True, blank=True)
    campaign_step = models.ForeignKey(CampaignStep, on_delete=models.SET_NULL, null=True, blank=True)
    event_data = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'lead_funnel_events'
        verbose_name = 'Lead Funnel Event'
        verbose_name_plural = 'Lead Funnel Events'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['tenant', 'event_type']),
            models.Index(fields=['contact', 'event_type']),
            models.Index(fields=['campaign', 'event_type']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.contact.email} - {self.get_event_type_display()} at {self.timestamp}"

    @property
    def event_summary(self):
        """Return a summary of the funnel event for display."""
        summary = f"{self.get_event_type_display()}"
        if self.campaign:
            summary += f" - {self.campaign.name}"
        if self.campaign_step:
            summary += f" - {self.campaign_step.name}"
        return summary

    @property
    def has_campaign_context(self):
        """Check if the event has campaign context."""
        return self.campaign is not None

    @property
    def has_step_context(self):
        """Check if the event has campaign step context."""
        return self.campaign_step is not None


# ===== QUANTIA (REPORTS) MODELS =====

class ReportTemplate(models.Model):
    """
    Pre-built report templates for Quantia.
    """
    TEMPLATE_TYPE_CHOICES = [
        ('marketing_performance', 'Marketing Performance'),
        ('campaign_roi', 'Campaign ROI Summary'),
        ('website_traffic', 'Website Traffic Overview'),
        ('social_media_engagement', 'Social Media Engagement'),
        ('email_performance', 'Email Performance'),
        ('lead_generation', 'Lead Generation'),
        ('conversion_funnel', 'Conversion Funnel'),
        ('revenue_analytics', 'Revenue Analytics'),
        ('custom', 'Custom Report'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    template_type = models.CharField(max_length=50, choices=TEMPLATE_TYPE_CHOICES)
    configuration = models.JSONField(default=dict)
    is_global = models.BooleanField(default=False)  # Available to all tenants
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'report_templates'
        verbose_name = 'Report Template'
        verbose_name_plural = 'Report Templates'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"


class SavedReport(models.Model):
    """
    User-created and saved reports for Quantia.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    template = models.ForeignKey(ReportTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    configuration = models.JSONField(default=dict)
    schedule_config = models.JSONField(default=dict, blank=True)  # For scheduled reports
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_generated = models.DateTimeField(null=True, blank=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'saved_reports'
        verbose_name = 'Saved Report'
        verbose_name_plural = 'Saved Reports'
        unique_together = ['name', 'tenant']
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.name} - {self.tenant.name}"

    @property
    def is_scheduled(self):
        """Check if the report is scheduled for automatic generation."""
        return bool(self.schedule_config.get('enabled', False))


class ReportExecution(models.Model):
    """
    Track report executions and store results.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    report = models.ForeignKey(SavedReport, on_delete=models.CASCADE)
    executed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    execution_config = models.JSONField(default=dict)
    results = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ], default='pending')
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'report_executions'
        verbose_name = 'Report Execution'
        verbose_name_plural = 'Report Executions'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.report.name} - {self.status} at {self.started_at}"


# ===== METRIKA (ADVANCED ANALYTICS) MODELS =====

class AnalyticsModel(models.Model):
    """
    Store trained ML models for Metrika.
    """
    MODEL_TYPE_CHOICES = [
        ('regression', 'Regression'),
        ('classification', 'Classification'),
        ('clustering', 'Clustering'),
        ('time_series', 'Time Series'),
        ('churn_prediction', 'Churn Prediction'),
        ('attribution', 'Attribution Modeling'),
        ('marketing_mix', 'Marketing Mix Modeling'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    model_type = models.CharField(max_length=50, choices=MODEL_TYPE_CHOICES)
    description = models.TextField(blank=True)
    model_config = models.JSONField(default=dict)
    model_file_path = models.CharField(max_length=500, blank=True)
    training_data_config = models.JSONField(default=dict)
    performance_metrics = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_trained = models.DateTimeField(null=True, blank=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'analytics_models'
        verbose_name = 'Analytics Model'
        verbose_name_plural = 'Analytics Models'
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.name} ({self.get_model_type_display()}) - {self.tenant.name}"


class AnalyticsInsight(models.Model):
    """
    Store AI-generated insights from Metrika.
    """
    INSIGHT_TYPE_CHOICES = [
        ('anomaly', 'Anomaly Detection'),
        ('trend', 'Trend Analysis'),
        ('correlation', 'Correlation Analysis'),
        ('prediction', 'Prediction'),
        ('recommendation', 'Recommendation'),
        ('segmentation', 'Segmentation'),
        ('root_cause', 'Root Cause Analysis'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    insight_type = models.CharField(max_length=50, choices=INSIGHT_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    data_sources = models.JSONField(default=list)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    impact_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    recommendations = models.JSONField(default=list)
    visualizations = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_actioned = models.BooleanField(default=False)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'analytics_insights'
        verbose_name = 'Analytics Insight'
        verbose_name_plural = 'Analytics Insights'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_insight_type_display()}) - {self.tenant.name}"


# ===== SEO ANALYSIS MODELS =====

class SEOAnalysis(models.Model):
    """
    Store SEO analysis data for both Quantia and Metrika.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    analysis_date = models.DateTimeField(auto_now_add=True)
    domain = models.CharField(max_length=255)
    
    # Google Search Console Data
    gsc_data = models.JSONField(default=dict)
    
    # Google Analytics Data
    ga_data = models.JSONField(default=dict)
    
    # Technical SEO Data
    technical_seo = models.JSONField(default=dict)
    
    # Keyword Analysis
    keyword_data = models.JSONField(default=dict)
    
    # Competitor Analysis
    competitor_data = models.JSONField(default=dict)
    
    # AI-Generated Insights
    insights = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'seo_analyses'
        verbose_name = 'SEO Analysis'
        verbose_name_plural = 'SEO Analyses'
        ordering = ['-analysis_date']

    def __str__(self):
        return f"SEO Analysis for {self.domain} - {self.analysis_date.strftime('%Y-%m-%d')}"


# ===== SWOT ANALYSIS MODELS =====

class SWOTAnalysis(models.Model):
    """
    Store SWOT analysis data generated by Metrika.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    analysis_date = models.DateTimeField(auto_now_add=True)
    analysis_period = models.CharField(max_length=100)  # e.g., "Q1 2025", "Last 6 months"
    
    # SWOT Matrix
    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    opportunities = models.JSONField(default=list)
    threats = models.JSONField(default=list)
    
    # Data Sources Used
    data_sources = models.JSONField(default=list)
    
    # Strategic Recommendations
    strategic_recommendations = models.JSONField(default=list)
    
    # Market Context
    market_context = models.JSONField(default=dict)
    
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'swot_analyses'
        verbose_name = 'SWOT Analysis'
        verbose_name_plural = 'SWOT Analyses'
        ordering = ['-analysis_date']

    def __str__(self):
        return f"SWOT Analysis - {self.tenant.name} - {self.analysis_date.strftime('%Y-%m-%d')}"


# ===== INDUSTRY ANALYSIS MODELS =====

class IndustryAnalysis(models.Model):
    """
    Store industry analysis data for Metrika.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    analysis_date = models.DateTimeField(auto_now_add=True)
    industry = models.CharField(max_length=255)
    sub_industry = models.CharField(max_length=255, blank=True)
    
    # Market Data
    market_size = models.JSONField(default=dict)
    growth_rates = models.JSONField(default=dict)
    market_segments = models.JSONField(default=list)
    
    # Competitor Analysis
    competitors = models.JSONField(default=list)
    competitive_landscape = models.JSONField(default=dict)
    
    # Market Trends
    trends = models.JSONField(default=list)
    consumer_behavior = models.JSONField(default=dict)
    
    # Regulatory Environment
    regulations = models.JSONField(default=list)
    
    # Strategic Implications
    strategic_implications = models.JSONField(default=list)
    
    # Data Sources
    data_sources = models.JSONField(default=list)
    
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'industry_analyses'
        verbose_name = 'Industry Analysis'
        verbose_name_plural = 'Industry Analyses'
        ordering = ['-analysis_date']

    def __str__(self):
        return f"Industry Analysis - {self.industry} - {self.analysis_date.strftime('%Y-%m-%d')}"


# ===== DATA INTEGRATION MODELS =====

class DataSource(models.Model):
    """
    Track integrated data sources for analytics.
    """
    SOURCE_TYPE_CHOICES = [
        ('google_analytics', 'Google Analytics'),
        ('google_search_console', 'Google Search Console'),
        ('facebook_ads', 'Facebook Ads'),
        ('linkedin_ads', 'LinkedIn Ads'),
        ('twitter_ads', 'Twitter Ads'),
        ('crm', 'CRM System'),
        ('email_platform', 'Email Platform'),
        ('social_media', 'Social Media'),
        ('website', 'Website Analytics'),
        ('custom_api', 'Custom API'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    source_type = models.CharField(max_length=50, choices=SOURCE_TYPE_CHOICES)
    connection_config = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    sync_frequency = models.CharField(max_length=50, default='daily')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'data_sources'
        verbose_name = 'Data Source'
        verbose_name_plural = 'Data Sources'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_source_type_display()}) - {self.tenant.name}"


class DataSyncLog(models.Model):
    """
    Log data synchronization activities.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    data_source = models.ForeignKey(DataSource, on_delete=models.CASCADE)
    sync_started = models.DateTimeField(auto_now_add=True)
    sync_completed = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ], default='running')
    records_processed = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    sync_config = models.JSONField(default=dict)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'data_sync_logs'
        verbose_name = 'Data Sync Log'
        verbose_name_plural = 'Data Sync Logs'
        ordering = ['-sync_started']

    def __str__(self):
        return f"{self.data_source.name} sync - {self.status} at {self.sync_started}"
