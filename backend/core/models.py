import uuid
from django.db import models
from django.utils import timezone
from accounts.models import CustomUser
from .managers import TenantAwareManager


class Tenant(models.Model):
    """
    Tenant model for multi-tenancy support.
    Each tenant represents a separate organization/customer using the platform.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    subdomain = models.CharField(max_length=255, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Subscription and usage tracking
    active_subscription = models.OneToOneField('subscription_billing.Subscription', null=True, blank=True, related_name='tenant_current_subscription', on_delete=models.SET_NULL)
    contacts_used_current_period = models.IntegerField(default=0)
    emails_sent_current_period = models.IntegerField(default=0)
    
    # New Token-Based System
    tokens_used_current_period = models.IntegerField(default=0, help_text="Tokens used in the current billing period")
    tokens_purchased_additional = models.IntegerField(default=0, help_text="Additional tokens purchased beyond plan allocation")
    
    # Legacy AI Credits (keeping for backward compatibility)
    ai_text_credits_used_current_period = models.IntegerField(default=0)
    ai_image_credits_used_current_period = models.IntegerField(default=0)
    ai_planning_requests_used_current_period = models.IntegerField(default=0)

    class Meta:
        db_table = 'tenants'
        verbose_name = 'Tenant'
        verbose_name_plural = 'Tenants'

    def __str__(self):
        return self.name

    @property
    def is_subdomain_based(self):
        """Check if this tenant uses subdomain-based routing."""
        return bool(self.subdomain)

    # Subscription-based feature access methods
    def can_send_email(self):
        """Check if tenant can send emails based on subscription limits."""
        if not self.active_subscription or not self.active_subscription.plan:
            return False
        plan = self.active_subscription.plan
        if plan.email_send_limit == -1:  # Unlimited
            return True
        return self.emails_sent_current_period < plan.email_send_limit

    def can_generate_ai_text(self):
        """Check if tenant can generate AI text based on subscription limits."""
        if not self.active_subscription or not self.active_subscription.plan:
            return False
        plan = self.active_subscription.plan
        if plan.ai_text_credits_per_month == -1:  # Unlimited
            return True
        return self.ai_text_credits_used_current_period < plan.ai_text_credits_per_month

    def can_generate_ai_image(self):
        """Check if tenant can generate AI images based on subscription limits."""
        if not self.active_subscription or not self.active_subscription.plan:
            return False
        plan = self.active_subscription.plan
        if plan.ai_image_credits_per_month == -1:  # Unlimited
            return True
        return self.ai_image_credits_used_current_period < plan.ai_image_credits_per_month

    def can_generate_ai_plan(self):
        """Check if tenant can generate AI planning requests based on subscription limits."""
        if not self.active_subscription or not self.active_subscription.plan:
            return False
        plan = self.active_subscription.plan
        if plan.ai_planning_requests_per_month == -1:  # Unlimited
            return True
        return self.ai_planning_requests_used_current_period < plan.ai_planning_requests_per_month



    def can_add_contact(self):
        """Check if tenant can add more contacts based on subscription limits."""
        if not self.active_subscription or not self.active_subscription.plan:
            return False
        plan = self.active_subscription.plan
        if plan.contact_limit == -1:  # Unlimited
            return True
        return self.contacts_used_current_period < plan.contact_limit

    def get_remaining_ai_text_credits(self):
        """Get remaining AI text credits."""
        if not self.active_subscription or not self.active_subscription.plan:
            return 0
        plan = self.active_subscription.plan
        if plan.ai_text_credits_per_month == -1:  # Unlimited
            return -1
        return max(0, plan.ai_text_credits_per_month - self.ai_text_credits_used_current_period)

    def get_remaining_ai_image_credits(self):
        """Get remaining AI image credits."""
        if not self.active_subscription or not self.active_subscription.plan:
            return 0
        plan = self.active_subscription.plan
        if plan.ai_image_credits_per_month == -1:  # Unlimited
            return -1
        return max(0, plan.ai_image_credits_per_month - self.ai_image_credits_used_current_period)

    def get_remaining_ai_planning_requests(self):
        """Get remaining AI planning requests."""
        if not self.active_subscription or not self.active_subscription.plan:
            return 0
        plan = self.active_subscription.plan
        if plan.ai_planning_requests_per_month == -1:  # Unlimited
            return -1
        return max(0, plan.ai_planning_requests_per_month - self.ai_planning_requests_used_current_period)

    # New Token-Based System Methods
    def can_use_tokens(self, token_count):
        """Check if tenant can use specified number of tokens."""
        if not self.active_subscription or not self.active_subscription.plan:
            return False
        plan = self.active_subscription.plan
        if plan.monthly_tokens == -1:  # Unlimited
            return True
        total_available = plan.monthly_tokens + self.tokens_purchased_additional
        return self.tokens_used_current_period + token_count <= total_available

    def get_remaining_tokens(self):
        """Get remaining tokens available to the tenant."""
        if not self.active_subscription or not self.active_subscription.plan:
            return 0
        plan = self.active_subscription.plan
        if plan.monthly_tokens == -1:  # Unlimited
            return -1
        total_available = plan.monthly_tokens + self.tokens_purchased_additional
        return max(0, total_available - self.tokens_used_current_period)

    def use_tokens(self, token_count):
        """Consume tokens for the tenant."""
        if self.can_use_tokens(token_count):
            self.tokens_used_current_period += token_count
            self.save()
            return True
        return False

    def purchase_additional_tokens(self, token_count):
        """Purchase additional tokens beyond plan allocation."""
        self.tokens_purchased_additional += token_count
        self.save()
        return True

    def can_create_automation_workflow(self):
        """Check if tenant can create more automation workflows."""
        if not self.active_subscription or not self.active_subscription.plan:
            return False
        plan = self.active_subscription.plan
        if plan.automation_workflow_limit == -1:  # Unlimited
            return True
        # This would need to be implemented with actual workflow counting
        # For now, return True if the plan allows it
        return plan.automation_workflow_limit > 0

    def can_add_integration(self):
        """Check if tenant can add more integrations."""
        if not self.active_subscription or not self.active_subscription.plan:
            return False
        plan = self.active_subscription.plan
        if plan.integration_limit == -1:  # Unlimited
            return True
        # This would need to be implemented with actual integration counting
        # For now, return True if the plan allows it
        return plan.integration_limit > 0


class Contact(models.Model):
    """
    Contact model for storing customer/lead information with advanced lead management capabilities.
    Each contact belongs to a specific tenant.
    """
    # Basic contact information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    company = models.CharField(max_length=255, null=True, blank=True)
    job_title = models.CharField(max_length=255, null=True, blank=True)
    
    # Lead management fields
    lead_source = models.CharField(max_length=100, null=True, blank=True, help_text="e.g., Website, Referral, Cold Call")
    lead_status = models.CharField(max_length=50, default="New Lead", help_text="e.g., New Lead, Contacted, Qualified, Unqualified, Customer")
    last_contact_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True, help_text="For custom categorization")
    priority = models.CharField(max_length=20, default="Medium", help_text="e.g., High, Medium, Low")
    score = models.IntegerField(default=0, help_text="A numerical lead score")
    
    # AI-powered insights
    last_activity_summary = models.TextField(null=True, blank=True, help_text="AI-generated summary of recent interactions")
    next_action_suggestion = models.TextField(null=True, blank=True, help_text="AI-generated suggestion for the next best action")
    suggested_persona = models.CharField(max_length=255, null=True, blank=True, help_text="AI-suggested buyer persona name (e.g., 'Tech Innovator', 'SMB Owner', 'Enterprise Buyer')")
    
    # Legacy fields for backward compatibility
    phone = models.CharField(max_length=20, blank=True, null=True)  # Keep for backward compatibility
    title = models.CharField(max_length=100, blank=True, null=True)  # Keep for backward compatibility
    custom_fields = models.JSONField(default=dict, blank=True)
    
    # Tenant relationship
    tenant = models.ForeignKey('core.Tenant', on_delete=models.CASCADE)
    
    # Lead routing fields
    assigned_to_user = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_contacts'
    )

    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'contacts'
        verbose_name = 'Contact'
        verbose_name_plural = 'Contacts'
        unique_together = ['email', 'tenant']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def update_lead_score(self, points):
        """Update the lead score by adding points."""
        self.score += points
        self.save(update_fields=['score'])
    
    def mark_contacted(self):
        """Mark the contact as contacted and update the last contact date."""
        self.lead_status = "Contacted"
        self.last_contact_date = timezone.now()
        self.save(update_fields=['lead_status', 'last_contact_date'])
    
    def qualify_lead(self):
        """Mark the contact as a qualified lead."""
        self.lead_status = "Qualified"
        self.save(update_fields=['lead_status'])
    
    def convert_to_customer(self):
        """Convert the contact to a customer."""
        self.lead_status = "Customer"
        self.save(update_fields=['lead_status'])
    
    def add_tag(self, tag):
        """Add a tag to the contact."""
        if tag not in self.tags:
            self.tags.append(tag)
            self.save(update_fields=['tags'])
    
    def remove_tag(self, tag):
        """Remove a tag from the contact."""
        if tag in self.tags:
            self.tags.remove(tag)
            self.save(update_fields=['tags'])


class Campaign(models.Model):
    """
    Campaign model for marketing campaigns.
    Each campaign belongs to a specific tenant and creator.
    """
    CAMPAIGN_TYPE_CHOICES = [
        ('email', 'Email'),
        ('social', 'Social Media'),
        ('sms', 'SMS'),
        ('webinar', 'Webinar'),
        ('event', 'Event'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    name = models.CharField(max_length=200)
    campaign_type = models.CharField(max_length=20, choices=CAMPAIGN_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    
    # Enhanced digital marketing fields
    objective = models.TextField(blank=True, null=True, help_text="What is the campaign trying to achieve? (e.g., 'Lead Generation', 'Brand Awareness', 'Customer Retention')")
    budget_allocated = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Total budget allocated for this campaign")
    target_audience_description = models.TextField(blank=True, null=True, help_text="Description of who the campaign is targeting")
    channel_details = models.JSONField(default=dict, blank=True, help_text="Channel-specific settings (e.g., {'email_subject_line': 'X', 'social_hashtags': ['#Y']})")
    expected_roi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Expected Return on Investment (e.g., 1.5 for 150%)")
    kpis = models.JSONField(default=dict, blank=True, help_text="Key Performance Indicators (e.g., {'open_rate': 0.2, 'click_through_rate': 0.05, 'conversions': 100})")
    notes = models.TextField(blank=True, null=True, help_text="General campaign notes and observations")
    
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    tenant = models.ForeignKey('core.Tenant', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'campaigns'
        verbose_name = 'Campaign'
        verbose_name_plural = 'Campaigns'

    def __str__(self):
        return f"{self.name} ({self.campaign_type})"

    @property
    def duration_days(self):
        """Calculate campaign duration in days."""
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days
        return None

    @property
    def is_active_campaign(self):
        """Check if campaign is currently active."""
        from django.utils import timezone
        now = timezone.now()
        return (
            self.status == 'active' and
            (not self.start_date or self.start_date <= now) and
            (not self.end_date or self.end_date >= now)
        )


class EmailTemplate(models.Model):
    """
    Email template model for reusable email content.
    Each template belongs to a specific tenant.
    """
    name = models.CharField(max_length=200)
    subject = models.CharField(max_length=255)
    body_html = models.TextField()
    tenant = models.ForeignKey('core.Tenant', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'email_templates'
        verbose_name = 'Email Template'
        verbose_name_plural = 'Email Templates'
        unique_together = ['name', 'tenant']

    def __str__(self):
        return self.name


class AutomationWorkflow(models.Model):
    """
    Automation workflow model for marketing automation.
    Each workflow belongs to a specific tenant.
    """
    name = models.CharField(max_length=200)
    trigger_config = models.JSONField(default=dict)
    steps_config = models.JSONField(default=dict)
    is_active = models.BooleanField(default=False)
    tenant = models.ForeignKey('core.Tenant', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'automation_workflows'
        verbose_name = 'Automation Workflow'
        verbose_name_plural = 'Automation Workflows'
        unique_together = ['name', 'tenant']

    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"


class AutomationExecution(models.Model):
    """
    Automation execution model for tracking workflow executions.
    Each execution represents a contact going through a workflow.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('core.Tenant', on_delete=models.CASCADE)
    workflow = models.ForeignKey(AutomationWorkflow, on_delete=models.CASCADE)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, null=True, blank=True)
    current_step_index = models.IntegerField(default=0)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='active')
    context_data = models.JSONField(default=dict, help_text="Dynamic data relevant to this execution")
    started_at = models.DateTimeField(auto_now_add=True)
    last_executed_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'automation_executions'
        verbose_name = 'Automation Execution'
        verbose_name_plural = 'Automation Executions'
        indexes = [
            models.Index(fields=['tenant', 'workflow', 'status']),
            models.Index(fields=['contact', 'status']),
            models.Index(fields=['last_executed_at']),
        ]

    def __str__(self):
        contact_name = self.contact.full_name if self.contact else "No Contact"
        return f"{self.workflow.name} - {contact_name} ({self.status})"

    @property
    def current_step(self):
        """Get the current step configuration."""
        steps = self.workflow.steps_config.get('steps', [])
        if 0 <= self.current_step_index < len(steps):
            return steps[self.current_step_index]
        return None

    @property
    def is_completed(self):
        """Check if execution is completed."""
        return self.status == 'completed'

    @property
    def is_failed(self):
        """Check if execution has failed."""
        return self.status == 'failed'

    @property
    def can_proceed(self):
        """Check if execution can proceed to next step."""
        return self.status == 'active' and not self.is_completed and not self.is_failed

    def mark_completed(self):
        """Mark execution as completed."""
        from django.utils import timezone
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()

    def mark_failed(self, error_message=None):
        """Mark execution as failed."""
        from django.utils import timezone
        self.status = 'failed'
        self.completed_at = timezone.now()
        if error_message:
            self.context_data['error_message'] = error_message
        self.save()

    def advance_step(self):
        """Advance to the next step."""
        from django.utils import timezone
        self.current_step_index += 1
        self.last_executed_at = timezone.now()
        self.save()


