import uuid
from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from core.models import Tenant
from accounts.models import CustomUser
from core.managers import TenantAwareManager


class Project(models.Model):
    """Enhanced Project model for Promana AI-powered project management."""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
        ('at_risk', 'At Risk'),
        ('ahead_of_schedule', 'Ahead of Schedule'),
        ('cancelled', 'Cancelled'),
    ]
    
    PROJECT_TYPE_CHOICES = [
        ('website_redesign', 'Website Redesign'),
        ('marketing_campaign', 'Marketing Campaign Launch'),
        ('app_development', 'App Development'),
        ('social_media_strategy', 'Social Media Strategy'),
        ('seo_audit', 'SEO Audit'),
        ('brand_identity', 'Brand Identity'),
        ('content_creation', 'Content Creation'),
        ('email_campaign', 'Email Campaign'),
        ('event_planning', 'Event Planning'),
        ('product_launch', 'Product Launch'),
        ('custom', 'Custom'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    project_code = models.CharField(max_length=20, unique=True, blank=True, null=True)
    project_type = models.CharField(
        max_length=50, 
        choices=PROJECT_TYPE_CHOICES, 
        default='custom'
    )
    manager = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='managed_projects'
    )
    team_members = models.ManyToManyField(
        CustomUser, 
        through='ProjectTeamMember',
        related_name='participating_projects'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=50, 
        choices=STATUS_CHOICES, 
        default='draft'
    )
    budget = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    actual_cost = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Promana AI Fields
    health_score = models.IntegerField(
        default=100, 
        help_text="Promana's project health score (0-100)"
    )
    risk_level = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('critical', 'Critical'),
        ],
        default='low'
    )
    predicted_completion_date = models.DateField(null=True, blank=True)
    last_promana_analysis = models.DateTimeField(null=True, blank=True)
    
    # Client Portal Fields
    client_name = models.CharField(max_length=255, blank=True, null=True)
    client_email = models.EmailField(blank=True, null=True)
    client_portal_enabled = models.BooleanField(default=False)
    client_portal_access_code = models.CharField(max_length=50, blank=True, null=True)
    client_contact_info = models.JSONField(default=dict, blank=True)
    
    # Template and Automation
    is_template = models.BooleanField(default=False)
    template_name = models.CharField(max_length=255, blank=True, null=True)
    automation_rules_json = models.JSONField(default=list, blank=True)
    
    # Advanced Analytics
    baseline_data = models.JSONField(default=dict, blank=True)
    variance_analysis = models.JSONField(default=dict, blank=True)
    resource_utilization = models.JSONField(default=dict, blank=True)
    
    # Project Settings
    notification_settings = models.JSONField(default=dict, blank=True)
    custom_fields = models.JSONField(default=dict, blank=True)
    integration_settings = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        unique_together = ['name', 'tenant']
        ordering = ['-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
    
    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"
    
    def save(self, *args, **kwargs):
        if not self.project_code:
            self.project_code = f"PRJ-{str(self.id)[:8].upper()}"
        super().save(*args, **kwargs)
    
    @property
    def duration_days(self):
        """Calculate project duration in days."""
        return (self.end_date - self.start_date).days
    
    @property
    def progress_percentage(self):
        """Calculate project progress based on completed tasks."""
        total_tasks = self.tasks.count()
        if total_tasks == 0:
            return 0
        completed_tasks = self.tasks.filter(status='completed').count()
        return round((completed_tasks / total_tasks) * 100, 2)
    
    @property
    def is_overdue(self):
        """Check if project is overdue."""
        return self.end_date < timezone.now().date() and self.status not in ['completed', 'cancelled', 'archived']
    
    @property
    def total_estimated_hours(self):
        """Calculate total estimated hours for all tasks."""
        return self.tasks.aggregate(
            total=models.Sum('estimated_hours')
        )['total'] or 0
    
    @property
    def total_actual_hours(self):
        """Calculate total actual hours for all tasks."""
        return self.tasks.aggregate(
            total=models.Sum('actual_hours')
        )['total'] or 0
    
    @property
    def completion_rate(self):
        """Calculate completion rate based on hours."""
        if self.total_estimated_hours == 0:
            return 0
        return min(round((self.total_actual_hours / self.total_estimated_hours) * 100, 2), 100)
    
    @property
    def budget_utilization(self):
        """Calculate budget utilization percentage."""
        if not self.budget or self.budget == 0:
            return 0
        return min(round((self.actual_cost / self.budget) * 100, 2), 100)
    
    @property
    def days_remaining(self):
        """Calculate days remaining until deadline."""
        remaining = (self.end_date - timezone.now().date()).days
        return max(remaining, 0)
    
    @property
    def is_at_risk(self):
        """Check if project is at risk based on various factors."""
        return (
            self.risk_level in ['high', 'critical'] or
            self.health_score < 70 or
            self.is_overdue or
            self.budget_utilization > 90
        )


class ProjectTeamMember(models.Model):
    """Model for project team members with roles and permissions."""
    
    ROLE_CHOICES = [
        ('project_manager', 'Project Manager'),
        ('team_lead', 'Team Lead'),
        ('developer', 'Developer'),
        ('designer', 'Designer'),
        ('content_creator', 'Content Creator'),
        ('marketing_specialist', 'Marketing Specialist'),
        ('qa_tester', 'QA Tester'),
        ('stakeholder', 'Stakeholder'),
        ('contributor', 'Contributor'),
        ('client', 'Client'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='team_memberships')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='project_memberships')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='contributor')
    hourly_rate = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Hourly rate for cost tracking"
    )
    capacity_hours = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        default=40.00,
        help_text="Weekly capacity in hours"
    )
    skills = models.JSONField(default=list, blank=True)
    permissions = models.JSONField(default=dict, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['project', 'user']
        ordering = ['role', 'user__first_name']


class ProjectTask(models.Model):
    """Enhanced Project task model with Promana AI integration."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('blocked', 'Blocked'),
        ('on_hold', 'On Hold'),
        ('review', 'In Review'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='project_tasks')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    parent_task = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='sub_tasks'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=50, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    priority = models.CharField(
        max_length=20, 
        choices=PRIORITY_CHOICES, 
        default='medium'
    )
    assigned_to = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_tasks'
    )
    dependencies = models.ManyToManyField(
        'self', 
        blank=True, 
        symmetrical=False, 
        related_name='predecessors'
    )
    estimated_hours = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    actual_hours = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Promana AI Fields
    promana_risk_score = models.IntegerField(
        default=0, 
        help_text="Promana's risk assessment score (0-100)"
    )
    promana_suggested_assignee = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='promana_suggested_tasks'
    )
    promana_notes = models.TextField(blank=True, null=True)
    promana_risk_indicator = models.BooleanField(default=False)
    promana_acceleration_opportunity = models.BooleanField(default=False)
    
    # Time Tracking
    time_entries = models.JSONField(default=list, blank=True)
    
    # Tags and Categories
    tags = models.JSONField(default=list, blank=True)
    swimlane = models.CharField(max_length=100, blank=True, null=True)
    
    # Custom Fields
    custom_fields = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        ordering = ['start_date', 'priority', 'name']
        verbose_name = 'Project Task'
        verbose_name_plural = 'Project Tasks'
    
    def __str__(self):
        return f"{self.name} - {self.project.name}"
    
    @property
    def duration_days(self):
        """Calculate task duration in days."""
        return (self.end_date - self.start_date).days
    
    @property
    def is_overdue(self):
        """Check if task is overdue."""
        return self.end_date < timezone.now().date() and self.status != 'completed'
    
    @property
    def can_start(self):
        """Check if task can start based on dependencies."""
        if not self.dependencies.exists():
            return True
        return all(dep.status == 'completed' for dep in self.dependencies.all())
    
    @property
    def progress_percentage(self):
        """Calculate task progress based on hours worked vs estimated."""
        if not self.estimated_hours or self.estimated_hours == 0:
            return 0 if self.status == 'pending' else 100 if self.status == 'completed' else 50
        return min(round((self.actual_hours / self.estimated_hours) * 100, 2), 100)
    
    @property
    def remaining_hours(self):
        """Calculate remaining hours for the task."""
        if not self.estimated_hours:
            return 0
        return max(self.estimated_hours - self.actual_hours, 0)
    
    @property
    def efficiency_ratio(self):
        """Calculate efficiency ratio (estimated vs actual hours)."""
        if not self.estimated_hours or self.estimated_hours == 0:
            return 1.0
        return round(self.actual_hours / self.estimated_hours, 2)
    
    @property
    def is_critical_path(self):
        """Check if task is on critical path."""
        return self.priority == 'critical' or self.promana_risk_score > 70
    
    def get_dependency_chain(self):
        """Get the full dependency chain for this task."""
        chain = []
        visited = set()
        
        def traverse(task):
            if task.id in visited:
                return
            visited.add(task.id)
            
            for dep in task.dependencies.all():
                traverse(dep)
            chain.append(task)
        
        traverse(self)
        return chain


class ProjectMilestone(models.Model):
    """Model for project milestones and key deliverables."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='project_milestones')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='completed_milestones'
    )
    related_tasks = models.ManyToManyField(ProjectTask, blank=True)
    client_approval_required = models.BooleanField(default=False)
    client_approved = models.BooleanField(default=False)
    client_approved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        ordering = ['due_date']
        verbose_name = 'Project Milestone'
        verbose_name_plural = 'Project Milestones'
    
    def __str__(self):
        return f"{self.name} - {self.project.name}"
    
    @property
    def is_overdue(self):
        """Check if milestone is overdue."""
        return self.due_date < timezone.now().date() and not self.is_completed


