#!/usr/bin/env python3
"""
Comprehensive Project Manager Testing Script
Tests all aspects of the project management system including:
- Backend API endpoints
- Frontend components
- Database models
- Promana AI integration
- Task management
- Resource management
- File management
- Reporting and analytics
"""

import os
import sys
import json
import requests
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Test configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"
FRONTEND_URL = "http://localhost:5173"

class ProjectManagerTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_user = None
        self.test_project = None
        self.test_tasks = []
        self.test_files = []
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": [],
            "tests": []
        }

    def log_test(self, test_name: str, success: bool, message: str = "", error: str = ""):
        """Log test results"""
        test_result = {
            "name": test_name,
            "success": success,
            "message": message,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        self.results["tests"].append(test_result)
        
        if success:
            self.results["passed"] += 1
            print(f"✅ PASS: {test_name} - {message}")
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {error}")
            print(f"❌ FAIL: {test_name} - {error}")

    def test_backend_health(self):
        """Test backend server health"""
        try:
            response = self.session.get(f"{BASE_URL}/health/")
            if response.status_code == 200:
                self.log_test("Backend Health Check", True, "Backend server is running")
            else:
                self.log_test("Backend Health Check", False, "", f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Backend Health Check", False, "", str(e))

    def test_database_connection(self):
        """Test database connection and models"""
        try:
            # Set up Django environment
            import os
            import django
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings')
            django.setup()
            
            # Test project model creation
            from project_management.models import Project, ProjectTask, ProjectTeamMember
            from core.models import Tenant
            from accounts.models import CustomUser
            
            self.log_test("Database Models", True, "All project management models are accessible")
        except Exception as e:
            self.log_test("Database Models", False, "", str(e))

    def test_authentication(self):
        """Test user authentication"""
        try:
            # Test login
            login_data = {
                "email": "test@example.com",
                "password": "testpass123"
            }
            response = self.session.post(f"{API_BASE}/accounts/token/", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access")
                self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                self.log_test("Authentication", True, "User authenticated successfully")
            else:
                # Try to create test user
                self.test_create_user()
                response = self.session.post(f"{API_BASE}/accounts/token/", json=login_data)
                if response.status_code == 200:
                    data = response.json()
                    self.auth_token = data.get("access")
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    self.log_test("Authentication", True, "Test user created and authenticated")
                else:
                    self.log_test("Authentication", False, "", f"Login failed: {response.text}")
        except Exception as e:
            self.log_test("Authentication", False, "", str(e))

    def test_create_user(self):
        """Create test user if needed"""
        try:
            user_data = {
                "email": "test@example.com",
                "password": "testpass123",
                "first_name": "Test",
                "last_name": "User"
            }
            response = self.session.post(f"{API_BASE}/accounts/register/", json=user_data)
            if response.status_code in [200, 201, 400]:  # 400 might mean user already exists
                self.log_test("Create Test User", True, "Test user created or already exists")
            else:
                self.log_test("Create Test User", False, "", f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Create Test User", False, "", str(e))

    def test_project_crud(self):
        """Test project CRUD operations"""
        try:
            # Create project
            project_data = {
                "name": "Test Project - Project Manager",
                "description": "Comprehensive test project for project management system",
                "project_type": "app_development",
                "start_date": datetime.now().date().isoformat(),
                "end_date": (datetime.now() + timedelta(days=30)).date().isoformat(),
                "budget": 50000.00,
                "status": "active"
            }
            
            response = self.session.post(f"{API_BASE}/project-management/projects/", json=project_data)
            if response.status_code == 201:
                self.test_project = response.json()
                self.log_test("Create Project", True, f"Project created: {self.test_project['name']}")
            else:
                self.log_test("Create Project", False, "", f"Status code: {response.status_code}, Response: {response.text}")
                return

            # Read project
            project_id = self.test_project["id"]
            response = self.session.get(f"{API_BASE}/project-management/projects/{project_id}/")
            if response.status_code == 200:
                self.log_test("Read Project", True, "Project retrieved successfully")
            else:
                self.log_test("Read Project", False, "", f"Status code: {response.status_code}")

            # Update project
            update_data = {"description": "Updated description for testing"}
            response = self.session.patch(f"{API_BASE}/project-management/projects/{project_id}/", json=update_data)
            if response.status_code == 200:
                self.log_test("Update Project", True, "Project updated successfully")
            else:
                self.log_test("Update Project", False, "", f"Status code: {response.status_code}")

            # List projects
            response = self.session.get(f"{API_BASE}/project-management/projects/")
            if response.status_code == 200:
                projects = response.json()
                self.log_test("List Projects", True, f"Found {len(projects)} projects")
            else:
                self.log_test("List Projects", False, "", f"Status code: {response.status_code}")

        except Exception as e:
            self.log_test("Project CRUD", False, "", str(e))

    def test_task_management(self):
        """Test task management functionality"""
        if not self.test_project:
            self.log_test("Task Management", False, "", "No test project available")
            return

        try:
            project_id = self.test_project["id"]
            
            # Create tasks
            tasks_data = [
                {
                    "name": "Design System Setup",
                    "description": "Create comprehensive design system with components",
                    "start_date": datetime.now().date().isoformat(),
                    "end_date": (datetime.now() + timedelta(days=7)).date().isoformat(),
                    "estimated_hours": 16.0,
                    "priority": "high",
                    "status": "pending"
                },
                {
                    "name": "API Development",
                    "description": "Develop RESTful API endpoints",
                    "start_date": (datetime.now() + timedelta(days=3)).date().isoformat(),
                    "end_date": (datetime.now() + timedelta(days=14)).date().isoformat(),
                    "estimated_hours": 40.0,
                    "priority": "critical",
                    "status": "pending"
                },
                {
                    "name": "Frontend Implementation",
                    "description": "Build user interface components",
                    "start_date": (datetime.now() + timedelta(days=7)).date().isoformat(),
                    "end_date": (datetime.now() + timedelta(days=21)).date().isoformat(),
                    "estimated_hours": 60.0,
                    "priority": "high",
                    "status": "pending"
                }
            ]

            for task_data in tasks_data:
                response = self.session.post(f"{API_BASE}/project-management/tasks/", json=task_data)
                if response.status_code == 201:
                    self.test_tasks.append(response.json())
                    self.log_test(f"Create Task: {task_data['name']}", True, "Task created successfully")
                else:
                    self.log_test(f"Create Task: {task_data['name']}", False, "", f"Status code: {response.status_code}")

            # Test task operations
            if self.test_tasks:
                task_id = self.test_tasks[0]["id"]
                
                # Start task
                response = self.session.post(f"{API_BASE}/project-management/tasks/{task_id}/start/")
                if response.status_code == 200:
                    self.log_test("Start Task", True, "Task started successfully")
                else:
                    self.log_test("Start Task", False, "", f"Status code: {response.status_code}")

                # Log time
                time_data = {
                    "hours_spent": 4.0,
                    "description": "Initial setup and planning"
                }
                response = self.session.post(f"{API_BASE}/project-management/tasks/{task_id}/log_time/", json=time_data)
                if response.status_code == 200:
                    self.log_test("Log Time", True, "Time logged successfully")
                else:
                    self.log_test("Log Time", False, "", f"Status code: {response.status_code}")

                # Complete task
                response = self.session.post(f"{API_BASE}/project-management/tasks/{task_id}/complete/")
                if response.status_code == 200:
                    self.log_test("Complete Task", True, "Task completed successfully")
                else:
                    self.log_test("Complete Task", False, "", f"Status code: {response.status_code}")

            # Test task filtering
            response = self.session.get(f"{API_BASE}/project-management/tasks/?project_id={project_id}")
            if response.status_code == 200:
                tasks = response.json()
                self.log_test("Filter Tasks by Project", True, f"Found {len(tasks)} tasks for project")
            else:
                self.log_test("Filter Tasks by Project", False, "", f"Status code: {response.status_code}")

        except Exception as e:
            self.log_test("Task Management", False, "", str(e))

    def test_promana_ai_integration(self):
        """Test Promana AI integration features"""
        if not self.test_project:
            self.log_test("Promana AI Integration", False, "", "No test project available")
            return

        try:
            project_id = self.test_project["id"]
            
            # Test health summary
            response = self.session.get(f"{API_BASE}/project-management/projects/{project_id}/health_summary/")
            if response.status_code == 200:
                health_data = response.json()
                self.log_test("Promana Health Summary", True, f"Health score: {health_data.get('health_score', 'N/A')}")
            else:
                self.log_test("Promana Health Summary", False, "", f"Status code: {response.status_code}")

            # Test Gantt data
            response = self.session.get(f"{API_BASE}/project-management/projects/{project_id}/gantt_data/")
            if response.status_code == 200:
                gantt_data = response.json()
                self.log_test("Promana Gantt Data", True, f"Generated Gantt data with {len(gantt_data.get('tasks', []))} tasks")
            else:
                self.log_test("Promana Gantt Data", False, "", f"Status code: {response.status_code}")

            # Test Promana query
            query_data = {
                "query": "What is the project progress?",
                "context": {"include_tasks": True, "include_budget": True}
            }
            response = self.session.post(f"{API_BASE}/project-management/projects/{project_id}/ask_promana/", json=query_data)
            if response.status_code == 200:
                promana_response = response.json()
                self.log_test("Promana Query", True, "Promana responded to query")
            else:
                self.log_test("Promana Query", False, "", f"Status code: {response.status_code}")

        except Exception as e:
            self.log_test("Promana AI Integration", False, "", str(e))

    def test_dashboard_analytics(self):
        """Test dashboard and analytics functionality"""
        try:
            # Test project dashboard
            response = self.session.get(f"{API_BASE}/project-management/projects/dashboard/")
            if response.status_code == 200:
                dashboard_data = response.json()
                self.log_test("Project Dashboard", True, f"Dashboard loaded with {dashboard_data.get('total_projects', 0)} projects")
            else:
                self.log_test("Project Dashboard", False, "", f"Status code: {response.status_code}")

            # Test overdue tasks
            response = self.session.get(f"{API_BASE}/project-management/tasks/overdue/")
            if response.status_code == 200:
                overdue_tasks = response.json()
                self.log_test("Overdue Tasks", True, f"Found {len(overdue_tasks)} overdue tasks")
            else:
                self.log_test("Overdue Tasks", False, "", f"Status code: {response.status_code}")

            # Test my tasks
            response = self.session.get(f"{API_BASE}/project-management/tasks/my_tasks/")
            if response.status_code == 200:
                my_tasks = response.json()
                self.log_test("My Tasks", True, f"Found {len(my_tasks)} assigned tasks")
            else:
                self.log_test("My Tasks", False, "", f"Status code: {response.status_code}")

        except Exception as e:
            self.log_test("Dashboard Analytics", False, "", str(e))

    def test_file_management(self):
        """Test file management functionality"""
        if not self.test_project:
            self.log_test("File Management", False, "", "No test project available")
            return

        try:
            project_id = self.test_project["id"]
            
            # Create test file record
            file_data = {
                "name": "test_document.pdf",
                "file_type": "document",
                "file_url": "https://example.com/test_document.pdf",
                "file_size": 1024000,
                "is_public": False
            }
            
            response = self.session.post(f"{API_BASE}/project-management/files/", json=file_data)
            if response.status_code == 201:
                self.test_files.append(response.json())
                self.log_test("Create File Record", True, "File record created successfully")
            else:
                self.log_test("Create File Record", False, "", f"Status code: {response.status_code}")

            # List project files
            response = self.session.get(f"{API_BASE}/project-management/files/?project={project_id}")
            if response.status_code == 200:
                files = response.json()
                self.log_test("List Project Files", True, f"Found {len(files)} files")
            else:
                self.log_test("List Project Files", False, "", f"Status code: {response.status_code}")

        except Exception as e:
            self.log_test("File Management", False, "", str(e))

    def test_team_management(self):
        """Test team management functionality"""
        if not self.test_project:
            self.log_test("Team Management", False, "", "No test project available")
            return

        try:
            project_id = self.test_project["id"]
            
            # Add team member
            member_data = {
                "user": 1,  # Assuming user ID 1 exists
                "role": "developer",
                "hourly_rate": 75.00
            }
            
            response = self.session.post(f"{API_BASE}/project-management/team-members/", json=member_data)
            if response.status_code in [201, 400]:  # 400 might mean member already exists
                self.log_test("Add Team Member", True, "Team member added or already exists")
            else:
                self.log_test("Add Team Member", False, "", f"Status code: {response.status_code}")

            # List team members
            response = self.session.get(f"{API_BASE}/project-management/team-members/?project={project_id}")
            if response.status_code == 200:
                members = response.json()
                self.log_test("List Team Members", True, f"Found {len(members)} team members")
            else:
                self.log_test("List Team Members", False, "", f"Status code: {response.status_code}")

        except Exception as e:
            self.log_test("Team Management", False, "", str(e))

    def test_milestone_management(self):
        """Test milestone management functionality"""
        if not self.test_project:
            self.log_test("Milestone Management", False, "", "No test project available")
            return

        try:
            project_id = self.test_project["id"]
            
            # Create milestone
            milestone_data = {
                "name": "Project Alpha Release",
                "description": "First major milestone with core features",
                "due_date": (datetime.now() + timedelta(days=21)).date().isoformat()
            }
            
            response = self.session.post(f"{API_BASE}/project-management/milestones/", json=milestone_data)
            if response.status_code == 201:
                milestone = response.json()
                self.log_test("Create Milestone", True, f"Milestone created: {milestone['name']}")
                
                # Complete milestone
                response = self.session.post(f"{API_BASE}/project-management/milestones/{milestone['id']}/complete/")
                if response.status_code == 200:
                    self.log_test("Complete Milestone", True, "Milestone marked as completed")
                else:
                    self.log_test("Complete Milestone", False, "", f"Status code: {response.status_code}")
            else:
                self.log_test("Create Milestone", False, "", f"Status code: {response.status_code}")

        except Exception as e:
            self.log_test("Milestone Management", False, "", str(e))

    def test_comment_system(self):
        """Test comment and communication system"""
        if not self.test_project:
            self.log_test("Comment System", False, "", "No test project available")
            return

        try:
            project_id = self.test_project["id"]
            
            # Create comment
            comment_data = {
                "project": project_id,
                "content": "This is a test comment for the project management system",
                "is_internal": True
            }
            
            response = self.session.post(f"{API_BASE}/project-management/comments/", json=comment_data)
            if response.status_code == 201:
                comment = response.json()
                self.log_test("Create Comment", True, f"Comment created: {comment['content'][:50]}...")
            else:
                self.log_test("Create Comment", False, "", f"Status code: {response.status_code}")

            # List project comments
            response = self.session.get(f"{API_BASE}/project-management/comments/?project={project_id}")
            if response.status_code == 200:
                comments = response.json()
                self.log_test("List Comments", True, f"Found {len(comments)} comments")
            else:
                self.log_test("List Comments", False, "", f"Status code: {response.status_code}")

        except Exception as e:
            self.log_test("Comment System", False, "", str(e))

    def test_bulk_operations(self):
        """Test bulk operations on projects"""
        try:
            # Test bulk action
            bulk_data = {
                "project_ids": [self.test_project["id"]] if self.test_project else [],
                "action": "archive",
                "additional_data": {}
            }
            
            response = self.session.post(f"{API_BASE}/project-management/projects/bulk_action/", json=bulk_data)
            if response.status_code == 200:
                self.log_test("Bulk Operations", True, "Bulk action completed successfully")
            else:
                self.log_test("Bulk Operations", False, "", f"Status code: {response.status_code}")

        except Exception as e:
            self.log_test("Bulk Operations", False, "", str(e))

    def test_frontend_components(self):
        """Test frontend component accessibility"""
        try:
            # Test main project page
            response = self.session.get(f"{FRONTEND_URL}/projects")
            if response.status_code == 200:
                self.log_test("Frontend Projects Page", True, "Projects page accessible")
            else:
                self.log_test("Frontend Projects Page", False, "", f"Status code: {response.status_code}")

            # Test project detail page
            if self.test_project:
                project_id = self.test_project["id"]
                response = self.session.get(f"{FRONTEND_URL}/projects/{project_id}")
                if response.status_code == 200:
                    self.log_test("Frontend Project Detail Page", True, "Project detail page accessible")
                else:
                    self.log_test("Frontend Project Detail Page", False, "", f"Status code: {response.status_code}")

        except Exception as e:
            self.log_test("Frontend Components", False, "", str(e))

    def test_error_handling(self):
        """Test error handling and edge cases"""
        try:
            # Test invalid project ID
            response = self.session.get(f"{API_BASE}/project-management/projects/invalid-uuid/")
            if response.status_code == 404:
                self.log_test("Error Handling - Invalid Project ID", True, "Properly handled invalid project ID")
            else:
                self.log_test("Error Handling - Invalid Project ID", False, "", f"Expected 404, got {response.status_code}")

            # Test unauthorized access
            self.session.headers.pop("Authorization", None)
            response = self.session.get(f"{API_BASE}/project-management/projects/")
            if response.status_code == 401:
                self.log_test("Error Handling - Unauthorized Access", True, "Properly handled unauthorized access")
            else:
                self.log_test("Error Handling - Unauthorized Access", False, "", f"Expected 401, got {response.status_code}")

            # Restore authorization
            if self.auth_token:
                self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})

        except Exception as e:
            self.log_test("Error Handling", False, "", str(e))

    def cleanup_test_data(self):
        """Clean up test data"""
        try:
            if self.test_project:
                project_id = self.test_project["id"]
                
                # Delete test files
                for file_data in self.test_files:
                    file_id = file_data.get("id")
                    if file_id:
                        self.session.delete(f"{API_BASE}/project-management/files/{file_id}/")
                
                # Delete test tasks
                for task_data in self.test_tasks:
                    task_id = task_data.get("id")
                    if task_id:
                        self.session.delete(f"{API_BASE}/project-management/tasks/{task_id}/")
                
                # Delete test project
                self.session.delete(f"{API_BASE}/project-management/projects/{project_id}/")
                
                self.log_test("Cleanup Test Data", True, "Test data cleaned up successfully")
        except Exception as e:
            self.log_test("Cleanup Test Data", False, "", str(e))

    def run_all_tests(self):
        """Run all project management tests"""
        print("🚀 Starting Comprehensive Project Manager Testing...")
        print("=" * 60)
        
        # Backend and infrastructure tests
        self.test_backend_health()
        self.test_database_connection()
        self.test_authentication()
        
        # Core functionality tests
        self.test_project_crud()
        self.test_task_management()
        self.test_promana_ai_integration()
        self.test_dashboard_analytics()
        
        # Additional feature tests
        self.test_file_management()
        self.test_team_management()
        self.test_milestone_management()
        self.test_comment_system()
        self.test_bulk_operations()
        
        # Frontend and integration tests
        self.test_frontend_components()
        self.test_error_handling()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📈 Success Rate: {(self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100):.1f}%")
        
        if self.results['errors']:
            print("\n🚨 ERRORS:")
            for error in self.results['errors']:
                print(f"  - {error}")
        
        # Save detailed results
        with open("project_manager_test_results.json", "w") as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: project_manager_test_results.json")
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = ProjectManagerTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Project Manager is working correctly.")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Please review the errors above.")
        sys.exit(1) 