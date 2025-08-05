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

    def reset_progress(self):
        """Reset the user's progress for this tutorial."""
        self.last_completed_step = None
        self.is_completed = False
        self.completed_at = None
        self.save()