class ProjectFile(models.Model):
    """Model for project files and documents."""
    
    FILE_TYPE_CHOICES = [
        ('document', 'Document'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('archive', 'Archive'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='project_files')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    task = models.ForeignKey(ProjectTask, on_delete=models.CASCADE, null=True, blank=True, related_name='files')
    name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES, default='document')
    file_url = models.URLField()
    file_size = models.BigIntegerField(help_text="File size in bytes")
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='uploaded_files')
    is_public = models.BooleanField(default=False, help_text="Visible to client portal")
    folder = models.CharField(max_length=255, blank=True, null=True)
    version = models.IntegerField(default=1)
    tags = models.JSONField(default=list, blank=True)
    promana_auto_categorized = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Project File'
        verbose_name_plural = 'Project Files'
    
    def __str__(self):
        return f"{self.name} - {self.project.name}"


class ProjectComment(models.Model):
    """Model for project comments and discussions."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='project_comments')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='comments')
    task = models.ForeignKey(ProjectTask, on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='project_comments')
    content = models.TextField()
    parent_comment = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='replies'
    )
    is_internal = models.BooleanField(default=True, help_text="Not visible to client portal")
    mentions = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Project Comment'
        verbose_name_plural = 'Project Comments'
    
    def __str__(self):
        return f"Comment by {self.author.email} on {self.project.name}"


class ProjectTemplate(models.Model):
    """Model for project templates."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='project_templates')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    project_type = models.CharField(max_length=50, choices=Project.PROJECT_TYPE_CHOICES)
    template_data = models.JSONField(default=dict, help_text="Stores template structure, tasks, etc.")
    is_global = models.BooleanField(default=False, help_text="Available to all tenants")
    created_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='created_project_templates'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        unique_together = ['name', 'tenant']
        ordering = ['name']
        verbose_name = 'Project Template'
        verbose_name_plural = 'Project Templates'
    
    def __str__(self):
        return f"{self.name} ({self.get_project_type_display()})"


