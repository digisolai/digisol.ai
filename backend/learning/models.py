import uuid
from django.db import models
from core.models import Tenant
from core.managers import TenantAwareManager
from accounts.models import CustomUser
from django.utils import timezone


class Tutorial(models.Model):
    """
    Tutorial model for organizing learning content.
    Can be global (tenant=None) or tenant-specific.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        Tenant, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Leave empty for global tutorials available to all tenants"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    order = models.IntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'tutorials'
        verbose_name = 'Tutorial'
        verbose_name_plural = 'Tutorials'
        ordering = ['order', 'title']
        unique_together = ['title', 'tenant']  # Each tutorial title unique per tenant (or global)

    def __str__(self):
        tenant_name = self.tenant.name if self.tenant else "Global"
        return f"{self.title} ({tenant_name})"

    @property
    def is_global(self):
        """Check if this is a global tutorial available to all tenants."""
        return self.tenant is None

    @property
    def section_count(self):
        """Return the number of sections in this tutorial."""
        return self.sections.count()

    @property
    def step_count(self):
        """Return the total number of steps across all sections."""
        return sum(section.steps.count() for section in self.sections.all())


class TutorialSection(models.Model):
    """
    Tutorial section model for organizing tutorial content into logical groups.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tutorial = models.ForeignKey(
        Tutorial, 
        on_delete=models.CASCADE, 
        related_name='sections'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'tutorial_sections'
        verbose_name = 'Tutorial Section'
        verbose_name_plural = 'Tutorial Sections'
        ordering = ['order', 'title']
        unique_together = ['title', 'tutorial']  # Each section title unique per tutorial

    def __str__(self):
        return f"{self.title} - {self.tutorial.title}"

    @property
    def step_count(self):
        """Return the number of steps in this section."""
        return self.steps.count()


class TutorialStep(models.Model):
    """
    Tutorial step model for individual learning content items.
    """
    CONTENT_TYPE_CHOICES = [
        ('text', 'Text'),
        ('video', 'Video'),
        ('image', 'Image'),
        ('interactive', 'Interactive'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(
        TutorialSection, 
        on_delete=models.CASCADE, 
        related_name='steps'
    )
    title = models.CharField(max_length=255)
    content_type = models.CharField(
        max_length=50, 
        choices=CONTENT_TYPE_CHOICES,
        default='text'
    )
    content = models.TextField(
        help_text="Text/HTML content, or URL for video/image content"
    )
    order = models.IntegerField(default=0)
    page_path = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Optional page path for deep linking (e.g., '/dashboard')"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'tutorial_steps'
        verbose_name = 'Tutorial Step'
        verbose_name_plural = 'Tutorial Steps'
        ordering = ['order', 'title']
        unique_together = ['title', 'section']  # Each step title unique per section

    def __str__(self):
        return f"{self.title} - {self.section.title}"

    @property
    def tutorial(self):
        """Get the parent tutorial for this step."""
        return self.section.tutorial

    @property
    def is_video(self):
        """Check if this step contains video content."""
        return self.content_type == 'video'

    @property
    def is_image(self):
        """Check if this step contains image content."""
        return self.content_type == 'image'

    @property
    def is_interactive(self):
        """Check if this step is interactive."""
        return self.content_type == 'interactive'


class UserTutorialProgress(models.Model):
    """
    User tutorial progress model for tracking individual user progress through tutorials.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE,
        related_name='tutorial_progress'
    )
    tutorial = models.ForeignKey(
        Tutorial, 
        on_delete=models.CASCADE,
        related_name='user_progress'
    )
    last_completed_step = models.ForeignKey(
        TutorialStep, 
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        related_name='completed_by_users'
    )
    is_completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'user_tutorial_progress'
        verbose_name = 'User Tutorial Progress'
        verbose_name_plural = 'User Tutorial Progress'
        unique_together = ['user', 'tutorial']  # One progress record per user per tutorial
        ordering = ['-started_at']

    def __str__(self):
        status = "Completed" if self.is_completed else "In Progress"
        return f"{self.user.email} - {self.tutorial.title} ({status})"

    @property
    def progress_percentage(self):
        """Calculate the percentage of tutorial completion."""
        if self.is_completed:
            return 100
        
        if not self.last_completed_step:
            return 0
        
        total_steps = self.tutorial.step_count
        if total_steps == 0:
            return 0
        
        # Find the order of the last completed step
        completed_step_order = self.last_completed_step.order
        return min(100, int((completed_step_order / total_steps) * 100))

    @property
    def next_step(self):
        """Get the next step the user should complete."""
        if self.is_completed:
            return None
        
        if not self.last_completed_step:
            # Return the first step of the tutorial
            first_section = self.tutorial.sections.first()
            if first_section:
                return first_section.steps.first()
            return None
        
        # Find the next step after the last completed step
        current_section = self.last_completed_step.section
        next_step = current_section.steps.filter(
            order__gt=self.last_completed_step.order
        ).first()
        
        if next_step:
            return next_step
        
        # If no next step in current section, move to next section
        next_section = self.tutorial.sections.filter(
            order__gt=current_section.order
        ).first()
        
        if next_section:
            return next_section.steps.first()
        
        return None

    def mark_step_completed(self, step):
        """Mark a specific step as completed and update progress."""
        if step.tutorial != self.tutorial:
            raise ValueError("Step does not belong to this tutorial")
        
        self.last_completed_step = step
        self.save()
        
        # Check if tutorial is completed
        if step == self.tutorial.sections.last().steps.last():
            self.is_completed = True
            self.completed_at = timezone.now()
            self.save()


class Badge(models.Model):
    """
    Badge model for gamification and achievement tracking.
    """
    BADGE_TYPES = [
        ('tutorial_completion', 'Tutorial Completion'),
        ('learning_streak', 'Learning Streak'),
        ('marketing_expertise', 'Marketing Expertise'),
        ('ai_mastery', 'AI Mastery'),
        ('campaign_success', 'Campaign Success'),
        ('community_contribution', 'Community Contribution'),
        ('early_adopter', 'Early Adopter'),
        ('power_user', 'Power User'),
    ]

    DIFFICULTY_LEVELS = [
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
        ('diamond', 'Diamond'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        Tenant, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Leave empty for global badges available to all tenants"
    )
    name = models.CharField(max_length=255)
    description = models.TextField()
    badge_type = models.CharField(max_length=50, choices=BADGE_TYPES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS, default='bronze')
    icon_url = models.URLField(blank=True, null=True)
    token_reward = models.IntegerField(default=0, help_text="Tokens awarded when badge is earned")
    requirements = models.JSONField(default=dict, help_text="Requirements to earn this badge")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'badges'
        verbose_name = 'Badge'
        verbose_name_plural = 'Badges'
        ordering = ['difficulty', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_difficulty_display()})"

    @property
    def is_global(self):
        """Check if this is a global badge available to all tenants."""
        return self.tenant is None


class UserBadge(models.Model):
    """
    User badge model for tracking earned badges.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE,
        related_name='earned_badges'
    )
    badge = models.ForeignKey(
        Badge, 
        on_delete=models.CASCADE,
        related_name='earned_by_users'
    )
    earned_at = models.DateTimeField(auto_now_add=True)
    tokens_awarded = models.IntegerField(default=0)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'user_badges'
        verbose_name = 'User Badge'
        verbose_name_plural = 'User Badges'
        unique_together = ['user', 'badge']  # User can only earn each badge once
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.user.email} - {self.badge.name}"

    def save(self, *args, **kwargs):
        """Override save to award tokens when badge is first earned."""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and self.badge.token_reward > 0:
            # Award tokens to user's tenant
            tenant = self.user.tenant
            if tenant:
                tenant.tokens_purchased_additional += self.badge.token_reward
                tenant.save()
                self.tokens_awarded = self.badge.token_reward
                super().save(update_fields=['tokens_awarded'])


class LearningAchievement(models.Model):
    """
    Learning achievement model for tracking specific learning milestones.
    """
    ACHIEVEMENT_TYPES = [
        ('tutorial_completed', 'Tutorial Completed'),
        ('streak_maintained', 'Learning Streak Maintained'),
        ('courses_finished', 'Courses Finished'),
        ('skills_mastered', 'Skills Mastered'),
        ('time_spent', 'Time Spent Learning'),
        ('ai_interactions', 'AI Interactions'),
        ('marketing_campaigns', 'Marketing Campaigns Created'),
        ('analytics_reports', 'Analytics Reports Generated'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE,
        related_name='learning_achievements'
    )
    achievement_type = models.CharField(max_length=50, choices=ACHIEVEMENT_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    value = models.IntegerField(default=0, help_text="Achievement value (e.g., number of tutorials completed)")
    target_value = models.IntegerField(default=0, help_text="Target value to reach this achievement")
    token_reward = models.IntegerField(default=0)
    earned_at = models.DateTimeField(auto_now_add=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'learning_achievements'
        verbose_name = 'Learning Achievement'
        verbose_name_plural = 'Learning Achievements'
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.user.email} - {self.title}"

    def save(self, *args, **kwargs):
        """Override save to award tokens when achievement is first earned."""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and self.token_reward > 0:
            # Award tokens to user's tenant
            tenant = self.user.tenant
            if tenant:
                tenant.tokens_purchased_additional += self.token_reward
                tenant.save()


class MarketingResource(models.Model):
    """
    Marketing resource model for educational content in the info center.
    """
    RESOURCE_TYPES = [
        ('article', 'Article'),
        ('video', 'Video'),
        ('infographic', 'Infographic'),
        ('template', 'Template'),
        ('case_study', 'Case Study'),
        ('webinar', 'Webinar'),
        ('ebook', 'E-Book'),
        ('checklist', 'Checklist'),
    ]

    CATEGORIES = [
        ('digital_marketing', 'Digital Marketing'),
        ('social_media', 'Social Media Marketing'),
        ('email_marketing', 'Email Marketing'),
        ('content_marketing', 'Content Marketing'),
        ('seo', 'SEO & SEM'),
        ('analytics', 'Analytics & Reporting'),
        ('automation', 'Marketing Automation'),
        ('branding', 'Brand Strategy'),
        ('lead_generation', 'Lead Generation'),
        ('conversion_optimization', 'Conversion Optimization'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        Tenant, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Leave empty for global resources available to all tenants"
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    content = models.TextField(help_text="Main content of the resource")
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    category = models.CharField(max_length=30, choices=CATEGORIES)
    difficulty_level = models.CharField(max_length=20, choices=Badge.DIFFICULTY_LEVELS, default='bronze')
    estimated_read_time = models.IntegerField(default=5, help_text="Estimated reading time in minutes")
    tags = models.JSONField(default=list, help_text="List of tags for categorization")
    featured_image_url = models.URLField(blank=True, null=True)
    external_url = models.URLField(blank=True, null=True, help_text="External link if content is hosted elsewhere")
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    view_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'marketing_resources'
        verbose_name = 'Marketing Resource'
        verbose_name_plural = 'Marketing Resources'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def is_global(self):
        """Check if this is a global resource available to all tenants."""
        return self.tenant is None

    def increment_view_count(self):
        """Increment the view count for this resource."""
        self.view_count += 1
        self.save(update_fields=['view_count'])


class UserResourceProgress(models.Model):
    """
    User resource progress model for tracking user engagement with marketing resources.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE,
        related_name='resource_progress'
    )
    resource = models.ForeignKey(
        MarketingResource, 
        on_delete=models.CASCADE,
        related_name='user_progress'
    )
    is_completed = models.BooleanField(default=False)
    time_spent = models.IntegerField(default=0, help_text="Time spent in seconds")
    last_accessed = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'user_resource_progress'
        verbose_name = 'User Resource Progress'
        verbose_name_plural = 'User Resource Progress'
        unique_together = ['user', 'resource']
        ordering = ['-last_accessed']

    def __str__(self):
        status = "Completed" if self.is_completed else "In Progress"
        return f"{self.user.email} - {self.resource.title} ({status})"
