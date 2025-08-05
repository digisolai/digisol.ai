import uuid
from django.db import models
from core.models import Tenant
from core.managers import TenantAwareManager
from accounts.models import CustomUser


class Department(models.Model):
    """
    Department model for organizing users within a tenant.
    Each department belongs to a specific tenant and can have a department head.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    head = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='departments_headed'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'departments'
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        unique_together = ['name', 'tenant']  # Each department name unique per tenant

    def __str__(self):
        return f"{self.name} - {self.tenant.name}"

    @property
    def employee_count(self):
        """Return the number of employees in this department."""
        return self.users.count()

    @property
    def team_count(self):
        """Return the number of teams in this department."""
        return self.teams.count()


class Team(models.Model):
    """
    Team model for organizing users within departments.
    Each team belongs to a specific department and can have a team lead.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='teams')
    lead = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='teams_led'
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'teams'
        verbose_name = 'Team'
        verbose_name_plural = 'Teams'
        unique_together = ['name', 'department']  # Each team name unique per department

    def __str__(self):
        return f"{self.name} - {self.department.name} ({self.tenant.name})"

    @property
    def employee_count(self):
        """Return the number of employees in this team."""
        return self.users.count() 