class PromanaInsight(models.Model):
    """Model for storing Promana AI insights and recommendations."""
    
    INSIGHT_TYPE_CHOICES = [
        ('risk_alert', 'Risk Alert'),
        ('opportunity', 'Opportunity'),
        ('recommendation', 'Recommendation'),
        ('prediction', 'Prediction'),
        ('optimization', 'Optimization'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='promana_insights')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='promana_insights')
    task = models.ForeignKey(ProjectTask, on_delete=models.CASCADE, null=True, blank=True, related_name='promana_insights')
    insight_type = models.CharField(max_length=50, choices=INSIGHT_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    confidence_score = models.IntegerField(help_text="Confidence score (0-100)")
    is_actionable = models.BooleanField(default=True)
    action_taken = models.BooleanField(default=False)
    action_taken_at = models.DateTimeField(null=True, blank=True)
    action_taken_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='acted_insights'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Promana Insight'
        verbose_name_plural = 'Promana Insights'
    
    def __str__(self):
        return f"{self.title} - {self.project.name}"


class ProjectAutomationRule(models.Model):
    """Model for project automation rules."""
    
    TRIGGER_CHOICES = [
        ('task_completed', 'Task Completed'),
        ('task_overdue', 'Task Overdue'),
        ('milestone_reached', 'Milestone Reached'),
        ('status_changed', 'Status Changed'),
        ('budget_exceeded', 'Budget Exceeded'),
        ('health_score_low', 'Health Score Low'),
    ]
    
    ACTION_CHOICES = [
        ('assign_task', 'Assign Task'),
        ('send_notification', 'Send Notification'),
        ('update_status', 'Update Status'),
        ('create_task', 'Create Task'),
        ('send_alert', 'Send Alert'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='project_automation_rules')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_automation_rules')
    name = models.CharField(max_length=255)
    trigger = models.CharField(max_length=50, choices=TRIGGER_CHOICES)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    conditions = models.JSONField(default=dict, help_text="Trigger conditions")
    action_data = models.JSONField(default=dict, help_text="Action parameters")
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='created_automation_rules')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Project Automation Rule'
        verbose_name_plural = 'Project Automation Rules'
    
    def __str__(self):
        return f"{self.name} - {self.project.name}"


class ProjectRisk(models.Model):
    """Model for project risks and mitigation strategies."""
    
    RISK_LEVEL_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('mitigated', 'Mitigated'),
        ('closed', 'Closed'),
        ('monitoring', 'Under Monitoring'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='project_risks')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='risks')
    title = models.CharField(max_length=255)
    description = models.TextField()
    probability = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES)
    impact = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    mitigation_strategy = models.TextField(blank=True, null=True)
    assigned_to = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_risks'
    )
    due_date = models.DateField(null=True, blank=True)
    promana_identified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Project Risk'
        verbose_name_plural = 'Project Risks'
    
    def __str__(self):
        return f"{self.title} - {self.project.name}"


