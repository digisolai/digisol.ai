import uuid
from django.db import models
from core.models import Tenant, BrandProfile, Campaign
from accounts.models import CustomUser
from core.managers import TenantAwareManager


class ContentGenerationRequest(models.Model):
    """
    Model to track AI content generation requests and their status.
    Each request belongs to a specific tenant and user.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    CONTENT_TYPE_CHOICES = [
        ('email_subject', 'Email Subject'),
        ('email_body', 'Email Body'),
        ('social_post', 'Social Media Post'),
        ('blog_title', 'Blog Title'),
        ('blog_content', 'Blog Content'),
        ('ad_copy', 'Advertisement Copy'),
        ('landing_page', 'Landing Page Content'),
        ('product_description', 'Product Description'),
    ]
    
    # Core fields
    tenant = models.ForeignKey('core.Tenant', on_delete=models.CASCADE)
    requested_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
    # Request details
    prompt_text = models.TextField()
    content_type = models.CharField(max_length=50, choices=CONTENT_TYPE_CHOICES)
    context_data = models.JSONField(default=dict, blank=True)
    
    # Response and status
    generated_content = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    credits_used = models.IntegerField(default=0)
    
    # Error tracking
    error_message = models.TextField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Use tenant-aware manager
    objects = TenantAwareManager()
    
    class Meta:
        db_table = 'content_generation_requests'
        verbose_name = 'Content Generation Request'
        verbose_name_plural = 'Content Generation Requests'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.content_type} - {self.status} ({self.requested_by.email})"
    
    @property
    def is_completed(self):
        """Check if the request has been completed."""
        return self.status in ['completed', 'failed', 'cancelled']
    
    @property
    def processing_time(self):
        """Calculate processing time if completed."""
        if self.completed_at and self.created_at:
            return self.completed_at - self.created_at
        return None
    
    def mark_as_processing(self):
        """Mark the request as processing."""
        self.status = 'processing'
        self.save(update_fields=['status', 'updated_at'])
    
    def mark_as_completed(self, content, credits_used=1):
        """Mark the request as completed with generated content."""
        from django.utils import timezone
        self.status = 'completed'
        self.generated_content = content
        self.credits_used = credits_used
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'generated_content', 'credits_used', 'completed_at', 'updated_at'])
    
    def mark_as_failed(self, error_message):
        """Mark the request as failed with error message."""
        from django.utils import timezone
        self.status = 'failed'
        self.error_message = error_message
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'error_message', 'completed_at', 'updated_at'])


class ImageGenerationRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    DESIGN_TYPE_CHOICES = [
        ('general', 'General Image'),
        ('logo', 'Logo'),
        ('ad_banner', 'Ad Banner'),
        ('social_post', 'Social Media Post'),
        ('business_card', 'Business Card'),
        ('flyer', 'Flyer'),
        ('presentation_slide', 'Presentation Slide'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    requested_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    prompt_text = models.TextField()
    brand_profile = models.ForeignKey(BrandProfile, null=True, blank=True, on_delete=models.SET_NULL)
    design_type = models.CharField(
        max_length=50, 
        choices=DESIGN_TYPE_CHOICES, 
        default='general',
        help_text="Specifies the intended output type for the design"
    )
    design_parameters = models.JSONField(
        default=dict, 
        blank=True,
        help_text="Stores specific parameters for the chosen design_type"
    )
    generated_image_url = models.URLField(null=True, blank=True)
    edited_image_url = models.URLField(max_length=500, null=True, blank=True)
    is_edited = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    credits_cost = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'image_generation_requests'
        verbose_name = 'Image Generation Request'
        verbose_name_plural = 'Image Generation Requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.prompt_text[:30]}... ({self.status})"

    @property
    def final_image_url(self):
        """Return the edited image URL if available, otherwise the generated image URL."""
        return self.edited_image_url or self.generated_image_url

    @property
    def has_edits(self):
        """Check if the image has been edited."""
        return self.is_edited and self.edited_image_url


class AIRecommendation(models.Model):
    """
    Model for storing AI-generated strategic recommendations and planning insights.
    """
    RECOMMENDATION_TYPE_CHOICES = [
        ('campaign_optimization', 'Campaign Optimization'),
        ('lead_nurturing', 'Lead Nurturing'),
        ('churn_prediction', 'Churn Prediction'),
        ('content_strategy', 'Content Strategy'),
        ('audience_targeting', 'Audience Targeting'),
        ('budget_allocation', 'Budget Allocation'),
        ('performance_improvement', 'Performance Improvement'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='ai_recommendations')
    type = models.CharField(max_length=100, choices=RECOMMENDATION_TYPE_CHOICES)
    recommendation_text = models.TextField()
    context_data = models.JSONField(default=dict, blank=True)
    is_actionable = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)
    is_actioned = models.BooleanField(default=False)
    generated_by_agent = models.ForeignKey(
        'AIProfile', 
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        related_name='generated_recommendations'
    )
    campaign = models.ForeignKey(
        'core.Campaign',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='ai_recommendations',
        help_text="Campaign this recommendation is for (if applicable)"
    )
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ], default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'ai_recommendations'
        verbose_name = 'AI Recommendation'
        verbose_name_plural = 'AI Recommendations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_type_display()} - {self.user.email}"

    @property
    def is_active(self):
        """Check if the recommendation is still active (not dismissed)."""
        return not self.is_dismissed

    @property
    def recommendation_summary(self):
        """Return a summary of the recommendation for display."""
        return self.recommendation_text[:200] + "..." if len(self.recommendation_text) > 200 else self.recommendation_text

    def dismiss(self):
        """Mark the recommendation as dismissed."""
        self.is_dismissed = True
        self.save(update_fields=['is_dismissed', 'updated_at'])

    def mark_as_actioned(self):
        """Mark the recommendation as actioned."""
        self.is_actioned = True
        self.save(update_fields=['is_actioned', 'updated_at'])


class AIProfile(models.Model):
    """
    Model for AI agent personalities and their specializations.
    Can be global (tenant=None) or tenant-specific for custom agents.
    """
    SPECIALIZATION_CHOICES = [
        ('marketing_strategy', 'Marketing Strategy'),
        ('budget_analysis', 'Budget Analysis'),
        ('content_creation', 'Content Creation'),
        ('campaign_optimization', 'Campaign Optimization'),
        ('lead_nurturing', 'Lead Nurturing'),
        ('general_orchestration', 'General Orchestration'),
        ('data_analysis', 'Data Analysis'),
        ('hr_management', 'HR Management'),
        ('integrations_management', 'Integrations Management'),
        ('learning_guidance', 'Learning Guidance'),
        ('reporting_insights', 'Reporting Insights'),
        ('organizational_planning', 'Organizational Planning'),
        ('automation_design', 'Automation Design'),
        ('brand_identity', 'Brand Identity'),
        ('template_curation', 'Template Curation'),
        ('project_management', 'Project Management'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        Tenant, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Leave empty for global AI agents available to all tenants"
    )
    name = models.CharField(max_length=100)
    personality_description = models.TextField(blank=True)
    specialization = models.CharField(
        max_length=100, 
        choices=SPECIALIZATION_CHOICES,
        default='general_orchestration'
    )
    api_model_name = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'ai_profiles'
        verbose_name = 'AI Profile'
        verbose_name_plural = 'AI Profiles'
        unique_together = ['name', 'tenant']  # Each agent name unique per tenant (or global)
        ordering = ['specialization', 'name']

    def __str__(self):
        tenant_name = self.tenant.name if self.tenant else "Global"
        return f"{self.name} ({self.get_specialization_display()}) - {tenant_name}"

    @property
    def is_global(self):
        """Check if this is a global AI agent available to all tenants."""
        return self.tenant is None


class AITask(models.Model):
    """
    Model for tasks delegated to or created by an AI agent.
    Represents a task that is potentially part of a larger collaborative decision.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('delegated', 'Delegated'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    requester = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='requested_ai_tasks',
        null=True, 
        blank=True
    )
    assignee_agent = models.ForeignKey(
        AIProfile, 
        on_delete=models.SET_NULL,
        related_name='assigned_tasks',
        null=True, 
        blank=True
    )
    parent_task = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE,
        null=True, 
        blank=True,
        related_name='sub_tasks'
    )
    objective = models.TextField()
    status = models.CharField(
        max_length=50, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    context_data = models.JSONField(default=dict)
    result_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'ai_tasks'
        verbose_name = 'AI Task'
        verbose_name_plural = 'AI Tasks'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.objective[:50]}... ({self.status})"

    @property
    def is_completed(self):
        """Check if the task has been completed."""
        return self.status in ['completed', 'failed']

    @property
    def has_sub_tasks(self):
        """Check if this task has sub-tasks."""
        return self.sub_tasks.exists()

    @property
    def all_sub_tasks_completed(self):
        """Check if all sub-tasks are completed."""
        if not self.has_sub_tasks:
            return True
        return all(task.is_completed for task in self.sub_tasks.all())


