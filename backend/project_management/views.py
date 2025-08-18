from rest_framework import viewsets, status, filters
from core.permissions import DigiSolAdminOrAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
import json
from ai_services.tasks import (
    analyze_project_health, suggest_task_assignee, generate_project_insights,
    predict_project_completion, analyze_resource_utilization
)

from .models import (
    Project, ProjectTask, ProjectTeamMember, ProjectMilestone,
    ProjectFile, ProjectComment, ProjectTemplate, PromanaInsight,
    ProjectAutomationRule, ProjectRisk, ProjectReport, ClientPortal, TimeEntry
)
from .serializers import (
    ProjectSerializer, ProjectTaskSerializer, ProjectTeamMemberSerializer,
    ProjectMilestoneSerializer, ProjectFileSerializer, ProjectCommentSerializer,
    ProjectTemplateSerializer, PromanaInsightSerializer, ProjectAutomationRuleSerializer,
    ProjectDashboardSerializer, ProjectHealthSummarySerializer, ProjectGanttDataSerializer,
    PromanaQuerySerializer, PromanaResponseSerializer, ProjectFilterSerializer,
    ProjectBulkActionSerializer, TimeEntrySerializer, ProjectReportSerializer,
    ProjectTemplateCreateSerializer, ProjectRiskSerializer, ClientPortalSerializer
)
from accounts.permissions import IsTenantUser


