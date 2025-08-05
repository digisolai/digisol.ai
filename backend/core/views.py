from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from .models import (
    Tenant, Contact, Campaign, EmailTemplate, 
    AutomationWorkflow, BrandProfile, AutomationExecution, BrandAsset
)
from .serializers import (
    TenantSerializer, ContactSerializer, CampaignSerializer,
    EmailTemplateSerializer, AutomationWorkflowSerializer, BrandProfileSerializer,
    AutomationExecutionSerializer, BrandAssetSerializer, BrandAssetCreateSerializer,
    BrandAssetUpdateSerializer
)
from .tasks import start_workflow_execution, trigger_workflow_by_event
from ai_services.models import AIProfile, AIRecommendation
from ai_services.tasks import generate_campaign_insights_task
from django.db import models
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


@api_view(['GET'])
def health_check(request):
    """Simple health check endpoint for testing"""
    return Response({
        'status': 'healthy',
        'message': 'DigiSol.AI backend is running',
        'timestamp': timezone.now().isoformat()
    })

@csrf_exempt
def simple_health_check(request):
    """Simple health check without authentication"""
    return JsonResponse({
        'status': 'healthy',
        'message': 'DigiSol.AI backend is running',
        'timestamp': timezone.now().isoformat()
    })


class TenantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Tenant model.
    Provides CRUD operations for tenant management.
    """
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Override to filter by current user's tenant for non-superusers."""
        if self.request.user.is_superuser:
            return Tenant.objects.all()
        return Tenant.objects.filter(id=self.request.user.tenant.id)


class ContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Contact model.
    Provides CRUD operations for contact management.
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Override to filter contacts by user's tenant."""
        if self.request.user.is_superuser:
            return Contact.objects.all_tenants()
        # For regular users, filter by their tenant
        if self.request.user.tenant:
            return Contact.objects.filter(tenant=self.request.user.tenant)
        # If user has no tenant, return empty queryset
        return Contact.objects.none()
    
    def perform_create(self, serializer):
        """Set the tenant automatically on creation."""
        if self.request.user.is_superuser:
            # Superusers can create contacts for any tenant
            tenant = serializer.validated_data.get('tenant', self.request.user.tenant)
            serializer.save(tenant=tenant)
        else:
            # Check if user has a tenant assigned
            if not self.request.user.tenant:
                raise serializers.ValidationError(
                    "User must be assigned to a tenant to create contacts. "
                    "Please contact your administrator."
                )
            serializer.save(tenant=self.request.user.tenant)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search contacts by name, email, or company."""
        query = request.query_params.get('q', '')
        if query:
            queryset = self.get_queryset().filter(
                models.Q(first_name__icontains=query) |
                models.Q(last_name__icontains=query) |
                models.Q(email__icontains=query) |
                models.Q(company__icontains=query) |
                models.Q(job_title__icontains=query) |
                models.Q(notes__icontains=query)
            )
        else:
            queryset = self.get_queryset()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_contacted(self, request, pk=None):
        """Mark a contact as contacted."""
        contact = self.get_object()
        contact.mark_contacted()
        serializer = self.get_serializer(contact)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def qualify_lead(self, request, pk=None):
        """Mark a contact as a qualified lead."""
        contact = self.get_object()
        contact.qualify_lead()
        serializer = self.get_serializer(contact)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def convert_to_customer(self, request, pk=None):
        """Convert a contact to a customer."""
        contact = self.get_object()
        contact.convert_to_customer()
        serializer = self.get_serializer(contact)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_score(self, request, pk=None):
        """Update the lead score by adding points."""
        contact = self.get_object()
        points = request.data.get('points', 0)
        try:
            points = int(points)
        except (TypeError, ValueError):
            return Response(
                {'error': 'Points must be a valid integer'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        contact.update_lead_score(points)
        serializer = self.get_serializer(contact)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_tag(self, request, pk=None):
        """Add a tag to the contact."""
        contact = self.get_object()
        tag = request.data.get('tag', '').strip()
        if not tag:
            return Response(
                {'error': 'Tag is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        contact.add_tag(tag)
        serializer = self.get_serializer(contact)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def remove_tag(self, request, pk=None):
        """Remove a tag from the contact."""
        contact = self.get_object()
        tag = request.data.get('tag', '').strip()
        if not tag:
            return Response(
                {'error': 'Tag is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        contact.remove_tag(tag)
        serializer = self.get_serializer(contact)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get contacts filtered by lead status."""
        status_filter = request.query_params.get('status', '')
        queryset = self.get_queryset()
        
        if status_filter:
            queryset = queryset.filter(lead_status=status_filter)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_priority(self, request):
        """Get contacts filtered by priority."""
        priority_filter = request.query_params.get('priority', '')
        queryset = self.get_queryset()
        
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CampaignViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Campaign model.
    Provides CRUD operations for campaign management.
    """
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Override to filter campaigns by user's tenant."""
        if self.request.user.is_superuser:
            return Campaign.objects.all_tenants()
        # For regular users, filter by their tenant
        if self.request.user.tenant:
            return Campaign.objects.filter(tenant=self.request.user.tenant)
        # If user has no tenant, return empty queryset
        return Campaign.objects.none()
    
    def perform_create(self, serializer):
        """Set the tenant and creator automatically on creation."""
        if self.request.user.is_superuser:
            # Superusers can create campaigns for any tenant
            tenant = serializer.validated_data.get('tenant', self.request.user.tenant)
            serializer.save(
                tenant=tenant,
                created_by=self.request.user
            )
        else:
            # Check if user has a tenant assigned
            if not self.request.user.tenant:
                raise serializers.ValidationError(
                    "User must be assigned to a tenant to create campaigns. "
                    "Please contact your administrator."
                )
            serializer.save(
                tenant=self.request.user.tenant,
                created_by=self.request.user
            )
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a campaign."""
        campaign = self.get_object()
        campaign.status = 'active'
        campaign.save()
        serializer = self.get_serializer(campaign)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause a campaign."""
        campaign = self.get_object()
        campaign.status = 'paused'
        campaign.save()
        serializer = self.get_serializer(campaign)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark a campaign as completed."""
        campaign = self.get_object()
        campaign.status = 'completed'
        campaign.save()
        serializer = self.get_serializer(campaign)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='ai-insights')
    def ai_insights(self, request, pk=None):
        """Get AI-driven insights for a campaign."""
        try:
            # Fetch the campaign
            campaign = self.get_object()
            
            # Serialize the campaign to get performance data
            serializer = self.get_serializer(campaign)
            campaign_stats = serializer.data
            
            # Fetch the Catalyst AI Profile (campaign_optimization specialization, global)
            catalyst_ai_profile = AIProfile.objects.filter(
                specialization='campaign_optimization',
                tenant=None,  # Global AI profile
                is_active=True
            ).first()
            
            if not catalyst_ai_profile:
                return Response(
                    {'error': 'AI optimization service not available'}, 
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            # Check if recent recommendation exists (last 24 hours)
            recent_recommendation = AIRecommendation.objects.filter(
                campaign=campaign,
                generated_by_agent=catalyst_ai_profile,
                type='campaign_optimization',
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).first()
            
            if recent_recommendation:
                return Response({
                    'recommendation_id': str(recent_recommendation.id),
                    'recommendation_text': recent_recommendation.recommendation_text,
                    'created_at': recent_recommendation.created_at,
                    'status': 'existing'
                })
            
            # Check credit limits
            tenant = request.user.tenant
            if not tenant.can_generate_ai_plan():
                return Response(
                    {'error': 'Insufficient AI planning credits. Please upgrade your plan.'}, 
                    status=status.HTTP_402_PAYMENT_REQUIRED
                )
            
            # Deduct 1 credit
            tenant.ai_planning_requests_used_current_period += 1
            tenant.save(update_fields=['ai_planning_requests_used_current_period'])
            
            # Create a placeholder AIRecommendation for immediate response
            recommendation = AIRecommendation.objects.create(
                tenant=tenant,
                user=request.user,
                type='campaign_optimization',
                recommendation_text='AI insights are being generated...',
                context_data={'campaign_id': str(campaign.id), 'stats': campaign_stats},
                generated_by_agent=catalyst_ai_profile,
                campaign=campaign,
                is_actionable=False
            )
            
            # Dispatch the async task
            generate_campaign_insights_task.delay(
                campaign.id, 
                campaign_stats, 
                catalyst_ai_profile.id, 
                request.user.id
            )
            
            return Response({
                'recommendation_id': str(recommendation.id),
                'message': 'AI insights are being generated. Check back in a few moments.',
                'status': 'processing'
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate AI insights: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EmailTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for EmailTemplate model.
    Provides CRUD operations for email template management.
    """
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Override to filter email templates by user's tenant."""
        if self.request.user.is_superuser:
            return EmailTemplate.objects.all_tenants()
        # For regular users, filter by their tenant
        if self.request.user.tenant:
            return EmailTemplate.objects.filter(tenant=self.request.user.tenant)
        # If user has no tenant, return empty queryset
        return EmailTemplate.objects.none()
    
    def perform_create(self, serializer):
        """Set the tenant automatically on creation."""
        if self.request.user.is_superuser:
            # Superusers can create email templates for any tenant
            tenant = serializer.validated_data.get('tenant', self.request.user.tenant)
            serializer.save(tenant=tenant)
        else:
            # Check if user has a tenant assigned
            if not self.request.user.tenant:
                raise serializers.ValidationError(
                    "User must be assigned to a tenant to create email templates. "
                    "Please contact your administrator."
                )
            serializer.save(tenant=self.request.user.tenant)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search templates by name."""
        query = request.query_params.get('q', '')
        if query:
            queryset = self.get_queryset().filter(name__icontains=query)
        else:
            queryset = self.get_queryset()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AutomationWorkflowViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AutomationWorkflow model.
    Provides CRUD operations for automation workflow management.
    """
    queryset = AutomationWorkflow.objects.all()
    serializer_class = AutomationWorkflowSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Override to filter automation workflows by user's tenant."""
        if self.request.user.is_superuser:
            return AutomationWorkflow.objects.all_tenants()
        # For regular users, filter by their tenant
        if self.request.user.tenant:
            return AutomationWorkflow.objects.filter(tenant=self.request.user.tenant)
        # If user has no tenant, return empty queryset
        return AutomationWorkflow.objects.none()
    
    def perform_create(self, serializer):
        """Set the tenant automatically on creation."""
        if self.request.user.is_superuser:
            # Superusers can create automation workflows for any tenant
            tenant = serializer.validated_data.get('tenant', self.request.user.tenant)
            serializer.save(tenant=tenant)
        else:
            # Check if user has a tenant assigned
            if not self.request.user.tenant:
                raise serializers.ValidationError(
                    "User must be assigned to a tenant to create automation workflows. "
                    "Please contact your administrator."
                )
            serializer.save(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a workflow."""
        workflow = self.get_object()
        workflow.is_active = True
        workflow.save()
        serializer = self.get_serializer(workflow)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a workflow."""
        workflow = self.get_object()
        workflow.is_active = False
        workflow.save()
        serializer = self.get_serializer(workflow)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Manually start a workflow execution."""
        workflow = self.get_object()
        
        if not workflow.is_active:
            return Response(
                {'error': 'Workflow must be active to start execution'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get contact ID from request
        contact_id = request.data.get('contact_id')
        context_data = request.data.get('context_data', {})
        
        # Start workflow execution
        result = start_workflow_execution.delay(
            str(workflow.id),
            contact_id,
            context_data
        )
        
        return Response({
            'message': 'Workflow execution started',
            'task_id': result.id,
            'workflow_id': str(workflow.id)
        })
    
    @action(detail=False, methods=['post'])
    def trigger(self, request):
        """Generic endpoint to trigger workflows by events."""
        event_type = request.data.get('event_type')
        event_data = request.data.get('event_data', {})
        
        if not event_type:
            return Response(
                {'error': 'event_type is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Trigger workflow by event
        result = trigger_workflow_by_event.delay(
            event_type,
            event_data,
            str(request.user.tenant.id)
        )
        
        return Response({
            'message': f'Event {event_type} processed',
            'task_id': result.id
        })


class AutomationExecutionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AutomationExecution model.
    Provides CRUD operations for automation execution management.
    """
    queryset = AutomationExecution.objects.all()
    serializer_class = AutomationExecutionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """Set the workflow and tenant automatically on creation."""
        workflow = self.request.data.get('workflow')
        if workflow:
            serializer.save(workflow=workflow, tenant=self.request.user.tenant)
        else:
            return Response({'error': 'Workflow ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a workflow execution."""
        execution = self.get_object()
        if execution.status == 'pending':
            execution.status = 'running'
            execution.save()
            start_workflow_execution.delay(execution.id)
            serializer = self.get_serializer(execution)
            return Response(serializer.data)
        return Response({'error': 'Execution is not in a pending state'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def trigger(self, request, pk=None):
        """Trigger a workflow execution by event."""
        execution = self.get_object()
        if execution.status == 'pending':
            execution.status = 'running'
            execution.save()
            trigger_workflow_by_event.delay(execution.id, request.data.get('event_type'))
            serializer = self.get_serializer(execution)
            return Response(serializer.data)
        return Response({'error': 'Execution is not in a pending state'}, status=status.HTTP_400_BAD_REQUEST)


class BrandProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for BrandProfile model.
    Provides CRUD operations for brand profile management.
    Note: Each tenant has only one brand profile.
    """
    queryset = BrandProfile.objects.all()
    serializer_class = BrandProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch']  # Enable create
    
    def get_object(self):
        """Get the brand profile for the current tenant."""
        try:
            return BrandProfile.objects.get(tenant=self.request.user.tenant)
        except BrandProfile.DoesNotExist:
            return None
    
    def list(self, request, *args, **kwargs):
        """Override list to return single brand profile or empty response."""
        instance = self.get_object()
        if instance:
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        else:
            # Return 200 OK with None if no brand profile exists
            # This allows the frontend to gracefully switch to a "create" state
            return Response(None, status=status.HTTP_200_OK)
    
    def create(self, request, *args, **kwargs):
        """Create a new brand profile for the current tenant."""
        # Check if brand profile already exists
        existing_profile = self.get_object()
        if existing_profile:
            # Update existing profile
            serializer = self.get_serializer(existing_profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # Create new profile
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save(tenant=request.user.tenant)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_queryset(self):
        """Override to allow superusers to see all brand profiles across all tenants."""
        if self.request.user.is_superuser:
            return BrandProfile.objects.all()
        return super().get_queryset()
    
    def perform_create(self, serializer):
        """Set the tenant and last_updated_by automatically on creation."""
        if self.request.user.is_superuser:
            # Superusers can create brand profiles for any tenant
            tenant = serializer.validated_data.get('tenant', self.request.user.tenant)
            serializer.save(tenant=tenant, last_updated_by=self.request.user)
        else:
            serializer.save(tenant=self.request.user.tenant, last_updated_by=self.request.user)
    
    def perform_update(self, serializer):
        """Update the brand profile and set last_updated_by."""
        serializer.save(last_updated_by=self.request.user)

    @action(detail=False, methods=['post'])
    def upload_logo(self, request):
        """Upload a logo for the brand profile."""
        try:
            # Get the brand profile for the current tenant
            brand_profile = self.get_object()
            if not brand_profile:
                # Create a new brand profile if it doesn't exist
                brand_profile = BrandProfile.objects.create(tenant=request.user.tenant)
            
            # Handle logo upload
            logo_file = request.FILES.get('logo')
            if not logo_file:
                return Response(
                    {'error': 'No logo file provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save the logo file
            brand_profile.logo = logo_file
            brand_profile.save()
            
            serializer = self.get_serializer(brand_profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BrandAssetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for BrandAsset model.
    Provides CRUD operations for brand asset management.
    """
    queryset = BrandAsset.objects.all()
    serializer_class = BrandAssetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['asset_type', 'is_shared_with_clients', 'created_by']
    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Filter by tenant and provide additional context.
        Superusers can see all brand assets across all tenants.
        """
        if self.request.user.is_superuser:
            queryset = BrandAsset.objects.all()
        else:
            queryset = BrandAsset.objects.filter(tenant=self.request.user.tenant)
        
        # Add prefetch for related objects
        queryset = queryset.select_related(
            'created_by', 'original_image_request'
        )
        
        return queryset

    def get_serializer_class(self):
        """
        Use different serializers for different actions.
        """
        if self.action == 'create':
            return BrandAssetCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BrandAssetUpdateSerializer
        return BrandAssetSerializer

    def perform_create(self, serializer):
        """
        Set the tenant and created_by fields automatically.
        """
        if self.request.user.is_superuser:
            # Superusers can create brand assets for any tenant
            tenant = serializer.validated_data.get('tenant', self.request.user.tenant)
            serializer.save(
                tenant=tenant,
                created_by=self.request.user
            )
        else:
            serializer.save(
                tenant=self.request.user.tenant,
                created_by=self.request.user
            )

    @action(detail=False, methods=['get'])
    def ai_generated(self, request):
        """
        Get only AI-generated assets.
        """
        queryset = self.get_queryset().filter(original_image_request__isnull=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        Get assets filtered by type.
        """
        asset_type = request.query_params.get('type')
        if asset_type:
            queryset = self.get_queryset().filter(asset_type=asset_type)
        else:
            queryset = self.get_queryset()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def shared_with_clients(self, request):
        """
        Get assets that are shared with clients.
        """
        queryset = self.get_queryset().filter(is_shared_with_clients=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_share(self, request, pk=None):
        """
        Toggle the shared_with_clients status of an asset.
        """
        asset = self.get_object()
        asset.is_shared_with_clients = not asset.is_shared_with_clients
        asset.save()
        serializer = self.get_serializer(asset)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_tag(self, request, pk=None):
        """
        Add a tag to an asset.
        """
        asset = self.get_object()
        tag = request.data.get('tag')
        
        if not tag:
            return Response(
                {'error': 'Tag is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        asset.add_tag(tag)
        serializer = self.get_serializer(asset)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def remove_tag(self, request, pk=None):
        """
        Remove a tag from an asset.
        """
        asset = self.get_object()
        tag = request.data.get('tag')
        
        if not tag:
            return Response(
                {'error': 'Tag is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        asset.remove_tag(tag)
        serializer = self.get_serializer(asset)
        return Response(serializer.data)
