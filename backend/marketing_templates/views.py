from rest_framework import viewsets, permissions, status
from core.permissions import DigiSolAdminOrAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.db.models import Q

from .models import TemplateCategory, MarketingTemplate
from .serializers import (
    TemplateCategorySerializer, 
    MarketingTemplateSerializer,
    MarketingTemplateListSerializer
)


class TemplateCategoryFilter(filters.FilterSet):
    """Filter for TemplateCategory"""
    name = filters.CharFilter(lookup_expr='icontains')
    is_global = filters.BooleanFilter()
    
    class Meta:
        model = TemplateCategory
        fields = ['name', 'is_global']


class MarketingTemplateFilter(filters.FilterSet):
    """Filter for MarketingTemplate"""
    name = filters.CharFilter(lookup_expr='icontains')
    template_type = filters.CharFilter()
    category = filters.UUIDFilter()
    is_global = filters.BooleanFilter()
    created_by = filters.UUIDFilter()
    
    class Meta:
        model = MarketingTemplate
        fields = ['name', 'template_type', 'category', 'is_global', 'created_by']


class TemplateCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for TemplateCategory model"""
    
    serializer_class = TemplateCategorySerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    filterset_class = TemplateCategoryFilter
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['name']
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def get_queryset(self):
        """Return categories for current tenant plus global categories"""
        user = self.request.user
        
        # Superusers can see all categories
        if user.is_superuser:
            return TemplateCategory.objects.all()
        
        # Regular users see their tenant's categories plus global ones
        return TemplateCategory.objects.filter(
            Q(tenant=user.tenant) | Q(tenant__isnull=True)
        ).distinct()

    def perform_create(self, serializer):
        """Set tenant and validate permissions for global categories"""
        user = self.request.user
        
        # Only superusers can create global categories
        if serializer.validated_data.get('is_global', False):
            if not user.is_superuser:
                raise permissions.PermissionDenied("Only superusers can create global categories")
            serializer.save(tenant=None)
        else:
            serializer.save(tenant=user.tenant)

    def perform_update(self, serializer):
        """Validate permissions for updating global categories"""
        user = self.request.user
        instance = self.get_object()
        
        # Only superusers can update global categories
        if instance.is_global and not user.is_superuser:
            raise permissions.PermissionDenied("Only superusers can update global categories")
        
        serializer.save()

    def perform_destroy(self, instance):
        """Validate permissions for deleting global categories"""
        user = self.request.user
        
        # Only superusers can delete global categories
        if instance.is_global and not user.is_superuser:
            raise permissions.PermissionDenied("Only superusers can delete global categories")
        
        instance.delete()


class MarketingTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for MarketingTemplate model"""
    
    permission_classes = [DigiSolAdminOrAuthenticated]
    filterset_class = MarketingTemplateFilter
    search_fields = ['name', 'content_json']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    def get_serializer_class(self):
        """Use different serializers for list and detail views"""
        if self.action == 'list':
            return MarketingTemplateListSerializer
        return MarketingTemplateSerializer

    def get_queryset(self):
        """Return templates for current tenant plus global templates"""
        user = self.request.user
        
        # Superusers can see all templates
        if user.is_superuser:
            return MarketingTemplate.objects.select_related('category', 'created_by').all()
        
        # Regular users see their tenant's templates plus global ones
        return MarketingTemplate.objects.select_related('category', 'created_by').filter(
            Q(tenant=user.tenant) | Q(tenant__isnull=True)
        ).distinct()

    def perform_create(self, serializer):
        """Set tenant and validate permissions for global templates"""
        user = self.request.user
        
        # Only superusers can create global templates
        if serializer.validated_data.get('is_global', False):
            if not user.is_superuser:
                raise permissions.PermissionDenied("Only superusers can create global templates")
            serializer.save(tenant=None, created_by=user)
        else:
            serializer.save(tenant=user.tenant, created_by=user)

    def perform_update(self, serializer):
        """Validate permissions for updating global templates"""
        user = self.request.user
        instance = self.get_object()
        
        # Only superusers can update global templates
        if instance.is_global and not user.is_superuser:
            raise permissions.PermissionDenied("Only superusers can update global templates")
        
        serializer.save()

    def perform_destroy(self, instance):
        """Validate permissions for deleting global templates"""
        user = self.request.user
        
        # Only superusers can delete global templates
        if instance.is_global and not user.is_superuser:
            raise permissions.PermissionDenied("Only superusers can delete global templates")
        
        instance.delete()

    @action(detail=False, methods=['get'])
    def template_types(self, request):
        """Get available template types"""
        return Response({
            'template_types': MarketingTemplate.TEMPLATE_TYPE_CHOICES
        })

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get available categories for current tenant"""
        user = request.user
        categories = TemplateCategory.objects.filter(
            Q(tenant=user.tenant) | Q(tenant__isnull=True)
        ).distinct()
        
        serializer = TemplateCategorySerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a template"""
        template = self.get_object()
        user = request.user
        
        # Create a copy with a new name
        new_name = f"{template.name} (Copy)"
        counter = 1
        while MarketingTemplate.objects.filter(name=new_name, tenant=user.tenant).exists():
            new_name = f"{template.name} (Copy {counter})"
            counter += 1
        
        new_template = MarketingTemplate.objects.create(
            tenant=user.tenant,
            category=template.category,
            name=new_name,
            template_type=template.template_type,
            content_json=template.content_json,
            preview_image_url=template.preview_image_url,
            is_global=False,  # Duplicates are always tenant-specific
            created_by=user
        )
        
        serializer = self.get_serializer(new_template)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
