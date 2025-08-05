import uuid
from django.db import models
from django.core.validators import MinLengthValidator
from core.models import Tenant
from accounts.models import CustomUser
from core.managers import TenantAwareManager


class TemplateCategory(models.Model):
    """Categories for organizing marketing templates"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        Tenant, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Leave blank for global categories available to all tenants"
    )
    name = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(2)],
        help_text="Category name (e.g., 'Email Marketing', 'Social Media Ads')"
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        unique_together = ['name', 'tenant']
        verbose_name = "Template Category"
        verbose_name_plural = "Template Categories"
        ordering = ['name']

    def __str__(self):
        tenant_name = self.tenant.name if self.tenant else "Global"
        return f"{self.name} ({tenant_name})"

    @property
    def is_global(self):
        """Check if this is a global category available to all tenants"""
        return self.tenant is None


class MarketingTemplate(models.Model):
    """Marketing templates for various content types"""
    
    TEMPLATE_TYPE_CHOICES = [
        ('email', 'Email'),
        ('social', 'Social Post'),
        ('ad_creative', 'Ad Creative'),
        ('landing_page', 'Landing Page'),
        ('blog_post', 'Blog Post'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        Tenant, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Leave blank for global templates available to all tenants"
    )
    category = models.ForeignKey(
        TemplateCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='templates',
        help_text="Optional category for organizing templates"
    )
    name = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(3)],
        help_text="Template name (e.g., 'Welcome Series Email', 'Black Friday Facebook Ad')"
    )
    template_type = models.CharField(
        max_length=50,
        choices=TEMPLATE_TYPE_CHOICES,
        default='other',
        help_text="Type of marketing asset"
    )
    content_json = models.JSONField(
        default=dict,
        help_text="Structured content (HTML for email, text for social, etc.)"
    )
    preview_image_url = models.URLField(
        max_length=500, 
        null=True, 
        blank=True,
        help_text="URL to a preview image of the template"
    )
    is_global = models.BooleanField(
        default=False,
        help_text="If True, available to all tenants (requires tenant=None)"
    )
    created_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='created_templates'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        unique_together = ['name', 'tenant']
        verbose_name = "Marketing Template"
        verbose_name_plural = "Marketing Templates"
        ordering = ['-created_at']

    def __str__(self):
        tenant_name = self.tenant.name if self.tenant else "Global"
        return f"{self.name} ({self.get_template_type_display()}) - {tenant_name}"

    def clean(self):
        """Custom validation"""
        from django.core.exceptions import ValidationError
        
        # Ensure global templates have no tenant
        if self.is_global and self.tenant is not None:
            raise ValidationError("Global templates must have tenant=None")
        
        # Ensure non-global templates have a tenant
        if not self.is_global and self.tenant is None:
            raise ValidationError("Non-global templates must have a tenant")

    def save(self, *args, **kwargs):
        """Override save to ensure consistency"""
        self.clean()
        super().save(*args, **kwargs)

    @property
    def category_name(self):
        """Get category name for serialization"""
        return self.category.name if self.category else None
