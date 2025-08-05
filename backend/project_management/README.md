# Project Management System

A comprehensive project management system for DigiSol.AI with Gantt chart support.

## Features

### 🎯 Core Functionality
- **Project Management**: Create, update, and track projects with budgets and timelines
- **Task Management**: Break down projects into tasks with dependencies and assignments
- **Progress Tracking**: Real-time progress calculation and status updates
- **Dependency Management**: Task dependencies to ensure proper workflow
- **Time Tracking**: Estimated vs actual hours tracking
- **Multi-tenancy**: Full tenant-aware system for data isolation

### 📊 Gantt Chart Support
- **Timeline Visualization**: Projects and tasks with start/end dates
- **Dependency Lines**: Visual representation of task dependencies
- **Progress Bars**: Real-time progress visualization
- **Drag & Drop**: Interactive timeline management
- **Zoom & Pan**: Flexible timeline navigation

## Models

### Project Model
```python
class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    manager = models.ForeignKey(CustomUser, related_name='managed_projects')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(choices=STATUS_CHOICES, default='pending')
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### ProjectTask Model
```python
class ProjectTask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, related_name='tasks')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(choices=STATUS_CHOICES, default='pending')
    assigned_to = models.ForeignKey(CustomUser, related_name='assigned_tasks')
    dependencies = models.ManyToManyField('self', symmetrical=False)
    estimated_hours = models.DecimalField(max_digits=6, decimal_places=2)
    actual_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## API Endpoints

### Projects
- `GET /api/project-management/projects/` - List all projects
- `POST /api/project-management/projects/` - Create new project
- `GET /api/project-management/projects/{id}/` - Get project details
- `PUT /api/project-management/projects/{id}/` - Update project
- `DELETE /api/project-management/projects/{id}/` - Delete project

### Project Actions
- `GET /api/project-management/projects/{id}/tasks/` - Get project tasks
- `GET /api/project-management/projects/{id}/progress/` - Get project progress
- `GET /api/project-management/projects/dashboard/` - Get dashboard summary

### Tasks
- `GET /api/project-management/tasks/` - List all tasks
- `POST /api/project-management/tasks/` - Create new task
- `GET /api/project-management/tasks/{id}/` - Get task details
- `PUT /api/project-management/tasks/{id}/` - Update task
- `DELETE /api/project-management/tasks/{id}/` - Delete task

### Task Actions
- `POST /api/project-management/tasks/{id}/start/` - Start task
- `POST /api/project-management/tasks/{id}/complete/` - Complete task
- `POST /api/project-management/tasks/{id}/block/` - Block task
- `GET /api/project-management/tasks/my_tasks/` - Get user's assigned tasks
- `GET /api/project-management/tasks/overdue/` - Get overdue tasks

### Nested Routes
- `GET /api/project-management/projects/{project_id}/tasks/` - Get tasks for specific project

## Usage Examples

### Create a Project
```python
project_data = {
    "name": "Website Redesign",
    "description": "Complete website redesign with modern UI/UX",
    "manager": user.id,
    "start_date": "2024-01-15",
    "end_date": "2024-03-15",
    "budget": "25000.00",
    "status": "in_progress"
}

response = requests.post('/api/project-management/projects/', json=project_data)
```

### Create a Task
```python
task_data = {
    "project": project.id,
    "name": "UI/UX Design",
    "description": "Create wireframes and mockups",
    "start_date": "2024-01-15",
    "end_date": "2024-02-15",
    "assigned_to": user.id,
    "estimated_hours": "40.00",
    "dependencies": []
}

response = requests.post('/api/project-management/tasks/', json=task_data)
```

### Get Project Progress
```python
response = requests.get(f'/api/project-management/projects/{project_id}/progress/')
progress_data = response.json()

# Returns:
{
    "total_tasks": 5,
    "completed_tasks": 2,
    "in_progress_tasks": 2,
    "pending_tasks": 1,
    "blocked_tasks": 0,
    "progress_percentage": 40.0,
    "overdue_tasks": 0,
    "total_estimated_hours": 120.00,
    "total_actual_hours": 45.00
}
```

## Gantt Chart Data Structure

For frontend Gantt chart implementation, use the following data structure:

```javascript
// Project data for Gantt chart
const ganttData = {
    projects: [
        {
            id: "project-uuid",
            name: "Website Redesign",
            start_date: "2024-01-15",
            end_date: "2024-03-15",
            progress: 40,
            status: "in_progress"
        }
    ],
    tasks: [
        {
            id: "task-uuid",
            project_id: "project-uuid",
            name: "UI/UX Design",
            start_date: "2024-01-15",
            end_date: "2024-02-15",
            progress: 60,
            status: "in_progress",
            dependencies: ["dependency-task-uuid"],
            assigned_to: "user-uuid"
        }
    ]
}
```

## Status Choices

### Project Status
- `pending` - Project is planned but not started
- `in_progress` - Project is actively being worked on
- `completed` - Project is finished
- `cancelled` - Project has been cancelled

### Task Status
- `pending` - Task is planned but not started
- `in_progress` - Task is actively being worked on
- `completed` - Task is finished
- `blocked` - Task is blocked by dependencies or issues

## Properties

### Project Properties
- `duration_days` - Calculated project duration in days
- `progress_percentage` - Progress based on completed tasks
- `is_overdue` - Whether project is past its end date

### Task Properties
- `duration_days` - Calculated task duration in days
- `progress_percentage` - Progress based on hours worked vs estimated
- `is_overdue` - Whether task is past its end date
- `can_start` - Whether task can start based on dependencies

## Testing

Run the test script to verify the system:

```bash
python test_project_management.py
```

This will create sample projects and tasks to test all functionality.

## Frontend Integration

The system is designed to work seamlessly with frontend Gantt chart libraries like:
- **React Gantt Chart**
- **DHTMLX Gantt**
- **Bryntum Gantt**
- **Custom Chart.js implementation**

All necessary data is provided through the API endpoints for easy frontend integration. 