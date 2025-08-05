from rest_framework import serializers
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
import json

from .models import (
    Project, ProjectTask, ProjectTeamMember, ProjectMilestone,
    ProjectFile, ProjectComment, ProjectTemplate, PromanaInsight,
    ProjectAutomationRule, ProjectRisk, ProjectReport, ClientPortal, TimeEntry
)
from accounts.serializers import CustomUserSerializer


class ProjectTeamMemberSerializer(serializers.ModelSerializer):
    """Serializer for project team members."""
    
    user = CustomUserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = ProjectTeamMember
        fields = [
            'id', 'project', 'user', 'user_id', 'role', 'role_display',
            'hourly_rate', 'capacity_hours', 'skills', 'permissions',
            'joined_at', 'is_active'
        ]
        read_only_fields = ['id', 'joined_at']


class ProjectRiskSerializer(serializers.ModelSerializer):
    """Serializer for project risks."""
    
    assigned_to = CustomUserSerializer(read_only=True)
    assigned_to_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    probability_display = serializers.CharField(source='get_probability_display', read_only=True)
    impact_display = serializers.CharField(source='get_impact_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ProjectRisk
        fields = [
            'id', 'project', 'title', 'description', 'probability', 'probability_display',
            'impact', 'impact_display', 'status', 'status_display', 'mitigation_strategy',
            'assigned_to', 'assigned_to_id', 'due_date', 'promana_identified',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TimeEntrySerializer(serializers.ModelSerializer):
    """Serializer for time entries."""
    
    user = CustomUserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)
    cost = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = TimeEntry
        fields = [
            'id', 'project', 'task', 'user', 'user_id', 'date', 'hours',
            'description', 'is_billable', 'hourly_rate', 'cost',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'cost', 'created_at', 'updated_at']


class ProjectReportSerializer(serializers.ModelSerializer):
    """Serializer for project reports."""
    
    generated_by = CustomUserSerializer(read_only=True)
    generated_by_id = serializers.UUIDField(write_only=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    
    class Meta:
        model = ProjectReport
        fields = [
            'id', 'project', 'name', 'report_type', 'report_type_display',
            'report_data', 'parameters', 'generated_by', 'generated_by_id',
            'is_scheduled', 'schedule_frequency', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClientPortalSerializer(serializers.ModelSerializer):
    """Serializer for client portal access."""
    
    class Meta:
        model = ClientPortal
        fields = [
            'id', 'project', 'client_name', 'client_email', 'access_code',
            'is_active', 'permissions', 'last_access', 'notification_preferences',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'access_code', 'created_at', 'updated_at']


class ProjectFileSerializer(serializers.ModelSerializer):
    """Enhanced serializer for project files."""
    
    uploaded_by = CustomUserSerializer(read_only=True)
    uploaded_by_id = serializers.UUIDField(write_only=True)
    file_type_display = serializers.CharField(source='get_file_type_display', read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectFile
        fields = [
            'id', 'project', 'task', 'name', 'file_type', 'file_type_display',
            'file_url', 'file_size', 'file_size_mb', 'uploaded_by', 'uploaded_by_id',
            'is_public', 'folder', 'version', 'tags', 'promana_auto_categorized',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_file_size_mb(self, obj):
        """Convert file size to MB."""
        return round(obj.file_size / (1024 * 1024), 2)


class ProjectCommentSerializer(serializers.ModelSerializer):
    """Enhanced serializer for project comments."""
    
    author = CustomUserSerializer(read_only=True)
    author_id = serializers.UUIDField(write_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectComment
        fields = [
            'id', 'project', 'task', 'author', 'author_id', 'content',
            'parent_comment', 'is_internal', 'mentions', 'replies',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        """Get nested replies."""
        replies = ProjectComment.objects.filter(parent_comment=obj).order_by('created_at')
        return ProjectCommentSerializer(replies, many=True, read_only=True).data


class ProjectMilestoneSerializer(serializers.ModelSerializer):
    """Enhanced serializer for project milestones."""
    
    completed_by = CustomUserSerializer(read_only=True)
    completed_by_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    related_tasks = serializers.SerializerMethodField()
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ProjectMilestone
        fields = [
            'id', 'project', 'name', 'description', 'due_date', 'is_completed',
            'completed_at', 'completed_by', 'completed_by_id', 'related_tasks',
            'client_approval_required', 'client_approved', 'client_approved_at',
            'is_overdue', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_related_tasks(self, obj):
        """Get related tasks for this milestone."""
        from .serializers import ProjectTaskSerializer
        tasks = obj.related_tasks.all()
        return ProjectTaskSerializer(tasks, many=True, read_only=True).data


class ProjectTaskSerializer(serializers.ModelSerializer):
    """Enhanced serializer for project tasks."""
    
    assigned_to = CustomUserSerializer(read_only=True)
    assigned_to_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    promana_suggested_assignee = CustomUserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    dependencies = serializers.SerializerMethodField()
    sub_tasks = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()
    time_entries = serializers.SerializerMethodField()
    
    # Computed properties
    duration_days = serializers.IntegerField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    can_start = serializers.BooleanField(read_only=True)
    progress_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    remaining_hours = serializers.DecimalField(max_digits=6, decimal_places=2, read_only=True)
    efficiency_ratio = serializers.DecimalField(max_digits=4, decimal_places=2, read_only=True)
    is_critical_path = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ProjectTask
        fields = [
            'id', 'project', 'parent_task', 'name', 'description', 'start_date',
            'end_date', 'status', 'status_display', 'priority', 'priority_display',
            'assigned_to', 'assigned_to_id', 'dependencies', 'estimated_hours',
            'actual_hours', 'promana_risk_score', 'promana_suggested_assignee',
            'promana_notes', 'promana_risk_indicator', 'promana_acceleration_opportunity',
            'time_entries', 'tags', 'swimlane', 'custom_fields', 'sub_tasks',
            'comments', 'files', 'duration_days', 'is_overdue', 'can_start',
            'progress_percentage', 'remaining_hours', 'efficiency_ratio',
            'is_critical_path', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'duration_days', 'is_overdue',
            'can_start', 'progress_percentage', 'remaining_hours', 'efficiency_ratio',
            'is_critical_path'
        ]
    
    def get_dependencies(self, obj):
        """Get task dependencies."""
        dependencies = obj.dependencies.all()
        return [{'id': dep.id, 'name': dep.name} for dep in dependencies]
    
    def get_sub_tasks(self, obj):
        """Get sub-tasks."""
        sub_tasks = obj.sub_tasks.all()
        return ProjectTaskSerializer(sub_tasks, many=True, read_only=True).data
    
    def get_comments(self, obj):
        """Get task comments."""
        comments = obj.comments.filter(parent_comment__isnull=True).order_by('created_at')
        return ProjectCommentSerializer(comments, many=True, read_only=True).data
    
    def get_files(self, obj):
        """Get task files."""
        files = obj.files.all()
        return ProjectFileSerializer(files, many=True, read_only=True).data
    
    def get_time_entries(self, obj):
        """Get task time entries."""
        time_entries = obj.time_entries.all()
        return TimeEntrySerializer(time_entries, many=True, read_only=True).data


class ProjectSerializer(serializers.ModelSerializer):
    """Enhanced serializer for projects."""
    
    manager = CustomUserSerializer(read_only=True)
    manager_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    team_members = ProjectTeamMemberSerializer(many=True, read_only=True)
    tasks = serializers.SerializerMethodField()
    milestones = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    risks = serializers.SerializerMethodField()
    reports = serializers.SerializerMethodField()
    client_portal = serializers.SerializerMethodField()
    promana_insights = serializers.SerializerMethodField()
    
    # Computed properties
    duration_days = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    total_estimated_hours = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    total_actual_hours = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    completion_rate = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    budget_utilization = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    is_at_risk = serializers.BooleanField(read_only=True)
    
    # Display fields
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    project_type_display = serializers.CharField(source='get_project_type_display', read_only=True)
    risk_level_display = serializers.CharField(source='get_risk_level_display', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'tenant', 'name', 'description', 'project_code', 'project_type',
            'project_type_display', 'manager', 'manager_id', 'team_members',
            'start_date', 'end_date', 'status', 'status_display', 'budget',
            'actual_cost', 'health_score', 'risk_level', 'risk_level_display',
            'predicted_completion_date', 'last_promana_analysis', 'client_name',
            'client_email', 'client_portal_enabled', 'client_portal_access_code',
            'client_contact_info', 'is_template', 'template_name',
            'automation_rules_json', 'baseline_data', 'variance_analysis',
            'resource_utilization', 'notification_settings', 'custom_fields',
            'integration_settings', 'tasks', 'milestones', 'files', 'comments',
            'risks', 'reports', 'client_portal', 'promana_insights',
            'duration_days', 'progress_percentage', 'is_overdue',
            'total_estimated_hours', 'total_actual_hours', 'completion_rate',
            'budget_utilization', 'days_remaining', 'is_at_risk',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'project_code', 'created_at', 'updated_at', 'duration_days',
            'progress_percentage', 'is_overdue', 'total_estimated_hours',
            'total_actual_hours', 'completion_rate', 'budget_utilization',
            'days_remaining', 'is_at_risk'
        ]
    
    def get_tasks(self, obj):
        """Get project tasks."""
        tasks = obj.tasks.all()
        return ProjectTaskSerializer(tasks, many=True, read_only=True).data
    
    def get_milestones(self, obj):
        """Get project milestones."""
        milestones = obj.milestones.all()
        return ProjectMilestoneSerializer(milestones, many=True, read_only=True).data
    
    def get_files(self, obj):
        """Get project files."""
        files = obj.files.all()
        return ProjectFileSerializer(files, many=True, read_only=True).data
    
    def get_comments(self, obj):
        """Get project comments."""
        comments = obj.comments.filter(parent_comment__isnull=True).order_by('created_at')
        return ProjectCommentSerializer(comments, many=True, read_only=True).data
    
    def get_risks(self, obj):
        """Get project risks."""
        risks = obj.risks.all()
        return ProjectRiskSerializer(risks, many=True, read_only=True).data
    
    def get_reports(self, obj):
        """Get project reports."""
        reports = obj.reports.all()
        return ProjectReportSerializer(reports, many=True, read_only=True).data
    
    def get_client_portal(self, obj):
        """Get client portal info."""
        try:
            client_portal = obj.client_portal
            return ClientPortalSerializer(client_portal, read_only=True).data
        except:
            return None
    
    def get_promana_insights(self, obj):
        """Get Promana insights."""
        insights = obj.promana_insights.all()[:5]  # Limit to 5 most recent
        return PromanaInsightSerializer(insights, many=True, read_only=True).data


class PromanaInsightSerializer(serializers.ModelSerializer):
    """Serializer for Promana AI insights."""
    
    action_taken_by = CustomUserSerializer(read_only=True)
    action_taken_by_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    insight_type_display = serializers.CharField(source='get_insight_type_display', read_only=True)
    
    class Meta:
        model = PromanaInsight
        fields = [
            'id', 'project', 'task', 'insight_type', 'insight_type_display',
            'title', 'description', 'confidence_score', 'is_actionable',
            'action_taken', 'action_taken_at', 'action_taken_by', 'action_taken_by_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectTemplateSerializer(serializers.ModelSerializer):
    """Serializer for project templates."""
    
    created_by = CustomUserSerializer(read_only=True)
    created_by_id = serializers.UUIDField(write_only=True)
    project_type_display = serializers.CharField(source='get_project_type_display', read_only=True)
    
    class Meta:
        model = ProjectTemplate
        fields = [
            'id', 'tenant', 'name', 'description', 'project_type',
            'project_type_display', 'template_data', 'is_global',
            'created_by', 'created_by_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectAutomationRuleSerializer(serializers.ModelSerializer):
    """Serializer for project automation rules."""
    
    created_by = CustomUserSerializer(read_only=True)
    created_by_id = serializers.UUIDField(write_only=True)
    trigger_display = serializers.CharField(source='get_trigger_display', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = ProjectAutomationRule
        fields = [
            'id', 'project', 'name', 'trigger', 'trigger_display', 'action',
            'action_display', 'conditions', 'action_data', 'is_active',
            'created_by', 'created_by_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# Dashboard and Analytics Serializers
class ProjectDashboardSerializer(serializers.Serializer):
    """Serializer for project dashboard data."""
    
    total_projects = serializers.IntegerField()
    active_projects = serializers.IntegerField()
    completed_projects = serializers.IntegerField()
    at_risk_projects = serializers.IntegerField()
    overdue_projects = serializers.IntegerField()
    total_budget = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_health_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    recent_activities = serializers.ListField()
    upcoming_milestones = serializers.ListField()
    team_workload = serializers.DictField()


class ProjectHealthSummarySerializer(serializers.Serializer):
    """Serializer for project health summary."""
    
    health_score = serializers.IntegerField()
    risk_level = serializers.CharField()
    predicted_completion_date = serializers.DateField()
    budget_burn_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    key_risks = serializers.ListField()
    top_recommendation = serializers.DictField()
    variance_analysis = serializers.DictField()


class ProjectGanttDataSerializer(serializers.Serializer):
    """Serializer for Gantt chart data."""
    
    tasks = serializers.ListField()
    dependencies = serializers.ListField()
    critical_path = serializers.ListField()
    resource_allocation = serializers.DictField()


class PromanaQuerySerializer(serializers.Serializer):
    """Serializer for Promana AI queries."""
    
    query = serializers.CharField()
    context = serializers.DictField(required=False)


class PromanaResponseSerializer(serializers.Serializer):
    """Serializer for Promana AI responses."""
    
    response = serializers.CharField()
    insights = serializers.ListField()
    recommendations = serializers.ListField()
    confidence_score = serializers.IntegerField()


class ProjectFilterSerializer(serializers.Serializer):
    """Serializer for project filters."""
    
    status = serializers.ListField(required=False)
    project_type = serializers.ListField(required=False)
    risk_level = serializers.ListField(required=False)
    health_score_min = serializers.IntegerField(required=False)
    health_score_max = serializers.IntegerField(required=False)
    date_range = serializers.CharField(required=False)
    manager = serializers.UUIDField(required=False)


class ProjectBulkActionSerializer(serializers.Serializer):
    """Serializer for bulk project actions."""
    
    project_ids = serializers.ListField(child=serializers.UUIDField())
    action = serializers.CharField()
    data = serializers.DictField(required=False)


class ProjectTemplateCreateSerializer(serializers.Serializer):
    """Serializer for creating projects from templates."""
    
    template_id = serializers.UUIDField()
    project_name = serializers.CharField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    manager_id = serializers.UUIDField(required=False)
    team_member_ids = serializers.ListField(child=serializers.UUIDField(), required=False)
    custom_data = serializers.DictField(required=False) 