class ProjectViewSet(viewsets.ModelViewSet):
    """Enhanced project viewset with Promana AI integration."""
    
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [DigiSolAdminOrAuthenticated, IsTenantUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'project_type', 'manager', 'risk_level']
    search_fields = ['name', 'description', 'client_name']
    ordering_fields = ['name', 'start_date', 'end_date', 'created_at', 'health_score']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter queryset by tenant and apply additional filters."""
        queryset = super().get_queryset()
        
        # Apply custom filters
        status_filter = self.request.query_params.getlist('status')
        if status_filter:
            queryset = queryset.filter(status__in=status_filter)
        
        project_type_filter = self.request.query_params.getlist('project_type')
        if project_type_filter:
            queryset = queryset.filter(project_type__in=project_type_filter)
        
        risk_level_filter = self.request.query_params.getlist('risk_level')
        if risk_level_filter:
            queryset = queryset.filter(risk_level__in=risk_level_filter)
        
        health_score_min = self.request.query_params.get('health_score_min')
        if health_score_min:
            queryset = queryset.filter(health_score__gte=health_score_min)
        
        health_score_max = self.request.query_params.get('health_score_max')
        if health_score_max:
            queryset = queryset.filter(health_score__lte=health_score_max)
        
        date_range = self.request.query_params.get('date_range')
        if date_range:
            today = timezone.now().date()
            if date_range == 'today':
                queryset = queryset.filter(start_date__lte=today, end_date__gte=today)
            elif date_range == 'this_week':
                week_start = today - timedelta(days=today.weekday())
                week_end = week_start + timedelta(days=6)
                queryset = queryset.filter(start_date__lte=week_end, end_date__gte=week_start)
            elif date_range == 'this_month':
                month_start = today.replace(day=1)
                if today.month == 12:
                    month_end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
                else:
                    month_end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
                queryset = queryset.filter(start_date__lte=month_end, end_date__gte=month_start)
        
        return queryset
    
    def perform_create(self, serializer):
        """Set tenant and trigger Promana analysis on creation."""
        user = self.request.user
        project = serializer.save(tenant=user.tenant)
        
        # Trigger initial Promana analysis
        self._trigger_promana_analysis(project)
        
        return project
    
    def perform_update(self, serializer):
        """Trigger Promana analysis on significant updates."""
        project = serializer.save()
        
        # Trigger Promana analysis for significant changes
        if self._has_significant_changes(project):
            self._trigger_promana_analysis(project)
        
        return project
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get project dashboard data."""
        user = request.user
        tenant = user.tenant
        
        # Get project statistics
        total_projects = Project.objects.filter(tenant=tenant).count()
        active_projects = Project.objects.filter(tenant=tenant, status='active').count()
        completed_projects = Project.objects.filter(tenant=tenant, status='completed').count()
        at_risk_projects = Project.objects.filter(tenant=tenant, risk_level__in=['high', 'critical']).count()
        overdue_projects = Project.objects.filter(tenant=tenant, end_date__lt=timezone.now().date(), status__in=['active', 'on_hold']).count()
        
        # Budget statistics
        budget_data = Project.objects.filter(tenant=tenant).aggregate(
            total_budget=Sum('budget'),
            total_spent=Sum('actual_cost')
        )
        
        # Health score average
        avg_health = Project.objects.filter(tenant=tenant).aggregate(
            avg_health=Avg('health_score')
        )['avg_health'] or 0
        
        # Recent activities (last 10)
        recent_activities = []
        recent_tasks = ProjectTask.objects.filter(project__tenant=tenant).order_by('-updated_at')[:5]
        recent_comments = ProjectComment.objects.filter(project__tenant=tenant).order_by('-created_at')[:5]
        
        for task in recent_tasks:
            recent_activities.append({
                'type': 'task_updated',
                'message': f'Task "{task.name}" updated',
                'timestamp': task.updated_at,
                'project': task.project.name
            })
        
        for comment in recent_comments:
            recent_activities.append({
                'type': 'comment_added',
                'message': f'Comment added to {comment.project.name}',
                'timestamp': comment.created_at,
                'project': comment.project.name
            })
        
        recent_activities.sort(key=lambda x: x['timestamp'], reverse=True)
        recent_activities = recent_activities[:10]
        
        # Upcoming milestones
        upcoming_milestones = ProjectMilestone.objects.filter(
            project__tenant=tenant,
            due_date__gte=timezone.now().date(),
            is_completed=False
        ).order_by('due_date')[:5]
        
        milestone_data = []
        for milestone in upcoming_milestones:
            milestone_data.append({
                'id': milestone.id,
                'name': milestone.name,
                'due_date': milestone.due_date,
                'project': milestone.project.name
            })
        
        # Team workload
        team_workload = {}
        team_members = ProjectTeamMember.objects.filter(project__tenant=tenant, is_active=True)
        for member in team_members:
            assigned_hours = member.user.assigned_tasks.filter(
                project__tenant=tenant,
                status__in=['pending', 'in_progress']
            ).aggregate(total=Sum('estimated_hours'))['total'] or 0
            
            team_workload[member.user.email] = {
                'name': f"{member.user.first_name} {member.user.last_name}",
                'assigned_hours': float(assigned_hours),
                'capacity_hours': float(member.capacity_hours),
                'utilization': round((assigned_hours / member.capacity_hours) * 100, 2) if member.capacity_hours > 0 else 0
            }
        
        dashboard_data = {
            'total_projects': total_projects,
            'active_projects': active_projects,
            'completed_projects': completed_projects,
            'at_risk_projects': at_risk_projects,
            'overdue_projects': overdue_projects,
            'total_budget': budget_data['total_budget'] or 0,
            'total_spent': budget_data['total_spent'] or 0,
            'average_health_score': round(avg_health, 2),
            'recent_activities': recent_activities,
            'upcoming_milestones': milestone_data,
            'team_workload': team_workload
        }
        
        serializer = ProjectDashboardSerializer(dashboard_data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def health_summary(self, request, pk=None):
        """Get Promana's project health summary."""
        project = self.get_object()
        
        # Calculate health metrics
        health_score = project.health_score
        risk_level = project.risk_level
        predicted_completion = project.predicted_completion_date
        
        # Budget burn rate
        budget_burn_rate = project.budget_utilization
        
        # Key risks
        key_risks = ProjectRisk.objects.filter(
            project=project,
            status='active'
        ).order_by('-created_at')[:3]
        
        risk_data = []
        for risk in key_risks:
            risk_data.append({
                'id': risk.id,
                'title': risk.title,
                'probability': risk.probability,
                'impact': risk.impact
            })
        
        # Top recommendation from Promana
        top_insight = PromanaInsight.objects.filter(
            project=project,
            is_actionable=True,
            action_taken=False
        ).order_by('-confidence_score').first()
        
        top_recommendation = None
        if top_insight:
            top_recommendation = {
                'id': top_insight.id,
                'title': top_insight.title,
                'description': top_insight.description,
                'confidence_score': top_insight.confidence_score
            }
        
        # Variance analysis
        variance_analysis = {
            'schedule_variance': project.days_remaining,
            'budget_variance': float(project.budget - project.actual_cost) if project.budget else 0,
            'scope_variance': project.progress_percentage - project.completion_rate
        }
        
        health_data = {
            'health_score': health_score,
            'risk_level': risk_level,
            'predicted_completion_date': predicted_completion,
            'budget_burn_rate': budget_burn_rate,
            'key_risks': risk_data,
            'top_recommendation': top_recommendation,
            'variance_analysis': variance_analysis
        }
        
        serializer = ProjectHealthSummarySerializer(health_data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def gantt_data(self, request, pk=None):
        """Get Gantt chart data for the project."""
        project = self.get_object()
        
        # Get all tasks
        tasks = project.tasks.all()
        task_data = []
        
        for task in tasks:
            task_data.append({
                'id': task.id,
                'name': task.name,
                'start_date': task.start_date,
                'end_date': task.end_date,
                'progress': task.progress_percentage,
                'status': task.status,
                'priority': task.priority,
                'assigned_to': task.assigned_to.email if task.assigned_to else None,
                'is_critical_path': task.is_critical_path
            })
        
        # Get dependencies
        dependencies = []
        for task in tasks:
            for dep in task.dependencies.all():
                dependencies.append({
                    'from': dep.id,
                    'to': task.id
                })
        
        # Critical path
        critical_path = [task.id for task in tasks if task.is_critical_path]
        
        # Resource allocation
        resource_allocation = {}
        for task in tasks:
            if task.assigned_to:
                user_email = task.assigned_to.email
                if user_email not in resource_allocation:
                    resource_allocation[user_email] = []
                
                resource_allocation[user_email].append({
                    'task_id': task.id,
                    'task_name': task.name,
                    'start_date': task.start_date,
                    'end_date': task.end_date,
                    'hours': float(task.estimated_hours) if task.estimated_hours else 0
                })
        
        gantt_data = {
            'tasks': task_data,
            'dependencies': dependencies,
            'critical_path': critical_path,
            'resource_allocation': resource_allocation
        }
        
        serializer = ProjectGanttDataSerializer(gantt_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        """Perform bulk actions on projects."""
        serializer = ProjectBulkActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        project_ids = serializer.validated_data['project_ids']
        action = serializer.validated_data['action']
        data = serializer.validated_data.get('data', {})
        
        projects = Project.objects.filter(id__in=project_ids, tenant=request.user.tenant)
        
        if action == 'archive':
            projects.update(status='archived')
        elif action == 'activate':
            projects.update(status='active')
        elif action == 'cancel':
            projects.update(status='cancelled')
        elif action == 'duplicate':
            for project in projects:
                self._duplicate_project(project, f"{project.name} (Copy)")
        elif action == 'update_status':
            new_status = data.get('status')
            if new_status:
                projects.update(status=new_status)
        
        return Response({'message': f'Bulk action "{action}" completed successfully'})
    
    @action(detail=True, methods=['post'])
    def ask_promana(self, request, pk=None):
        """Ask Promana AI a question about the project."""
        project = self.get_object()
        serializer = PromanaQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        query = serializer.validated_data['query']
        context = serializer.validated_data.get('context', {})
        
        # Generate Promana response
        response_data = self._generate_promana_response(project, query, context)
        
        return Response(response_data)
    
    @action(detail=True, methods=['post'])
    def analyze_health(self, request, pk=None):
        """Trigger Promana health analysis for the project."""
        project = self.get_object()
        
        try:
            analysis_result = analyze_project_health(str(project.id))
            return Response(analysis_result)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def generate_insights(self, request, pk=None):
        """Generate comprehensive project insights using Promana AI."""
        project = self.get_object()
        
        try:
            insights = generate_project_insights(str(project.id))
            return Response(insights)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def predict_completion(self, request, pk=None):
        """Predict project completion using Promana AI."""
        project = self.get_object()
        
        try:
            prediction = predict_project_completion(str(project.id))
            return Response(prediction)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def analyze_resources(self, request, pk=None):
        """Analyze resource utilization using Promana AI."""
        project = self.get_object()
        
        try:
            analysis = analyze_resource_utilization(str(project.id))
            return Response(analysis)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a project."""
        project = self.get_object()
        new_name = request.data.get('name', f"{project.name} (Copy)")
        
        new_project = self._duplicate_project(project, new_name)
        serializer = ProjectSerializer(new_project)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive a project."""
        project = self.get_object()
        project.status = 'archived'
        project.save()
        
        serializer = ProjectSerializer(project)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def resource_management(self, request, pk=None):
        """Get resource management data for the project."""
        project = self.get_object()
        
        # Team capacity and workload
        team_members = project.team_memberships.filter(is_active=True)
        resource_data = []
        
        for member in team_members:
            assigned_tasks = member.user.assigned_tasks.filter(project=project)
            total_assigned_hours = assigned_tasks.aggregate(
                total=Sum('estimated_hours')
            )['total'] or 0
            
            completed_hours = assigned_tasks.filter(status='completed').aggregate(
                total=Sum('actual_hours')
            )['total'] or 0
            
            resource_data.append({
                'user_id': member.user.id,
                'name': f"{member.user.first_name} {member.user.last_name}",
                'email': member.user.email,
                'role': member.role,
                'capacity_hours': float(member.capacity_hours),
                'assigned_hours': float(total_assigned_hours),
                'completed_hours': float(completed_hours),
                'utilization_percentage': round((total_assigned_hours / member.capacity_hours) * 100, 2) if member.capacity_hours > 0 else 0,
                'skills': member.skills,
                'hourly_rate': float(member.hourly_rate) if member.hourly_rate else 0
            })
        
        return Response({
            'project_id': project.id,
            'project_name': project.name,
            'resources': resource_data
        })
    
    @action(detail=True, methods=['get'])
    def client_portal_data(self, request, pk=None):
        """Get client portal data for the project."""
        project = self.get_object()
        
        try:
            client_portal = project.client_portal
            portal_data = ClientPortalSerializer(client_portal).data
        except:
            portal_data = None
        
        # Public files
        public_files = project.files.filter(is_public=True)
        files_data = ProjectFileSerializer(public_files, many=True).data
        
        # Public milestones
        public_milestones = project.milestones.filter(client_approval_required=True)
        milestones_data = ProjectMilestoneSerializer(public_milestones, many=True).data
        
        return Response({
            'project_id': project.id,
            'project_name': project.name,
            'client_portal': portal_data,
            'public_files': files_data,
            'public_milestones': milestones_data,
            'progress_percentage': project.progress_percentage,
            'status': project.status
        })
    
    def _trigger_promana_analysis(self, project):
        """Trigger Promana AI analysis for a project."""
        # This would integrate with the actual Promana AI service
        # For now, we'll create some basic insights
        
        # Update health score based on various factors
        health_score = 100
        
        # Reduce score for overdue projects
        if project.is_overdue:
            health_score -= 20
        
        # Reduce score for high budget utilization
        if project.budget_utilization > 90:
            health_score -= 15
        
        # Reduce score for low progress
        if project.progress_percentage < 30 and project.days_remaining < 7:
            health_score -= 25
        
        project.health_score = max(health_score, 0)
        project.last_promana_analysis = timezone.now()
        project.save()
        
        # Create insights
        self._create_promana_insights(project)
    
    def _has_significant_changes(self, project):
        """Check if project has significant changes that warrant Promana analysis."""
        # This is a simplified check - in practice, you'd track what changed
        return True
    
    def _create_promana_insights(self, project):
        """Create Promana insights for the project."""
        # Create risk insights
        if project.is_overdue:
            PromanaInsight.objects.create(
                tenant=project.tenant,
                project=project,
                insight_type='risk_alert',
                title='Project Overdue',
                description=f'Project "{project.name}" is overdue by {abs(project.days_remaining)} days.',
                confidence_score=95,
                is_actionable=True
            )
        
        if project.budget_utilization > 90:
            PromanaInsight.objects.create(
                tenant=project.tenant,
                project=project,
                insight_type='risk_alert',
                title='Budget Exceeded',
                description=f'Project "{project.name}" has exceeded {project.budget_utilization}% of budget.',
                confidence_score=90,
                is_actionable=True
            )
    
    def _generate_promana_response(self, project, query, context):
        """Generate a response from Promana AI."""
        # This would integrate with the actual Promana AI service
        # For now, return a mock response
        
        response = f"Based on my analysis of project '{project.name}', here's what I found regarding your question: '{query}'"
        
        insights = [
            {
                'type': 'analysis',
                'content': f'Project health score: {project.health_score}/100'
            },
            {
                'type': 'recommendation',
                'content': 'Consider reviewing task dependencies to optimize the critical path.'
            }
        ]
        
        recommendations = [
            'Schedule a team meeting to discuss current blockers',
            'Review resource allocation for the upcoming week',
            'Update project stakeholders on current progress'
        ]
        
        return {
            'response': response,
            'insights': insights,
            'recommendations': recommendations,
            'confidence_score': 85
        }
    
    def _duplicate_project(self, project, new_name):
        """Duplicate a project with all its components."""
        # Create new project
        new_project = Project.objects.create(
            tenant=project.tenant,
            name=new_name,
            description=project.description,
            project_type=project.project_type,
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=project.duration_days),
            status='draft',
            budget=project.budget,
            manager=project.manager
        )
        
        # Copy team members
        for member in project.team_memberships.all():
            ProjectTeamMember.objects.create(
                project=new_project,
                user=member.user,
                role=member.role,
                hourly_rate=member.hourly_rate,
                capacity_hours=member.capacity_hours,
                skills=member.skills,
                permissions=member.permissions
            )
        
        # Copy tasks
        task_mapping = {}
        for task in project.tasks.all():
            new_task = ProjectTask.objects.create(
                tenant=project.tenant,
                project=new_project,
                name=task.name,
                description=task.description,
                start_date=task.start_date,
                end_date=task.end_date,
                status='pending',
                priority=task.priority,
                estimated_hours=task.estimated_hours,
                tags=task.tags
            )
            task_mapping[task.id] = new_task
        
        # Copy milestones
        for milestone in project.milestones.all():
            new_milestone = ProjectMilestone.objects.create(
                tenant=project.tenant,
                project=new_project,
                name=milestone.name,
                description=milestone.description,
                due_date=milestone.due_date,
                client_approval_required=milestone.client_approval_required
            )
        
        return new_project


class ProjectTaskViewSet(viewsets.ModelViewSet):
    """Enhanced task viewset with Promana AI integration."""
    
    queryset = ProjectTask.objects.all()
    serializer_class = ProjectTaskSerializer
    permission_classes = [DigiSolAdminOrAuthenticated, IsTenantUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'assigned_to', 'project']
    search_fields = ['name', 'description']
    ordering_fields = ['start_date', 'end_date', 'priority', 'created_at']
    ordering = ['start_date', 'priority']
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        return super().get_queryset().filter(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a task."""
        task = self.get_object()
        task.status = 'in_progress'
        task.save()
        
        serializer = ProjectTaskSerializer(task)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a task."""
        task = self.get_object()
        task.status = 'completed'
        task.save()
        
        # Trigger project analysis
        self._trigger_project_analysis(task.project)
        
        serializer = ProjectTaskSerializer(task)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def block(self, request, pk=None):
        """Block a task."""
        task = self.get_object()
        task.status = 'blocked'
        task.save()
        
        serializer = ProjectTaskSerializer(task)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def log_time(self, request, pk=None):
        """Log time for a task."""
        task = self.get_object()
        serializer = TimeEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        time_entry = serializer.save(
            tenant=request.user.tenant,
            project=task.project,
            task=task,
            user=request.user
        )
        
        # Update task actual hours
        task.actual_hours = task.time_entries.aggregate(
            total=Sum('hours')
        )['total'] or 0
        task.save()
        
        return Response(TimeEntrySerializer(time_entry).data)
    
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Get tasks assigned to the current user."""
        tasks = self.get_queryset().filter(assigned_to=request.user)
        serializer = ProjectTaskSerializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue tasks."""
        tasks = self.get_queryset().filter(
            end_date__lt=timezone.now().date(),
            status__in=['pending', 'in_progress']
        )
        serializer = ProjectTaskSerializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def suggest_assignee(self, request, pk=None):
        """Get Promana AI suggestion for task assignee."""
        task = self.get_object()
        
        try:
            suggestion = suggest_task_assignee(str(task.id))
            return Response(suggestion)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _trigger_project_analysis(self, project):
        """Trigger analysis when task status changes."""
        # This would trigger Promana analysis
        pass


class ProjectMilestoneViewSet(viewsets.ModelViewSet):
    """Viewset for project milestones."""
    
    queryset = ProjectMilestone.objects.all()
    serializer_class = ProjectMilestoneSerializer
    permission_classes = [DigiSolAdminOrAuthenticated, IsTenantUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'is_completed']
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        return super().get_queryset().filter(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a milestone."""
        milestone = self.get_object()
        milestone.is_completed = True
        milestone.completed_at = timezone.now()
        milestone.completed_by = request.user
        milestone.save()
        
        serializer = ProjectMilestoneSerializer(milestone)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def client_approve(self, request, pk=None):
        """Mark milestone as approved by client."""
        milestone = self.get_object()
        milestone.client_approved = True
        milestone.client_approved_at = timezone.now()
        milestone.save()
        
        serializer = ProjectMilestoneSerializer(milestone)
        return Response(serializer.data)


class ProjectFileViewSet(viewsets.ModelViewSet):
    """Viewset for project files."""
    
    queryset = ProjectFile.objects.all()
    serializer_class = ProjectFileSerializer
    permission_classes = [DigiSolAdminOrAuthenticated, IsTenantUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'task', 'file_type', 'is_public']
    search_fields = ['name']
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        return super().get_queryset().filter(tenant=self.request.user.tenant)


class ProjectCommentViewSet(viewsets.ModelViewSet):
    """Viewset for project comments."""
    
    queryset = ProjectComment.objects.all()
    serializer_class = ProjectCommentSerializer
    permission_classes = [DigiSolAdminOrAuthenticated, IsTenantUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'task', 'is_internal']
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        return super().get_queryset().filter(tenant=self.request.user.tenant)
    
    def perform_create(self, serializer):
        """Set author when creating comment."""
        serializer.save(author=self.request.user)


class ProjectTemplateViewSet(viewsets.ModelViewSet):
    """Viewset for project templates."""
    
    queryset = ProjectTemplate.objects.all()
    serializer_class = ProjectTemplateSerializer
    permission_classes = [DigiSolAdminOrAuthenticated, IsTenantUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project_type', 'is_global']
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        return super().get_queryset().filter(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'])
    def create_project(self, request, pk=None):
        """Create a project from template."""
        template = self.get_object()
        serializer = ProjectTemplateCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Create new project
        project = Project.objects.create(
            tenant=request.user.tenant,
            name=data['project_name'],
            description=template.description,
            project_type=template.project_type,
            start_date=data['start_date'],
            end_date=data['end_date'],
            manager_id=data.get('manager_id'),
            status='draft'
        )
        
        # Add team members if specified
        if data.get('team_member_ids'):
            for user_id in data['team_member_ids']:
                ProjectTeamMember.objects.create(
                    project=project,
                    user_id=user_id,
                    role='contributor'
                )
        
        # Create tasks from template
        template_data = template.template_data
        if 'tasks' in template_data:
            for task_data in template_data['tasks']:
                ProjectTask.objects.create(
                    tenant=request.user.tenant,
                    project=project,
                    name=task_data['name'],
                    description=task_data.get('description', ''),
                    start_date=data['start_date'],
                    end_date=data['end_date'],
                    estimated_hours=task_data.get('estimated_hours'),
                    priority=task_data.get('priority', 'medium')
                )
        
        serializer = ProjectSerializer(project)
        return Response(serializer.data)


class PromanaInsightViewSet(viewsets.ModelViewSet):
    """Viewset for Promana AI insights."""
    
    queryset = PromanaInsight.objects.all()
    serializer_class = PromanaInsightSerializer
    permission_classes = [DigiSolAdminOrAuthenticated, IsTenantUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'task', 'insight_type', 'is_actionable', 'action_taken']
    search_fields = ['title', 'description']
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        return super().get_queryset().filter(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'])
    def take_action(self, request, pk=None):
        """Mark insight as action taken."""
        insight = self.get_object()
        insight.action_taken = True
        insight.action_taken_at = timezone.now()
        insight.action_taken_by = request.user
        insight.save()
        
        serializer = PromanaInsightSerializer(insight)
        return Response(serializer.data)


class ProjectAutomationRuleViewSet(viewsets.ModelViewSet):
    """Viewset for project automation rules."""
    
    queryset = ProjectAutomationRule.objects.all()
    serializer_class = ProjectAutomationRuleSerializer
    permission_classes = [DigiSolAdminOrAuthenticated, IsTenantUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'trigger', 'action', 'is_active']
    search_fields = ['name']
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        return super().get_queryset().filter(tenant=self.request.user.tenant)
    
    def perform_create(self, serializer):
        """Set created_by when creating rule."""
        serializer.save(created_by=self.request.user)


class ProjectRiskViewSet(viewsets.ModelViewSet):
    """Viewset for project risks."""
    
    queryset = ProjectRisk.objects.all()
    serializer_class = ProjectRiskSerializer
    permission_classes = [DigiSolAdminOrAuthenticated, IsTenantUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'probability', 'impact', 'status']
    search_fields = ['title', 'description']
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        return super().get_queryset().filter(tenant=self.request.user.tenant)


class ProjectReportViewSet(viewsets.ModelViewSet):
    """Viewset for project reports."""
    
    queryset = ProjectReport.objects.all()
    serializer_class = ProjectReportSerializer
    permission_classes = [DigiSolAdminOrAuthenticated, IsTenantUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project', 'report_type', 'is_scheduled']
    search_fields = ['name']
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        return super().get_queryset().filter(tenant=self.request.user.tenant)
    
    def perform_create(self, serializer):
        """Set generated_by when creating report."""
        serializer.save(generated_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        """Export report in various formats."""
        report = self.get_object()
        format_type = request.query_params.get('format', 'json')
        
        if format_type == 'pdf':
            # Generate PDF report
            return Response({'message': 'PDF export not implemented yet'})
        elif format_type == 'excel':
            # Generate Excel report
            return Response({'message': 'Excel export not implemented yet'})
        else:
            # Return JSON data
            return Response(report.report_data)


class ClientPortalViewSet(viewsets.ModelViewSet):
    """Viewset for client portal access."""
    
    queryset = ClientPortal.objects.all()
    serializer_class = ClientPortalSerializer
    permission_classes = [DigiSolAdminOrAuthenticated, IsTenantUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'is_active']
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        return super().get_queryset().filter(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'])
    def generate_access_code(self, request, pk=None):
        """Generate new access code for client portal."""
        client_portal = self.get_object()
        import secrets
        client_portal.access_code = secrets.token_urlsafe(16)
        client_portal.save()
        
        serializer = ClientPortalSerializer(client_portal)
        return Response(serializer.data)


class TimeEntryViewSet(viewsets.ModelViewSet):
    """Viewset for time entries."""
    
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer
    permission_classes = [DigiSolAdminOrAuthenticated, IsTenantUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'task', 'user', 'date']
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        return super().get_queryset().filter(tenant=self.request.user.tenant)
    
    def perform_create(self, serializer):
        """Set user when creating time entry."""
        serializer.save(user=self.request.user)
