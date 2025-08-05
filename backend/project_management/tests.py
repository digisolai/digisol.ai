from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import date, timedelta
from core.models import Tenant
from .models import Project, ProjectTask

User = get_user_model()


class ProjectModelTest(TestCase):
    """Test cases for Project model."""
    
    def setUp(self):
        """Set up test data."""
        self.tenant = Tenant.objects.create(name="Test Tenant")
        self.user = User.objects.create_user(
            username="testuser1",
            email="test@example.com",
            password="testpass123",
            tenant=self.tenant
        )
        self.project = Project.objects.create(
            tenant=self.tenant,
            name="Test Project",
            description="A test project",
            manager=self.user,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            budget=Decimal('10000.00')
        )
    
    def test_project_creation(self):
        """Test project creation."""
        self.assertEqual(self.project.name, "Test Project")
        self.assertEqual(self.project.status, "draft")  # Default status is 'draft'
        self.assertEqual(self.project.budget, Decimal('10000.00'))
    
    def test_project_duration(self):
        """Test project duration calculation."""
        self.assertEqual(self.project.duration_days, 30)
    
    def test_project_progress(self):
        """Test project progress calculation."""
        # Initially no tasks, so progress should be 0
        self.assertEqual(self.project.progress_percentage, 0)
        
        # Add a completed task
        task = ProjectTask.objects.create(
            tenant=self.tenant,
            project=self.project,
            name="Test Task",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=5),
            status="completed"
        )
        
        # Progress should be 100% (1 completed task out of 1 total)
        # Note: Progress calculation is based on completed tasks vs total tasks
        self.assertEqual(self.project.progress_percentage, 100)
        
        # Add another pending task
        ProjectTask.objects.create(
            tenant=self.tenant,
            project=self.project,
            name="Test Task 2",
            start_date=date.today() + timedelta(days=6),
            end_date=date.today() + timedelta(days=10),
            status="pending"
        )
        
        # Progress should be 50% (1 completed task out of 2 total)
        self.assertEqual(self.project.progress_percentage, 50)
    
    def test_project_overdue(self):
        """Test project overdue status."""
        # Project with end date in the past should be overdue
        overdue_project = Project.objects.create(
            tenant=self.tenant,
            name="Overdue Project",
            start_date=date.today() - timedelta(days=60),
            end_date=date.today() - timedelta(days=30),
            status="in_progress"
        )
        self.assertTrue(overdue_project.is_overdue)
        
        # Completed project should not be overdue
        overdue_project.status = "completed"
        overdue_project.save()
        self.assertFalse(overdue_project.is_overdue)


class ProjectTaskModelTest(TestCase):
    """Test cases for ProjectTask model."""
    
    def setUp(self):
        """Set up test data."""
        self.tenant = Tenant.objects.create(name="Test Tenant")
        self.user = User.objects.create_user(
            username="testuser2",
            email="test@example.com",
            password="testpass123",
            tenant=self.tenant
        )
        self.project = Project.objects.create(
            tenant=self.tenant,
            name="Test Project",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30)
        )
        self.task = ProjectTask.objects.create(
            tenant=self.tenant,
            project=self.project,
            name="Test Task",
            description="A test task",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=5),
            assigned_to=self.user,
            estimated_hours=Decimal('8.00'),
            actual_hours=Decimal('4.00')
        )
    
    def test_task_creation(self):
        """Test task creation."""
        self.assertEqual(self.task.name, "Test Task")
        self.assertEqual(self.task.status, "pending")
        self.assertEqual(self.task.estimated_hours, Decimal('8.00'))
        self.assertEqual(self.task.actual_hours, Decimal('4.00'))
    
    def test_task_duration(self):
        """Test task duration calculation."""
        self.assertEqual(self.task.duration_days, 5)
    
    def test_task_progress(self):
        """Test task progress calculation."""
        # 4 hours actual / 8 hours estimated = 50%
        self.assertEqual(self.task.progress_percentage, 50)
        
        # Complete the task
        self.task.actual_hours = Decimal('8.00')
        self.task.save()
        self.assertEqual(self.task.progress_percentage, 100)
        
        # More hours than estimated should cap at 100%
        self.task.actual_hours = Decimal('10.00')
        self.task.save()
        self.assertEqual(self.task.progress_percentage, 100)
    
    def test_task_dependencies(self):
        """Test task dependencies."""
        # Create a dependency task
        dependency_task = ProjectTask.objects.create(
            tenant=self.tenant,
            project=self.project,
            name="Dependency Task",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=3),
            status="pending"
        )
        
        # Initially task should be able to start (no dependencies)
        self.assertTrue(self.task.can_start)
        
        # Add dependency
        self.task.dependencies.add(dependency_task)
        
        # Task should not be able to start
        self.assertFalse(self.task.can_start)
        
        # Complete dependency
        dependency_task.status = "completed"
        dependency_task.save()
        
        # Task should now be able to start
        self.assertTrue(self.task.can_start)
    
    def test_task_overdue(self):
        """Test task overdue status."""
        # Task with end date in the past should be overdue
        overdue_task = ProjectTask.objects.create(
            tenant=self.tenant,
            project=self.project,
            name="Overdue Task",
            start_date=date.today() - timedelta(days=10),
            end_date=date.today() - timedelta(days=5),
            status="in_progress"
        )
        self.assertTrue(overdue_task.is_overdue)
        
        # Completed task should not be overdue
        overdue_task.status = "completed"
        overdue_task.save()
        self.assertFalse(overdue_task.is_overdue)
