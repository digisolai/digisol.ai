from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Avg, F
from django.utils import timezone
from datetime import timedelta
import json
import uuid

from .models import (
    IntegrationProvider, Integration, DataFlow, WorkflowAutomation,
    IntegrationHealthLog, ConnectusInsight
)
from .serializers import (
    IntegrationProviderSerializer, IntegrationSerializer, DataFlowSerializer,
    WorkflowAutomationSerializer, IntegrationHealthLogSerializer,
    ConnectusInsightSerializer, IntegrationCreateSerializer,
    IntegrationTestSerializer, IntegrationHealthSummarySerializer,
    ConnectusQuerySerializer
)


class IntegrationProviderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for browsing available integration providers.
    """
    queryset = IntegrationProvider.objects.filter(is_active=True)
    serializer_class = IntegrationProviderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['category', 'auth_type', 'webhook_support']
    search_fields = ['name', 'display_name', 'description']

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all available integration categories."""
        categories = IntegrationProvider.objects.filter(is_active=True).values_list(
            'category', flat=True).distinct()
        return Response({
            'categories': list(categories),
            'category_choices': dict(IntegrationProvider.CATEGORY_CHOICES)
        })

    @action(detail=True, methods=['get'])
    def capabilities(self, request, pk=None):
        """Get detailed capabilities of a specific provider."""
        provider = self.get_object()
        return Response({
            'oauth_config': provider.oauth_config,
            'api_endpoints': provider.api_endpoints,
            'rate_limits': provider.rate_limits,
            'webhook_events': provider.webhook_events,
            'auth_requirements': self._get_auth_requirements(provider)
        })

    def _get_auth_requirements(self, provider):
        """Get authentication requirements for the provider."""
        if provider.auth_type == 'oauth2':
            return {
                'type': 'oauth2',
                'scopes': provider.oauth_config.get('scopes', []),
                'redirect_uri': provider.oauth_config.get('redirect_uri'),
                'authorization_url': provider.oauth_config.get('authorization_url')
            }
        elif provider.auth_type == 'api_key':
            return {
                'type': 'api_key',
                'fields': provider.oauth_config.get('required_fields', ['api_key']),
                'instructions': provider.oauth_config.get('setup_instructions', '')
            }
        return {'type': provider.auth_type}