class BrandProfile(models.Model):
    """
    Brand profile model for tenant branding configuration.
    Each tenant has one brand profile.
    """
    tenant = models.OneToOneField('core.Tenant', on_delete=models.CASCADE)
    
    # Section 1: Branding Overview & Status
    branding_status = models.CharField(
        max_length=20, 
        choices=[
            ('active', 'Active'),
            ('pending', 'Pending'),
            ('not_configured', 'Not Configured')
        ],
        default='not_configured',
        help_text="Current status of branding configuration"
    )
    last_updated_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='brand_profiles_updated'
    )
    
    # Basic brand information
    name = models.CharField(max_length=255, blank=True, null=True, help_text="Brand name")
    description = models.TextField(blank=True, null=True, help_text="Brand description")
    
    # Section 2: Core Visual Identity
    logo_url = models.ImageField(upload_to='brand_logos/', null=True, blank=True, help_text="Main logo")
    dark_mode_logo_url = models.ImageField(upload_to='brand_logos/', null=True, blank=True, help_text="Dark mode logo")
    favicon_url = models.ImageField(upload_to='brand_assets/', null=True, blank=True, help_text="Favicon")
    app_icon_url = models.ImageField(upload_to='brand_assets/', null=True, blank=True, help_text="App icon for mobile/tablet")
    
    # Color palette
    primary_color = models.CharField(max_length=7, default='#1F4287', help_text="Primary brand color (hex)")
    secondary_color = models.CharField(max_length=7, default='#FFC300', help_text="Secondary brand color (hex)")
    background_color = models.CharField(max_length=7, default='#FFFFFF', help_text="Main background color (hex)")
    primary_text_color = models.CharField(max_length=7, default='#1A202C', help_text="Primary text color (hex)")
    secondary_text_color = models.CharField(max_length=7, default='#718096', help_text="Secondary text color (hex)")
    link_color = models.CharField(max_length=7, default='#3182CE', help_text="Link color (hex)")
    
    # Typography
    font_family = models.CharField(max_length=100, default='Inter', help_text="Primary font family")
    base_font_size = models.IntegerField(default=16, help_text="Base font size in pixels")
    headings_font_family = models.CharField(max_length=100, default='Inter', help_text="Headings font family")
    font_weights = models.JSONField(default=list, blank=True, help_text="List of font weights (e.g., ['400', '500', '600'])")
    
    # Section 3: Interface Elements & Layout
    nav_bar_bg_color = models.CharField(max_length=7, default='#FFFFFF', help_text="Navigation bar background color")
    nav_bar_text_color = models.CharField(max_length=7, default='#1A202C', help_text="Navigation bar text color")
    nav_bar_active_color = models.CharField(max_length=7, default='#1F4287', help_text="Navigation bar active item color")
    
    button_primary_bg = models.CharField(max_length=7, default='#1F4287', help_text="Primary button background color")
    button_primary_text = models.CharField(max_length=7, default='#FFFFFF', help_text="Primary button text color")
    button_primary_border_radius = models.IntegerField(default=8, help_text="Primary button border radius in pixels")
    button_primary_hover_bg = models.CharField(max_length=7, default='#1A365D', help_text="Primary button hover background color")
    
    button_secondary_bg = models.CharField(max_length=7, default='#E2E8F0', help_text="Secondary button background color")
    button_secondary_text = models.CharField(max_length=7, default='#1A202C', help_text="Secondary button text color")
    button_secondary_border_radius = models.IntegerField(default=8, help_text="Secondary button border radius in pixels")
    
    input_border_color = models.CharField(max_length=7, default='#E2E8F0', help_text="Input field border color")
    input_bg_color = models.CharField(max_length=7, default='#FFFFFF', help_text="Input field background color")
    input_focus_color = models.CharField(max_length=7, default='#1F4287', help_text="Input field focus color")
    input_border_radius = models.IntegerField(default=8, help_text="Input field border radius in pixels")
    
    scrollbar_thumb_color = models.CharField(max_length=7, default='#CBD5E0', help_text="Scrollbar thumb color")
    scrollbar_track_color = models.CharField(max_length=7, default='#F7FAFC', help_text="Scrollbar track color")
    
    # Section 4: Advanced Branding & Customization
    custom_css = models.TextField(blank=True, null=True, help_text="Custom CSS code")
    custom_js = models.TextField(blank=True, null=True, help_text="Custom JavaScript code")
    custom_css_enabled = models.BooleanField(default=False, help_text="Whether custom CSS is enabled")
    custom_js_enabled = models.BooleanField(default=False, help_text="Whether custom JavaScript is enabled")
    
    landing_page_bg_image = models.ImageField(upload_to='brand_assets/', null=True, blank=True, help_text="Landing page background image")
    landing_page_overlay_color = models.CharField(max_length=7, default='#000000', help_text="Landing page overlay color")
    landing_page_overlay_opacity = models.FloatField(default=0.5, help_text="Landing page overlay opacity (0.0 to 1.0)")
    landing_page_welcome_message = models.TextField(blank=True, null=True, help_text="Landing page welcome message")
    landing_page_footer_text = models.TextField(blank=True, null=True, help_text="Landing page footer text")
    
    email_header_logo = models.ImageField(upload_to='brand_assets/', null=True, blank=True, help_text="Email template header logo")
    email_primary_color = models.CharField(max_length=7, default='#1F4287', help_text="Email template primary color")
    email_footer_text = models.TextField(blank=True, null=True, help_text="Email template footer text")
    
    # Legacy fields for backward compatibility
    brand_voice = models.TextField(blank=True, null=True, help_text="Brand's tone of voice and personality")
    tone_of_voice_description = models.TextField(blank=True, null=True)  # Keep for backward compatibility
    
    # Mission and vision
    mission = models.TextField(blank=True, null=True, help_text="Brand's mission statement")
    vision = models.TextField(blank=True, null=True, help_text="Brand's vision statement")
    
    # Target audience
    target_audience = models.CharField(max_length=255, blank=True, null=True, help_text="Primary target audience")
    target_audience_description = models.TextField(blank=True, null=True, help_text="Detailed description of ideal customer")
    
    # Key messaging and values
    key_messaging = models.JSONField(default=list, blank=True, help_text="List of core messages or slogans")
    brand_values = models.JSONField(default=list, blank=True, help_text="List of brand's core values")
    
    # Industry and contact information
    industry = models.CharField(max_length=255, blank=True, null=True, help_text="Industry the brand operates in")
    website_url = models.URLField(max_length=500, blank=True, null=True, help_text="Brand's website URL")
    contact_email = models.EmailField(blank=True, null=True, help_text="Primary contact email")
    phone_number = models.CharField(max_length=20, blank=True, null=True, help_text="Contact phone number")
    
    # Social media and competitive landscape
    social_media_links = models.JSONField(default=dict, blank=True, help_text="Dictionary of social media URLs")
    competitors = models.JSONField(default=list, blank=True, help_text="List of key competitors")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'brand_profiles'
        verbose_name = 'Brand Profile'
        verbose_name_plural = 'Brand Profiles'

    def __str__(self):
        return f"Brand Profile for {self.tenant.name}"
    
    def save(self, *args, **kwargs):
        """Override save to update branding status."""
        if self.primary_color and self.name:
            self.branding_status = 'active'
        elif self.primary_color or self.name:
            self.branding_status = 'pending'
        else:
            self.branding_status = 'not_configured'
        super().save(*args, **kwargs)


