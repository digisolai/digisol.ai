from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class CustomUser(AbstractUser):
    """
    Custom User model for DigiSol.AI platform.
    Uses email as the primary login field with simplified user-centric approach.
    """
    
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('user', 'User'),
    ]
    
    # Override email field to make it required and unique
    email = models.EmailField(unique=True, blank=False, null=False)
    
    # Profile fields
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Role and permissions
    role = models.CharField(
        max_length=50, 
        choices=ROLE_CHOICES, 
        default='user'
    )
    
    # Team/Organization fields (optional)
    department = models.CharField(max_length=255, blank=True, null=True)
    job_title = models.CharField(max_length=255, blank=True, null=True)
    
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
    def is_admin(self):
        """Check if user is an admin."""
        return self.role == 'admin' or self.is_superuser
    
    @property
    def is_manager(self):
        """Check if user is a manager or admin."""
        return self.role in ['admin', 'manager'] or self.is_superuser
    
    @property
    def full_name(self):
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}".strip() or self.email