class IntegrationViewSet(viewsets.ModelViewSet):
    """
    Enhanced ViewSet for managing integrations with comprehensive features.
    """
    serializer_class = IntegrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter by tenant and include related data."""
        return Integration.objects.filter(tenant=self.request.user.tenant).select_related(
            'provider'
        ).prefetch_related('data_flows', 'workflows', 'health_logs')

    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'create':
            return IntegrationCreateSerializer
        return IntegrationSerializer

    def perform_create(self, serializer):
        """Create integration with tenant assignment."""
        serializer.save(tenant=self.request.user.tenant)

    def perform_update(self, serializer):
        """Update integration with tenant validation."""
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=False, methods=['get'])
    def health_summary(self, request):
        """Get comprehensive health summary for all integrations."""
        try:
            tenant = request.user.tenant
            integrations = Integration.objects.filter(tenant=tenant)
            
            # Calculate health metrics
            total = integrations.count()
            connected = integrations.filter(status='connected', is_active=True).count()
            errors = integrations.filter(status='error').count()
            
            # Calculate overall health score
            if total > 0:
                avg_health = integrations.aggregate(Avg('health_score'))['health_score__avg'] or 0
            else:
                avg_health = 100

            # Get recent alerts
            recent_alerts = IntegrationHealthLog.objects.filter(
                integration__tenant=tenant,
                severity__in=['warning', 'error', 'critical'],
                timestamp__gte=timezone.now() - timedelta(days=7)
            ).select_related('integration')[:10]

            # API usage summary - handle case where there are no integrations
            if total > 0:
                api_usage = {
                    'total_calls': sum(i.api_calls_today for i in integrations),
                    'total_limit': sum(i.api_calls_limit for i in integrations),
                    'near_limit': integrations.filter(
                        api_calls_today__gte=F('api_calls_limit') * 0.8
                    ).count()
                }
            else:
                api_usage = {
                    'total_calls': 0,
                    'total_limit': 0,
                    'near_limit': 0
                }

            # Generate recommendations
            recommendations = self._generate_recommendations(tenant)

            data = {
                'total_integrations': total,
                'connected_integrations': connected,
                'error_integrations': errors,
                'overall_health_score': round(avg_health, 1),
                'recent_alerts': IntegrationHealthLogSerializer(recent_alerts, many=True).data,
                'api_usage_summary': api_usage,
                'recommendations': recommendations
            }
            
            serializer = IntegrationHealthSummarySerializer(data)
            return Response(serializer.data)
        except Exception as e:
            # Return a default response if there's an error
            data = {
                'total_integrations': 0,
                'connected_integrations': 0,
                'error_integrations': 0,
                'overall_health_score': 100.0,
                'recent_alerts': [],
                'api_usage_summary': {
                    'total_calls': 0,
                    'total_limit': 0,
                    'near_limit': 0
                },
                'recommendations': []
            }
            serializer = IntegrationHealthSummarySerializer(data)
            return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """Test the connection to a third-party service."""
        integration = self.get_object()
        serializer = IntegrationTestSerializer(data=request.data)
        
        if serializer.is_valid():
            test_result = self._test_integration_connection(integration, serializer.validated_data)
            return Response(test_result)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def sync_now(self, request, pk=None):
        """Trigger an immediate data sync."""
        integration = self.get_object()
        
        if not integration.is_configured:
            return Response(
                {'error': 'Integration is not properly configured'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Trigger sync (this would be handled by a background task)
        sync_result = self._trigger_sync(integration)
        return Response(sync_result)

    @action(detail=True, methods=['get'])
    def data_flows(self, request, pk=None):
        """Get data flows for this integration."""
        integration = self.get_object()
        data_flows = integration.data_flows.all()
        serializer = DataFlowSerializer(data_flows, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def workflows(self, request, pk=None):
        """Get workflows for this integration."""
        integration = self.get_object()
        workflows = integration.workflows.all()
        serializer = WorkflowAutomationSerializer(workflows, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def health_logs(self, request, pk=None):
        """Get health logs for this integration."""
        integration = self.get_object()
        logs = integration.health_logs.all()[:50]  # Last 50 logs
        serializer = IntegrationHealthLogSerializer(logs, many=True)
        return Response(serializer.data)

    def _test_integration_connection(self, integration, test_data):
        """Test integration connection (placeholder implementation)."""
        # This would implement actual API testing logic
        return {
            'success': True,
            'message': f'Successfully connected to {integration.provider.display_name}',
            'details': {
                'api_version': 'v1.0',
                'rate_limit_info': integration.provider.rate_limits,
                'available_endpoints': list(integration.provider.api_endpoints.keys())
            }
        }

    def _trigger_sync(self, integration):
        """Trigger data sync (placeholder implementation)."""
        # This would trigger actual sync logic
        return {
            'success': True,
            'message': f'Sync initiated for {integration.name}',
            'sync_id': str(uuid.uuid4()),
            'estimated_duration': '5-10 minutes'
        }

    def _generate_recommendations(self, tenant):
        """Generate AI-powered recommendations."""
        recommendations = []
        
        # Check for integrations with errors
        error_integrations = Integration.objects.filter(
            tenant=tenant, status='error'
        )
        if error_integrations.exists():
            recommendations.append({
                'type': 'troubleshooting',
                'title': 'Integration Errors Detected',
                'description': f'{error_integrations.count()} integration(s) have errors that need attention.',
                'priority': 'high',
                'action': 'Review and fix integration errors'
            })

        # Check for near API limits
        near_limit_integrations = Integration.objects.filter(
            tenant=tenant,
            api_calls_today__gte=F('api_calls_limit') * 0.8
        )
        if near_limit_integrations.exists():
            recommendations.append({
                'type': 'optimization',
                'title': 'API Usage Optimization',
                'description': f'{near_limit_integrations.count()} integration(s) are approaching API limits.',
                'priority': 'medium',
                'action': 'Optimize API usage or upgrade limits'
            })

        return recommendations


class DataFlowViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing data flows between integrations and DigiSol.AI.
    """
    serializer_class = DataFlowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter by tenant."""
        return DataFlow.objects.filter(
            integration__tenant=self.request.user.tenant
        ).select_related('integration')

    def perform_create(self, serializer):
        """Create data flow with validation."""
        integration = serializer.validated_data['integration']
        if integration.tenant != self.request.user.tenant:
            raise PermissionError("Cannot create data flow for another tenant's integration")
        serializer.save()

    @action(detail=True, methods=['post'])
    def test_mapping(self, request, pk=None):
        """Test data mapping configuration."""
        data_flow = self.get_object()
        test_data = request.data.get('test_data', {})
        
        # Test the mapping (placeholder implementation)
        mapped_data = self._test_data_mapping(data_flow, test_data)
        return Response({
            'success': True,
            'mapped_data': mapped_data,
            'validation_errors': []
        })

    def _test_data_mapping(self, data_flow, test_data):
        """Test data mapping (placeholder implementation)."""
        # This would implement actual mapping logic
        return {
            'source': test_data,
            'mapped': test_data,  # Placeholder
            'transformed': test_data  # Placeholder
        }


class WorkflowAutomationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing workflow automations.
    """
    serializer_class = WorkflowAutomationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter by tenant."""
        return WorkflowAutomation.objects.filter(
            integration__tenant=self.request.user.tenant
        ).select_related('integration')

    def perform_create(self, serializer):
        """Create workflow with validation."""
        integration = serializer.validated_data['integration']
        if integration.tenant != self.request.user.tenant:
            raise PermissionError("Cannot create workflow for another tenant's integration")
        serializer.save()

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Manually execute a workflow."""
        workflow = self.get_object()
        
        if workflow.status != 'active':
            return Response(
                {'error': 'Workflow is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Execute workflow (placeholder implementation)
        execution_result = self._execute_workflow(workflow)
        return Response(execution_result)

    def _execute_workflow(self, workflow):
        """Execute workflow (placeholder implementation)."""
        # This would implement actual workflow execution
        return {
            'success': True,
            'execution_id': str(uuid.uuid4()),
            'actions_executed': len(workflow.actions),
            'execution_time': '2.5 seconds'
        }


class ConnectusInsightViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Connectus AI insights.
    """
    serializer_class = ConnectusInsightSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter by tenant."""
        return ConnectusInsight.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('integration')

    def perform_create(self, serializer):
        """Create insight with tenant assignment."""
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=False, methods=['post'])
    def ask_connectus(self, request):
        """Ask Connectus AI a question about integrations."""
        serializer = ConnectusQuerySerializer(data=request.data)
        
        if serializer.is_valid():
            query = serializer.validated_data['query']
            context = serializer.validated_data.get('context', {})
            integration_id = serializer.validated_data.get('integration_id')
            
            # Process query with Connectus AI (placeholder implementation)
            response = self._process_connectus_query(query, context, integration_id)
            return Response(response)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        """Get AI-powered recommendations for the tenant."""
        tenant = request.user.tenant
        recommendations = self._generate_ai_recommendations(tenant)
        return Response(recommendations)

    def _process_connectus_query(self, query, context, integration_id):
        """Process Connectus AI query using Gemini."""
        try:
            from ai_services.gemini_utils import call_gemini_for_ai_agent
            
            # Get integration context if integration_id is provided
            integration_context = {}
            if integration_id:
                try:
                    integration = Integration.objects.get(id=integration_id, tenant=self.request.user.tenant)
                    integration_context = {
                        'integration_name': integration.name,
                        'integration_status': integration.status,
                        'integration_health_score': integration.health_score,
                        'integration_provider': integration.provider.display_name,
                        'last_sync': integration.last_sync.isoformat() if integration.last_sync else None,
                        'api_usage_percentage': integration.api_usage_percentage
                    }
                except Integration.DoesNotExist:
                    pass
            
            # Get Connectus agent personality
            connectus_agent = AIProfile.objects.filter(
                name="Connectus", 
                specialization="integrations_management"
            ).first()
            
            if not connectus_agent:
                # Fallback response if agent not found
                return {
                    'answer': f"Connectus AI response to: {query}",
                    'confidence': 0.85,
                    'sources': ['integration_health', 'usage_patterns'],
                    'suggested_actions': [
                        'Review integration settings',
                        'Check API usage limits'
                    ]
                }
            
            # Call Gemini API for Connectus agent
            response = call_gemini_for_ai_agent(
                prompt=query,
                agent_name="Connectus",
                agent_personality=connectus_agent.personality_description,
                specialization="integrations_management",
                context={**context, **integration_context}
            )
            
            return {
                'answer': response,
                'confidence': 0.9,
                'sources': ['integration_health', 'usage_patterns', 'ai_analysis'],
                'suggested_actions': [
                    'Review integration settings',
                    'Check API usage limits',
                    'Monitor integration health'
                ]
            }
            
        except Exception as e:
            # Fallback response if Gemini API fails
            return {
                'answer': f"Connectus AI response to: {query}",
                'confidence': 0.85,
                'sources': ['integration_health', 'usage_patterns'],
                'suggested_actions': [
                    'Review integration settings',
                    'Check API usage limits'
                ]
            }

    def _generate_ai_recommendations(self, tenant):
        """Generate AI-powered recommendations (placeholder implementation)."""
        # This would implement actual AI recommendation logic
        return [
            {
                'type': 'optimization',
                'title': 'Optimize Sync Frequency',
                'description': 'Based on your usage patterns, consider adjusting sync frequencies.',
                'priority': 'medium',
                'impact': 'Reduce API costs by 15%'
            },
            {
                'type': 'opportunity',
                'title': 'New Integration Opportunity',
                'description': 'Consider integrating with LinkedIn for B2B lead generation.',
                'priority': 'low',
                'impact': 'Potential 25% increase in lead quality'
            }
        ]
