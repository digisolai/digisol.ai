#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Tenant
from project_management.models import Project, ProjectTask
from decimal import Decimal
from datetime import date, timedelta

User = get_user_model()

# Create test data
tenant = Tenant.objects.create(name="Debug Tenant")
user = User.objects.create_user(
    username="debuguser",
    email="debug@example.com",
    password="testpass123",
    tenant=tenant
)

# Test Project
project = Project.objects.create(
    tenant=tenant,
    name="Debug Project",
    description="A debug project",
    manager=user,
    start_date=date.today(),
    end_date=date.today() + timedelta(days=30),
    budget=Decimal('10000.00')
)

print(f"Project ID: {project.id}")
print(f"Project status: {project.status}")
print(f"Project progress: {project.progress_percentage}%")
print(f"Total tasks: {project.tasks.count()}")

# Test Task
task = ProjectTask.objects.create(
    tenant=tenant,
    project=project,
    name="Debug Task",
    start_date=date.today(),
    end_date=date.today() + timedelta(days=5),
    status="completed"
)

print(f"Task ID: {task.id}")
print(f"Task project ID: {task.project.id}")
print(f"Task status: {task.status}")
print(f"Task can_start: {task.can_start}")
print(f"Total tasks after creation: {project.tasks.count()}")
print(f"All tasks in DB: {ProjectTask.objects.count()}")
print(f"Completed tasks: {project.tasks.filter(status='completed').count()}")
print(f"Project progress after task: {project.progress_percentage}%")

# Test dependencies
dependency_task = ProjectTask.objects.create(
    tenant=tenant,
    project=project,
    name="Dependency Task",
    start_date=date.today(),
    end_date=date.today() + timedelta(days=3),
    status="pending"
)

task2 = ProjectTask.objects.create(
    tenant=tenant,
    project=project,
    name="Task with Dependency",
    start_date=date.today(),
    end_date=date.today() + timedelta(days=5),
    status="pending"
)

print(f"Task2 can_start before dependency: {task2.can_start}")
task2.dependencies.add(dependency_task)
print(f"Task2 can_start after dependency: {task2.can_start}")
print(f"Dependencies count: {task2.dependencies.count()}")

# Cleanup
# tenant.delete()  # Comment out cleanup to check if tasks persist 