class ProjectReport(models.Model):
    """Model for project reports and analytics."""
    
    REPORT_TYPE_CHOICES = [
        ('progress', 'Progress Report'),
        ('budget', 'Budget Report'),
        ('time_tracking', 'Time Tracking Report'),
        ('team_performance', 'Team Performance Report'),
        ('variance_analysis', 'Variance Analysis Report'),
        ('risk_hotspot', 'Risk Hotspot Report'),
        ('resource_utilization', 'Resource Utilization Report'),
        ('custom', 'Custom Report'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='project_reports')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reports')
    name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPE_CHOICES)
    report_data = models.JSONField(default=dict)
    parameters = models.JSONField(default=dict, help_text="Report parameters and filters")
    generated_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='generated_reports')
    is_scheduled = models.BooleanField(default=False)
    schedule_frequency = models.CharField(max_length=50, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Project Report'
        verbose_name_plural = 'Project Reports'
    
    def __str__(self):
        return f"{self.name} - {self.project.name}"


class ClientPortal(models.Model):
    """Model for client portal access and settings."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='client_portals')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='client_portal')
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()
    access_code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    permissions = models.JSONField(default=dict, help_text="What the client can see/do")
    last_access = models.DateTimeField(null=True, blank=True)
    notification_preferences = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        unique_together = ['project', 'client_email']
        verbose_name = 'Client Portal'
        verbose_name_plural = 'Client Portals'
    
    def __str__(self):
        return f"{self.client_name} - {self.project.name}"


class TimeEntry(models.Model):
    """Model for detailed time tracking entries."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='time_entries')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='time_entries')
    task = models.ForeignKey(ProjectTask, on_delete=models.CASCADE, related_name='time_entry_records')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='time_entries')
    date = models.DateField()
    hours = models.DecimalField(max_digits=6, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    is_billable = models.BooleanField(default=True)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = TenantAwareManager()
    
    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Time Entry'
        verbose_name_plural = 'Time Entries'
    
    def __str__(self):
        return f"{self.user.email} - {self.task.name} - {self.date}"
    
    @property
    def cost(self):
        """Calculate cost for this time entry."""
        if self.hourly_rate:
            return self.hours * self.hourly_rate
        return 0
