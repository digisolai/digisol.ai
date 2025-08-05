from django.db import models
from django.db.models import JSONField
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import Tenant
from accounts.models import CustomUser
import uuid


class MarketingCampaign(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Active', 'Active'),
        ('Paused', 'Paused'),
        ('Completed', 'Completed'),
        ('Archived', 'Archived'),
    ]

    CAMPAIGN_TYPE_CHOICES = [
        ('email', 'Email Campaign'),
        ('social', 'Social Media Campaign'),
        ('paid_ads', 'Paid Advertising'),
        ('content', 'Content Marketing'),
        ('event', 'Event Marketing'),
        ('product_launch', 'Product Launch'),
        ('lead_nurturing', 'Lead Nurturing'),
        ('retention', 'Customer Retention'),
        ('multi_channel', 'Multi-Channel'),
    ]

    OBJECTIVE_CHOICES = [
        ('awareness', 'Brand Awareness'),
        ('traffic', 'Drive Traffic'),
        ('leads', 'Generate Leads'),
        ('sales', 'Increase Sales'),
        ('engagement', 'Boost Engagement'),
        ('conversion', 'Improve Conversion'),
        ('retention', 'Customer Retention'),
        ('loyalty', 'Build Loyalty'),
    ]

    # Core Campaign Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    campaign_type = models.CharField(max_length=50, choices=CAMPAIGN_TYPE_CHOICES, default='email')
    objective = models.CharField(max_length=50, choices=OBJECTIVE_CHOICES, default='leads')
    
    # Status and Lifecycle
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Draft')
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    
    # Targeting and Audience
    target_audience_segment = models.CharField(max_length=255, blank=True, null=True)
    audience_criteria = JSONField(default=dict, blank=True)
    estimated_reach = models.IntegerField(null=True, blank=True)
    
    # Budget and Performance
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    spent_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    target_roi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # AI and Optimization
    catalyst_health_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True, blank=True,
        help_text="AI-generated health score (0-100)"
    )
    catalyst_recommendations = JSONField(default=list, blank=True)
    auto_optimization_enabled = models.BooleanField(default=False)
    last_optimized = models.DateTimeField(null=True, blank=True)
    
    # Template and Reusability
    is_template = models.BooleanField(default=False)
    template_category = models.CharField(max_length=100, blank=True, null=True)
    
    # Performance Tracking
    performance_metrics = JSONField(default=dict, blank=True)
    conversion_goals = JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Marketing Campaign'
        verbose_name_plural = 'Marketing Campaigns'

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"

    @property
    def is_active(self):
        return self.status == 'Active'

    @property
    def budget_utilization(self):
        if not self.budget:
            return 0
        return (self.spent_budget / self.budget) * 100

    @property
    def days_remaining(self):
        if not self.end_date:
            return None
        from django.utils import timezone
        remaining = self.end_date - timezone.now()
        return max(0, remaining.days)


class CampaignStep(models.Model):
    STEP_TYPE_CHOICES = [
        ('Email', 'Email'),
        ('SMS', 'SMS'),
        ('Ad', 'Ad Display'),
        ('Conditional', 'Conditional Logic'),
        ('Delay', 'Delay'),
        ('Goal', 'Campaign Goal'),
        ('AI_Insight', 'AI Insight/Action'),
        ('Trigger', 'Trigger'),
        ('Social_Post', 'Social Media Post'),
        ('Landing_Page', 'Landing Page'),
        ('Webhook', 'Webhook'),
        ('A_B_Test', 'A/B Test'),
    ]

    # Core Step Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(
        MarketingCampaign,
        on_delete=models.CASCADE,
        related_name='steps'
    )
    step_type = models.CharField(max_length=50, choices=STEP_TYPE_CHOICES)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    order = models.IntegerField(default=0)
    
    # Configuration and Content
    config = JSONField(default=dict)
    content_data = JSONField(default=dict, blank=True)
    metadata = JSONField(default=dict)
    
    # Flow Control
    parent_steps = models.ManyToManyField(
        'self',
        symmetrical=False,
        blank=True,
        related_name='child_steps'
    )
    true_path_next_step = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conditional_true_parent'
    )
    false_path_next_step = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conditional_false_parent'
    )
    
    # AI Integration
    catalyst_optimized = models.BooleanField(default=False)
    catalyst_suggestions = JSONField(default=list, blank=True)
    performance_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Execution Status
    is_enabled = models.BooleanField(default=True)
    execution_count = models.IntegerField(default=0)
    last_executed = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Campaign Step'
        verbose_name_plural = 'Campaign Steps'

    def __str__(self):
        return f"{self.name} ({self.campaign.name})"