class AIInteractionLog(models.Model):
    """
    Model for logging conversations and decision-making processes between AIs and/or humans.
    """
    ROLE_CHOICES = [
        ('user', 'User'),
        ('ai_agent', 'AI Agent'),
        ('system', 'System'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    ai_profile = models.ForeignKey(
        AIProfile, 
        on_delete=models.SET_NULL,
        null=True, 
        blank=True
    )
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL,
        null=True, 
        blank=True
    )
    ai_task = models.ForeignKey(
        AITask, 
        on_delete=models.CASCADE,
        null=True, 
        blank=True
    )
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    message_content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'ai_interaction_logs'
        verbose_name = 'AI Interaction Log'
        verbose_name_plural = 'AI Interaction Logs'
        ordering = ['timestamp']

    def __str__(self):
        agent_name = self.ai_profile.name if self.ai_profile else "System"
        user_name = self.user.email if self.user else "Unknown"
        return f"{self.role} - {agent_name if self.role == 'ai_agent' else user_name} ({self.timestamp.strftime('%H:%M:%S')})"

    @property
    def message_preview(self):
        """Get a preview of the message."""
        return self.message_content[:100] + "..." if len(self.message_content) > 100 else self.message_content


class StructuraInsight(models.Model):
    """
    Model for storing Structura's strategic insights, predictions, and recommendations.
    """
    INSIGHT_TYPE_CHOICES = [
        ('prediction', 'Prediction'),
        ('recommendation', 'Recommendation'),
        ('alert', 'Alert'),
        ('opportunity', 'Opportunity'),
    ]

    IMPACT_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    type = models.CharField(max_length=50, choices=INSIGHT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    confidence = models.IntegerField(help_text="Confidence score (0-100)")
    impact = models.CharField(max_length=20, choices=IMPACT_CHOICES)
    category = models.CharField(max_length=100, help_text="Business category (e.g., engagement, budget, retention)")
    actionable = models.BooleanField(default=True)
    action_text = models.CharField(max_length=100, blank=True, null=True)
    context_data = models.JSONField(default=dict, blank=True)
    generated_by_agent = models.ForeignKey(
        AIProfile, 
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        related_name='generated_insights'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'structura_insights'
        verbose_name = 'Structura Insight'
        verbose_name_plural = 'Structura Insights'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_type_display()} - {self.title}"

    @property
    def is_active(self):
        """Check if the insight is still relevant (not older than 30 days)."""
        from django.utils import timezone
        from datetime import timedelta
        return self.created_at > timezone.now() - timedelta(days=30)


class AIEcosystemHealth(models.Model):
    """
    Model for tracking the overall health and performance of the AI ecosystem.
    """
    SYSTEM_STATUS_CHOICES = [
        ('optimal', 'Optimal'),
        ('good', 'Good'),
        ('attention', 'Needs Attention'),
        ('critical', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    overall_score = models.IntegerField(help_text="Overall health score (0-100)")
    active_agents = models.IntegerField()
    total_agents = models.IntegerField()
    system_status = models.CharField(max_length=20, choices=SYSTEM_STATUS_CHOICES)
    agent_statuses = models.JSONField(default=list, help_text="Detailed status of each agent")
    last_updated = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'ai_ecosystem_health'
        verbose_name = 'AI Ecosystem Health'
        verbose_name_plural = 'AI Ecosystem Health'
        ordering = ['-last_updated']

    def __str__(self):
        return f"Ecosystem Health - {self.tenant.name} ({self.overall_score}%)"

    @property
    def health_percentage(self):
        """Return health as a percentage."""
        return f"{self.overall_score}%"

    def update_health_score(self):
        """Recalculate the overall health score based on agent statuses."""
        if not self.agent_statuses:
            return
        
        total_score = 0
        active_count = 0
        
        for agent_status in self.agent_statuses:
            if agent_status.get('status') == 'active':
                active_count += 1
                total_score += agent_status.get('performance_score', 0)
        
        if active_count > 0:
            self.overall_score = total_score // active_count
            self.active_agents = active_count
        else:
            self.overall_score = 0
            self.active_agents = 0
        
        # Update system status based on score
        if self.overall_score >= 90:
            self.system_status = 'optimal'
        elif self.overall_score >= 75:
            self.system_status = 'good'
        elif self.overall_score >= 50:
            self.system_status = 'attention'
        else:
            self.system_status = 'critical'
        
        self.save(update_fields=['overall_score', 'active_agents', 'system_status', 'last_updated'])
