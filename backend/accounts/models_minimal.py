from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Minimal Custom User model for authentication only.
    """
    
    ROLE_CHOICES = [
        ('tenant_admin', 'Tenant Admin'),
        ('marketer', 'Marketer'),
        ('viewer', 'Viewer'),
    ]
    
    # Override email field to make it required and unique
    email = models.EmailField(unique=True, blank=False, null=False)
    
    # Profile fields
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Role and permissions
    is_tenant_admin = models.BooleanField(default=False)
    role = models.CharField(
        max_length=50, 
        choices=ROLE_CHOICES, 
        default='viewer'
    )
    
    job_title = models.CharField(max_length=255, blank=True, null=True)
    is_hr_admin = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email as the primary login field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'custom_users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    @property
    def is_tenant_owner(self):
        """Check if user is a tenant admin."""
        return self.is_tenant_admin or self.role == 'tenant_admin'
    
    def get_full_name(self):
        """Return the full name of the user."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email
    
    def get_short_name(self):
        """Return the short name of the user."""
        return self.first_name or self.email