class CatalystInsight(models.Model):
    """
    Model for storing Catalyst AI insights and recommendations for campaigns
    """
    INSIGHT_TYPE_CHOICES = [
        ('performance_alert', 'Performance Alert'),
        ('optimization_suggestion', 'Optimization Suggestion'),
        ('anomaly_detection', 'Anomaly Detection'),
        ('trend_forecast', 'Trend Forecast'),
        ('audience_insight', 'Audience Insight'),
        ('content_recommendation', 'Content Recommendation'),
        ('timing_optimization', 'Timing Optimization'),
        ('budget_recommendation', 'Budget Recommendation'),
        ('competitive_analysis', 'Competitive Analysis'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    # Core Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    campaign = models.ForeignKey(
        MarketingCampaign,
        on_delete=models.CASCADE,
        related_name='catalyst_insights'
    )
    step = models.ForeignKey(
        CampaignStep,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='catalyst_insights'
    )
    
    # Insight Details
    insight_type = models.CharField(max_length=50, choices=INSIGHT_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    recommendation = models.TextField(blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    # Impact and Metrics
    predicted_impact = JSONField(default=dict, blank=True)
    confidence_score = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True, blank=True
    )
    
    # Status
    is_actioned = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)
    action_taken = models.TextField(blank=True)
    
    # Context Data
    context_data = JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-priority', '-created_at']
        verbose_name = 'Catalyst Insight'
        verbose_name_plural = 'Catalyst Insights'

    def __str__(self):
        return f"{self.title} - {self.campaign.name}"

    @property
    def is_active(self):
        """Check if the insight is still active and not expired"""
        if self.is_dismissed or self.is_actioned:
            return False
        if self.expires_at:
            from django.utils import timezone
            return timezone.now() < self.expires_at
        return True


class CampaignPerformance(models.Model):
    """
    Model for tracking detailed campaign performance metrics
    """
    # Core Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(
        MarketingCampaign,
        on_delete=models.CASCADE,
        related_name='performance_data'
    )
    step = models.ForeignKey(
        CampaignStep,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='performance_data'
    )
    
    # Date and Time
    date = models.DateField()
    hour = models.IntegerField(null=True, blank=True)  # For hourly tracking
    
    # Key Metrics
    impressions = models.IntegerField(default=0)
    clicks = models.IntegerField(default=0)
    conversions = models.IntegerField(default=0)
    revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Engagement Metrics
    opens = models.IntegerField(default=0)  # For email campaigns
    bounces = models.IntegerField(default=0)
    unsubscribes = models.IntegerField(default=0)
    
    # Calculated Metrics
    ctr = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    cpc = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cpm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    roi = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Additional Data
    metadata = JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-hour']
        unique_together = ['campaign', 'step', 'date', 'hour']
        verbose_name = 'Campaign Performance'
        verbose_name_plural = 'Campaign Performance Data'

    def __str__(self):
        return f"{self.campaign.name} - {self.date}"

    def save(self, *args, **kwargs):
        # Calculate derived metrics
        if self.impressions > 0:
            self.ctr = self.clicks / self.impressions
        if self.clicks > 0:
            self.cpc = self.cost / self.clicks
        if self.impressions > 0:
            self.cpm = (self.cost / self.impressions) * 1000
        if self.clicks > 0:
            self.conversion_rate = self.conversions / self.clicks
        if self.cost > 0:
            self.roi = ((self.revenue - self.cost) / self.cost) * 100
        
        super().save(*args, **kwargs)


class CampaignAudience(models.Model):
    """
    Model for managing campaign audiences and segments
    """
    SEGMENT_TYPE_CHOICES = [
        ('static', 'Static List'),
        ('dynamic', 'Dynamic Segment'),
        ('lookalike', 'Lookalike Audience'),
        ('custom', 'Custom Criteria'),
    ]

    # Core Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    segment_type = models.CharField(max_length=20, choices=SEGMENT_TYPE_CHOICES, default='static')
    
    # Audience Criteria
    criteria = JSONField(default=dict, blank=True)
    filters = JSONField(default=list, blank=True)
    
    # Size and Reach
    estimated_size = models.IntegerField(null=True, blank=True)
    actual_size = models.IntegerField(null=True, blank=True)
    
    # Performance
    engagement_rate = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    
    # AI Insights
    catalyst_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    catalyst_recommendations = JSONField(default=list, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Campaign Audience'
        verbose_name_plural = 'Campaign Audiences'

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"


class CampaignTemplate(models.Model):
    """
    Model for campaign templates that can be reused
    """
    TEMPLATE_CATEGORY_CHOICES = [
        ('email_series', 'Email Series'),
        ('social_campaign', 'Social Media Campaign'),
        ('product_launch', 'Product Launch'),
        ('holiday_promotion', 'Holiday Promotion'),
        ('lead_nurturing', 'Lead Nurturing'),
        ('customer_onboarding', 'Customer Onboarding'),
        ('re_engagement', 'Re-engagement'),
        ('seasonal', 'Seasonal Campaign'),
    ]

    # Core Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True, blank=True)  # null for global templates
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=TEMPLATE_CATEGORY_CHOICES)
    
    # Template Data
    campaign_data = JSONField(default=dict)
    steps_data = JSONField(default=list)
    settings = JSONField(default=dict, blank=True)
    
    # Usage and Popularity
    usage_count = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    
    # Status
    is_public = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-usage_count', '-rating']
        verbose_name = 'Campaign Template'
        verbose_name_plural = 'Campaign Templates'

    def __str__(self):
        tenant_name = self.tenant.name if self.tenant else "Global"
        return f"{self.name} ({tenant_name})"

    @property
    def is_global(self):
        return self.tenant is None 