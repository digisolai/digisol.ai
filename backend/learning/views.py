from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from core.permissions import DigiSolAdminOrAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Tutorial, TutorialSection, TutorialStep, UserTutorialProgress
from .serializers import (
    TutorialSerializer, TutorialSectionSerializer, TutorialStepSerializer,
    UserTutorialProgressSerializer, TutorialCreateSerializer,
    TutorialSectionCreateSerializer, TutorialStepCreateSerializer,
    TutorialProgressUpdateSerializer
)


class TutorialViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tutorials.
    Supports both global and tenant-specific tutorials.
    """
    queryset = Tutorial.objects.all()
    serializer_class = TutorialSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'order', 'created_at']
    ordering = ['order', 'title']

    def get_queryset(self):
        """
        Override to return tutorials for the current tenant and global tutorials.
        """
        user = self.request.user
        queryset = Tutorial.objects.filter(
            Q(tenant=user.tenant) | Q(tenant__isnull=True)  # Tenant-specific or global
        )
        
        # Filter by published status
        is_published = self.request.query_params.get('is_published', None)
        if is_published is not None:
            queryset = queryset.filter(is_published=is_published.lower() == 'true')
        
        return queryset

    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action in ['create', 'update', 'partial_update']:
            return TutorialCreateSerializer
        return TutorialSerializer

    def perform_create(self, serializer):
        """Override to automatically set the tenant if not provided."""
        if 'tenant' not in serializer.validated_data:
            serializer.save(tenant=self.request.user.tenant)
        else:
            serializer.save()

    def perform_update(self, serializer):
        """Override to ensure the tenant cannot be changed during updates."""
        if 'tenant' not in serializer.validated_data:
            serializer.save(tenant=self.request.user.tenant)
        else:
            serializer.save()

    @action(detail=False, methods=['get'])
    def published_tutorials(self, request):
        """
        Get only published tutorials for the current tenant and global ones.
        """
        queryset = self.get_queryset().filter(is_published=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def global_tutorials(self, request):
        """
        Get only global tutorials (available to all tenants).
        """
        queryset = Tutorial.objects.filter(tenant__isnull=True, is_published=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """
        Get the current user's progress for this tutorial.
        """
        tutorial = self.get_object()
        progress, created = UserTutorialProgress.objects.get_or_create(
            user=request.user,
            tutorial=tutorial
        )
        serializer = UserTutorialProgressSerializer(progress)
        return Response(serializer.data)


class TutorialSectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tutorial sections.
    """
    queryset = TutorialSection.objects.all()
    serializer_class = TutorialSectionSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'order', 'created_at']
    ordering = ['order', 'title']

    def get_queryset(self):
        """
        Override to ensure only sections for tutorials accessible to the current tenant are returned.
        """
        user = self.request.user
        return TutorialSection.objects.filter(
            tutorial__tenant=user.tenant
        ) | TutorialSection.objects.filter(
            tutorial__tenant__isnull=True  # Global tutorials
        )

    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action in ['create', 'update', 'partial_update']:
            return TutorialSectionCreateSerializer
        return TutorialSectionSerializer

    def perform_create(self, serializer):
        """Override to ensure the tutorial belongs to the current tenant."""
        tutorial = serializer.validated_data['tutorial']
        if tutorial.tenant and tutorial.tenant != self.request.user.tenant:
            raise permissions.PermissionDenied("You can only create sections for your own tutorials.")
        serializer.save()

    def perform_update(self, serializer):
        """Override to ensure the tutorial belongs to the current tenant."""
        tutorial = serializer.validated_data['tutorial']
        if tutorial.tenant and tutorial.tenant != self.request.user.tenant:
            raise permissions.PermissionDenied("You can only update sections for your own tutorials.")
        serializer.save()


class TutorialStepViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tutorial steps.
    """
    queryset = TutorialStep.objects.all()
    serializer_class = TutorialStepSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['title', 'order', 'created_at']
    ordering = ['order', 'title']

    def get_queryset(self):
        """
        Override to ensure only steps for tutorials accessible to the current tenant are returned.
        """
        user = self.request.user
        return TutorialStep.objects.filter(
            section__tutorial__tenant=user.tenant
        ) | TutorialStep.objects.filter(
            section__tutorial__tenant__isnull=True  # Global tutorials
        )

    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action in ['create', 'update', 'partial_update']:
            return TutorialStepCreateSerializer
        return TutorialStepSerializer

    def perform_create(self, serializer):
        """Override to ensure the section belongs to a tutorial accessible to the current tenant."""
        section = serializer.validated_data['section']
        tutorial = section.tutorial
        if tutorial.tenant and tutorial.tenant != self.request.user.tenant:
            raise permissions.PermissionDenied("You can only create steps for your own tutorials.")
        serializer.save()

    def perform_update(self, serializer):
        """Override to ensure the section belongs to a tutorial accessible to the current tenant."""
        section = serializer.validated_data['section']
        tutorial = section.tutorial
        if tutorial.tenant and tutorial.tenant != self.request.user.tenant:
            raise permissions.PermissionDenied("You can only update steps for your own tutorials.")
        serializer.save()

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """
        Mark this step as completed for the current user.
        """
        step = self.get_object()
        tutorial = step.tutorial
        
        # Get or create progress record
        progress, created = UserTutorialProgress.objects.get_or_create(
            user=request.user,
            tutorial=tutorial
        )
        
        # Mark the step as completed
        progress.mark_step_completed(step)
        
        serializer = UserTutorialProgressSerializer(progress)
        return Response(serializer.data)


class UserTutorialProgressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user tutorial progress.
    """
    queryset = UserTutorialProgress.objects.all()
    serializer_class = UserTutorialProgressSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tutorial__title']
    ordering_fields = ['started_at', 'completed_at', 'tutorial__title']
    ordering = ['-started_at']

    def get_queryset(self):
        """
        Override to ensure users can only see their own progress.
        """
        return UserTutorialProgress.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action in ['update', 'partial_update']:
            return TutorialProgressUpdateSerializer
        return UserTutorialProgressSerializer

    def perform_create(self, serializer):
        """Override to automatically set the user."""
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Override to ensure users can only update their own progress."""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """
        Get the current user's progress for all tutorials.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed_tutorials(self, request):
        """
        Get tutorials that the current user has completed.
        """
        queryset = self.get_queryset().filter(is_completed=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def in_progress_tutorials(self, request):
        """
        Get tutorials that the current user has started but not completed.
        """
        queryset = self.get_queryset().filter(is_completed=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """
        Mark a tutorial as completed for the current user.
        """
        progress = self.get_object()
        progress.is_completed = True
        from django.utils import timezone
        progress.completed_at = timezone.now()
        progress.save()
        
        serializer = self.get_serializer(progress)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reset_progress(self, request, pk=None):
        """
        Reset the user's progress for this tutorial.
        """
        progress = self.get_object()
        progress.reset_progress()
        
        serializer = self.get_serializer(progress)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete_step(self, request, pk=None):
        """
        Mark a specific step as completed for the current user.
        """
        progress = self.get_object()
        step_id = request.data.get('step_id')
        
        if not step_id:
            return Response(
                {'error': 'step_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            step = TutorialStep.objects.get(id=step_id)
            if step.tutorial != progress.tutorial:
                return Response(
                    {'error': 'Step does not belong to this tutorial'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            progress.mark_step_completed(step)
            serializer = self.get_serializer(progress)
            return Response(serializer.data)
            
        except TutorialStep.DoesNotExist:
            return Response(
                {'error': 'Step not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