class BrandAsset(models.Model):
    """
    Brand asset model for storing various types of brand assets.
    Each asset belongs to a specific tenant and can be linked to AI-generated content.
    """
    ASSET_TYPE_CHOICES = [
        ('image', 'Image'),
        ('logo', 'Logo'),
        ('document', 'Document'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
    # Asset details
    name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=50, choices=ASSET_TYPE_CHOICES, default='image')
    file_url = models.URLField(max_length=500)
    description = models.TextField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    
    # Sharing and visibility
    is_shared_with_clients = models.BooleanField(default=False)
    
    # AI generation tracking
    original_image_request = models.ForeignKey(
        'ai_services.ImageGenerationRequest',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='brand_assets'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'brand_assets'
        verbose_name = 'Brand Asset'
        verbose_name_plural = 'Brand Assets'
        ordering = ['-created_at']
        unique_together = ['name', 'tenant']  # Each asset name unique per tenant

    def __str__(self):
        return f"{self.name} ({self.get_asset_type_display()}) - {self.tenant.name}"

    @property
    def is_ai_generated(self):
        """Check if this asset was generated by AI."""
        return self.original_image_request is not None

    @property
    def is_edited_version(self):
        """Check if this is an edited version of an AI-generated image."""
        if self.original_image_request:
            return self.original_image_request.is_edited
        return False

    @property
    def tag_list(self):
        """Return tags as a list for easy access."""
        return self.tags if isinstance(self.tags, list) else []

    def add_tag(self, tag):
        """Add a tag to the asset."""
        if tag not in self.tag_list:
            self.tags.append(tag)
            self.save(update_fields=['tags', 'updated_at'])

    def remove_tag(self, tag):
        """Remove a tag from the asset."""
        if tag in self.tag_list:
            self.tags.remove(tag)
            self.save(update_fields=['tags', 'updated_at'])

class AgencyClientPortal(models.Model):
    """
    Agency Client Portal model for managing client relationships and access.
    Each client portal belongs to a parent tenant (agency/marketer).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Parent tenant (the agency/marketer)
    parent_tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='agency_client_portals')
    
    # Client information
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=20, blank=True, null=True)
    client_company = models.CharField(max_length=255, blank=True, null=True)
    client_website = models.URLField(blank=True, null=True)
    
    # Client portal settings
    is_active = models.BooleanField(default=True)
    access_level = models.CharField(
        max_length=20,
        choices=[
            ('basic', 'Basic Access'),
            ('standard', 'Standard Access'),
            ('premium', 'Premium Access'),
            ('enterprise', 'Enterprise Access')
        ],
        default='standard'
    )
    
    # Portal customization
    custom_branding = models.BooleanField(default=False)
    custom_domain = models.CharField(max_length=255, blank=True, null=True)
    portal_theme = models.JSONField(default=dict, blank=True)
    
    # Features enabled for this client
    features_enabled = models.JSONField(default=dict, blank=True, help_text="Dictionary of enabled features")
    
    # Billing and subscription
    billing_cycle = models.CharField(
        max_length=20,
        choices=[
            ('monthly', 'Monthly'),
            ('quarterly', 'Quarterly'),
            ('annually', 'Annually'),
            ('custom', 'Custom')
        ],
        default='monthly'
    )
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    setup_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Usage tracking
    contacts_limit = models.IntegerField(default=1000)
    contacts_used = models.IntegerField(default=0)
    campaigns_limit = models.IntegerField(default=10)
    campaigns_used = models.IntegerField(default=0)
    automations_limit = models.IntegerField(default=5)
    automations_used = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        db_table = 'agency_client_portals'
        verbose_name = 'Agency Client Portal'
        verbose_name_plural = 'Agency Client Portals'
        unique_together = ['client_email', 'parent_tenant']
    
    def __str__(self):
        return f"{self.client_name} - {self.parent_tenant.name}"
    
    @property
    def is_over_limit(self):
        """Check if client is over any usage limits."""
        return (
            self.contacts_used > self.contacts_limit or
            self.campaigns_used > self.campaigns_limit or
            self.automations_used > self.automations_limit
        )
    
    def get_usage_percentage(self, resource_type):
        """Get usage percentage for a specific resource."""
        limits = {
            'contacts': self.contacts_limit,
            'campaigns': self.campaigns_limit,
            'automations': self.automations_limit
        }
        used = {
            'contacts': self.contacts_used,
            'campaigns': self.campaigns_used,
            'automations': self.automations_used
        }
        
        if limits.get(resource_type, 0) == 0:
            return 0
        return (used.get(resource_type, 0) / limits.get(resource_type, 1)) * 100

class AgencyClientUser(models.Model):
    """
    Agency Client User model for managing individual user access to client portals.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Client portal this user belongs to
    client_portal = models.ForeignKey(AgencyClientPortal, on_delete=models.CASCADE, related_name='client_users')
    
    # User information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Access control
    is_active = models.BooleanField(default=True)
    role = models.CharField(
        max_length=20,
        choices=[
            ('admin', 'Administrator'),
            ('manager', 'Manager'),
            ('viewer', 'Viewer'),
            ('editor', 'Editor')
        ],
        default='viewer'
    )
    
    # Portal access settings
    can_view_analytics = models.BooleanField(default=True)
    can_manage_campaigns = models.BooleanField(default=False)
    can_manage_contacts = models.BooleanField(default=False)
    can_manage_automations = models.BooleanField(default=False)
    can_export_data = models.BooleanField(default=False)
    
    # Authentication
    password_hash = models.CharField(max_length=255, blank=True, null=True)
    last_login = models.DateTimeField(blank=True, null=True)
    password_reset_token = models.CharField(max_length=255, blank=True, null=True)
    password_reset_expires = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = models.Manager()  # Not tenant-filtered as it's for client users
    
    class Meta:
        db_table = 'agency_client_users'
        verbose_name = 'Agency Client User'
        verbose_name_plural = 'Agency Client Users'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.client_portal.client_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class AgencyClientActivity(models.Model):
    """
    Agency Client Activity model for tracking client portal usage and interactions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Client portal
    client_portal = models.ForeignKey(AgencyClientPortal, on_delete=models.CASCADE, related_name='activities')
    
    # User who performed the action (if applicable)
    client_user = models.ForeignKey(AgencyClientUser, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Activity details
    activity_type = models.CharField(
        max_length=50,
        choices=[
            ('login', 'User Login'),
            ('campaign_created', 'Campaign Created'),
            ('campaign_updated', 'Campaign Updated'),
            ('contact_added', 'Contact Added'),
            ('automation_created', 'Automation Created'),
            ('report_generated', 'Report Generated'),
            ('data_exported', 'Data Exported'),
            ('settings_updated', 'Settings Updated'),
            ('billing_updated', 'Billing Updated'),
            ('support_requested', 'Support Requested')
        ]
    )
    
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        db_table = 'agency_client_activities'
        verbose_name = 'Agency Client Activity'
        verbose_name_plural = 'Agency Client Activities'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.activity_type} - {self.client_portal.client_name} - {self.created_at}"

class AgencyClientBilling(models.Model):
    """
    Agency Client Billing model for tracking client payments and invoices.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Client portal
    client_portal = models.ForeignKey(AgencyClientPortal, on_delete=models.CASCADE, related_name='billing_records')
    
    # Billing details
    invoice_number = models.CharField(max_length=50, unique=True)
    billing_period_start = models.DateField()
    billing_period_end = models.DateField()
    
    # Amounts
    base_amount = models.DecimalField(max_digits=10, decimal_places=2)
    overage_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    setup_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('sent', 'Sent'),
            ('paid', 'Paid'),
            ('overdue', 'Overdue'),
            ('cancelled', 'Cancelled')
        ],
        default='draft'
    )
    
    # Payment details
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    payment_date = models.DateTimeField(blank=True, null=True)
    stripe_invoice_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Notes
    notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        db_table = 'agency_client_billing'
        verbose_name = 'Agency Client Billing'
        verbose_name_plural = 'Agency Client Billing'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.client_portal.client_name}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate total amount
        self.total_amount = (
            self.base_amount + 
            self.overage_amount + 
            self.setup_fee - 
            self.discount_amount
        )
        super().save(*args, **kwargs)
