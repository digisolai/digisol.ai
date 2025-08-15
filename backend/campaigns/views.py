from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Sum, Avg, Count
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
import json

from .models import (
    MarketingCampaign, CampaignStep, OptimizerInsight, 
    CampaignPerformance, CampaignAudience, CampaignTemplate
)
from .serializers import (
    MarketingCampaignSerializer, CampaignStepSerializer, OptimizerInsightSerializer,
    CampaignPerformanceSerializer, CampaignAudienceSerializer, CampaignTemplateSerializer,
    CampaignCreateSerializer, CampaignUpdateSerializer, StepCreateSerializer, StepUpdateSerializer,
    OptimizerInsightCreateSerializer, OptimizerInsightUpdateSerializer,
    CampaignPerformanceCreateSerializer, CampaignDashboardSerializer,
    OptimizerRecommendationSerializer, CampaignAnalyticsSerializer
)
from accounts.permissions import IsTenantUser as IsTenantMember
from ai_services.models import AIProfile


class MarketingCampaignViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing marketing campaigns with AI integration
    """
    permission_classes = []  # Temporarily remove authentication for testing
    serializer_class = MarketingCampaignSerializer
    
    def get_queryset(self):
        try:
            # Return all campaigns since we removed tenant model
            return MarketingCampaign.objects.all()
        except Exception:
            return MarketingCampaign.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CampaignCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CampaignUpdateSerializer
        return MarketingCampaignSerializer
    
    def perform_create(self, serializer):
        try:
            # Save campaign - the serializer will handle user assignment
            serializer.save()
        except Exception as e:
            raise Exception(f"Error creating campaign: {str(e)}")
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a campaign"""
        campaign = self.get_object()
        new_campaign = MarketingCampaign.objects.create(
            name=f"{campaign.name} (Copy)",
            description=campaign.description,
            campaign_type=campaign.campaign_type,
            objective=campaign.objective,
            status='Draft',
            target_audience_segment=campaign.target_audience_segment,
            audience_criteria=campaign.audience_criteria,
            budget=campaign.budget,
            target_roi=campaign.target_roi,
            created_by=request.user
        )
        
        # Duplicate steps
        for step in campaign.steps.all():
            CampaignStep.objects.create(
                campaign=new_campaign,
                step_type=step.step_type,
                name=step.name,
                description=step.description,
                order=step.order,
                config=step.config,
                content_data=step.content_data,
                metadata=step.metadata,
                is_enabled=step.is_enabled
            )
        
        serializer = self.get_serializer(new_campaign)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def choices(self, request):
        """Get available choices for campaign fields"""
        return Response({
            'campaign_type': MarketingCampaign.CAMPAIGN_TYPE_CHOICES,
            'objective': MarketingCampaign.OBJECTIVE_CHOICES,
            'status': MarketingCampaign.STATUS_CHOICES,
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get campaign statistics"""
        try:
            queryset = self.get_queryset()
            
            # Calculate basic stats
            total_campaigns = queryset.count()
            active_campaigns = queryset.filter(status='Active').count()
            total_budget = queryset.aggregate(Sum('budget'))['budget__sum'] or 0
            total_spent = queryset.aggregate(Sum('spent_budget'))['spent_budget__sum'] or 0
            
            # Calculate average ROI (simplified calculation)
            campaigns_with_roi = queryset.exclude(target_roi__isnull=True)
            average_roi = campaigns_with_roi.aggregate(Avg('target_roi'))['target_roi__avg'] or 0
            
            stats = {
                'total_campaigns': total_campaigns,
                'active_campaigns': active_campaigns,
                'total_budget': float(total_budget),
                'total_spent': float(total_spent),
                'average_roi': float(average_roi),
            }
            
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': f'Error calculating stats: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a campaign"""
        campaign = self.get_object()
        campaign.status = 'Active'
        campaign.save()
        serializer = self.get_serializer(campaign)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause a campaign"""
        campaign = self.get_object()
        campaign.status = 'Paused'
        campaign.save()
        serializer = self.get_serializer(campaign)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark campaign as completed"""
        campaign = self.get_object()
        campaign.status = 'Completed'
        campaign.save()
        serializer = self.get_serializer(campaign)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def save_as_template(self, request, pk=None):
        """Save campaign as template"""
        campaign = self.get_object()
        campaign.is_template = True
        campaign.template_category = request.data.get('category', 'general')
        campaign.save()
        serializer = self.get_serializer(campaign)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get campaign analytics"""
        campaign = self.get_object()
        
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get performance data
        performance_data = CampaignPerformance.objects.filter(
            campaign=campaign,
            date__range=[start_date, end_date]
        )
        
        # Calculate metrics
        total_impressions = performance_data.aggregate(Sum('impressions'))['impressions__sum'] or 0
        total_clicks = performance_data.aggregate(Sum('clicks'))['clicks__sum'] or 0
        total_conversions = performance_data.aggregate(Sum('conversions'))['conversions__sum'] or 0
        total_revenue = performance_data.aggregate(Sum('revenue'))['revenue__sum'] or 0
        total_cost = performance_data.aggregate(Sum('cost'))['cost__sum'] or 0
        
        # Calculate rates
        ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0
        roi = ((total_revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
        
        # Get trends data
        trends = []
        for i in range(days):
            date = end_date - timedelta(days=i)
            day_data = performance_data.filter(date=date).first()
            trends.append({
                'date': date.isoformat(),
                'impressions': day_data.impressions if day_data else 0,
                'clicks': day_data.clicks if day_data else 0,
                'conversions': day_data.conversions if day_data else 0,
                'revenue': float(day_data.revenue) if day_data else 0,
                'cost': float(day_data.cost) if day_data else 0,
            })
        
        # Get Catalyst insights
        insights = OptimizerInsight.objects.filter(
            campaign=campaign,
            is_dismissed=False,
            is_actioned=False
        ).order_by('-priority', '-created_at')[:10]
        
        analytics_data = {
            'campaign_id': str(campaign.id),
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            },
            'metrics': {
                'total_impressions': total_impressions,
                'total_clicks': total_clicks,
                'total_conversions': total_conversions,
                'total_revenue': float(total_revenue),
                'total_cost': float(total_cost),
                'ctr': round(ctr, 2),
                'conversion_rate': round(conversion_rate, 2),
                'roi': round(roi, 2)
            },
            'trends': trends,
            'comparisons': {
                'previous_period': {
                    'impressions_change': 0,
                    'clicks_change': 0,
                    'conversions_change': 0,
                    'revenue_change': 0
                }
            },
            'optimizer_insights': OptimizerInsightSerializer(insights, many=True).data,
            'recommendations': []
        }
        
        serializer = CampaignAnalyticsSerializer(analytics_data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def ask_catalyst(self, request, pk=None):
        """Ask Catalyst AI for insights about the campaign"""
        campaign = self.get_object()
        question = request.data.get('question', '')
        
        # This would integrate with your AI service
        # For now, we'll create a mock insight
        insight = OptimizerInsight.objects.create(
            campaign=campaign,
            insight_type='optimization_suggestion',
            title=f"Response to: {question[:50]}...",
            description=f"Catalyst analyzed your question: '{question}'. Here are the key insights...",
            recommendation="Consider implementing the suggested optimizations to improve performance.",
            priority='medium',
            confidence_score=85.0,
            context_data={'question': question, 'response_type': 'user_query'}
        )
        
        serializer = OptimizerInsightSerializer(insight)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CampaignStepViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing campaign steps
    """
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]
    serializer_class = CampaignStepSerializer
    
    def get_queryset(self):
        return CampaignStep.objects.filter(campaign__tenant=self.request.user.tenant)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StepCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return StepUpdateSerializer
        return CampaignStepSerializer
    
    def perform_create(self, serializer):
        campaign_id = self.request.data.get('campaign_id')
        campaign = get_object_or_404(MarketingCampaign, id=campaign_id, tenant=self.request.user.tenant)
        serializer.save(campaign=campaign)
    
    @action(detail=True, methods=['post'])
    def simulate(self, request, pk=None):
        """Simulate step execution"""
        step = self.get_object()
        
        # Mock simulation - in real implementation, this would execute the step
        step.execution_count += 1
        step.last_executed = timezone.now()
        step.save()
        
        return Response({
            'message': f'Step "{step.name}" simulated successfully',
            'execution_count': step.execution_count,
            'last_executed': step.last_executed
        })
    
    @action(detail=True, methods=['post'])
    def optimize_with_catalyst(self, request, pk=None):
        """Get Catalyst optimization suggestions for the step"""
        step = self.get_object()
        
        # Mock optimization suggestions
        suggestions = [
            {
                'type': 'content_optimization',
                'title': 'Optimize Subject Line',
                'description': 'Consider using more action-oriented language',
                'impact_score': 8.5,
                'confidence': 85.0
            },
            {
                'type': 'timing_optimization',
                'title': 'Adjust Send Time',
                'description': 'Send during peak engagement hours (10 AM - 2 PM)',
                'impact_score': 7.2,
                'confidence': 78.0
            }
        ]
        
        step.catalyst_suggestions = suggestions
        step.catalyst_optimized = True
        step.save()
        
        return Response({
            'message': 'Step optimized with Catalyst AI',
            'suggestions': suggestions
        })


class OptimizerInsightViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Catalyst AI insights
    """
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]
    serializer_class = OptimizerInsightSerializer
    
    def get_queryset(self):
        return OptimizerInsight.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OptimizerInsightCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OptimizerInsightUpdateSerializer
        return OptimizerInsightSerializer
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Dismiss an insight"""
        insight = self.get_object()
        insight.is_dismissed = True
        insight.save()
        serializer = self.get_serializer(insight)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def action(self, request, pk=None):
        """Mark insight as actioned"""
        insight = self.get_object()
        insight.is_actioned = True
        insight.action_taken = request.data.get('action_taken', '')
        insight.save()
        serializer = self.get_serializer(insight)
        return Response(serializer.data)


class CampaignPerformanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing campaign performance data
    """
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]
    serializer_class = CampaignPerformanceSerializer
    
    def get_queryset(self):
        return CampaignPerformance.objects.filter(campaign__tenant=self.request.user.tenant)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CampaignPerformanceCreateSerializer
        return CampaignPerformanceSerializer
    
    def perform_create(self, serializer):
        campaign_id = self.request.data.get('campaign_id')
        campaign = get_object_or_404(MarketingCampaign, id=campaign_id, tenant=self.request.user.tenant)
        serializer.save(campaign=campaign)


class CampaignAudienceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing campaign audiences
    """
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]
    serializer_class = CampaignAudienceSerializer
    
    def get_queryset(self):
        return CampaignAudience.objects.filter(tenant=self.request.user.tenant)
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def analyze_with_catalyst(self, request, pk=None):
        """Analyze audience with Catalyst AI"""
        audience = self.get_object()
        
        # Mock analysis
        analysis = {
            'engagement_potential': 8.5,
            'conversion_likelihood': 7.2,
            'recommendations': [
                'Consider targeting similar audiences',
                'Optimize content for this segment',
                'Test different messaging approaches'
            ]
        }
        
        audience.catalyst_score = 8.5
        audience.catalyst_recommendations = analysis['recommendations']
        audience.save()
        
        return Response({
            'message': 'Audience analyzed with Catalyst AI',
            'analysis': analysis
        })


class CampaignTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing campaign templates
    """
    permission_classes = [permissions.IsAuthenticated, IsTenantMember]
    serializer_class = CampaignTemplateSerializer
    
    def get_queryset(self):
        # Include both tenant-specific and global templates
        return CampaignTemplate.objects.filter(
            Q(tenant=self.request.user.tenant) | Q(tenant__isnull=True)
        )
    
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def use_template(self, request, pk=None):
        """Create a campaign from template"""
        template = self.get_object()
        campaign_name = request.data.get('name', f"{template.name} Campaign")
        
        # Create campaign from template
        campaign = MarketingCampaign.objects.create(
            tenant=request.user.tenant,
            name=campaign_name,
            description=template.description,
            campaign_type=template.campaign_data.get('campaign_type', 'email'),
            objective=template.campaign_data.get('objective', 'leads'),
            status='Draft',
            created_by=request.user
        )
        
        # Create steps from template
        for step_data in template.steps_data:
            CampaignStep.objects.create(
                campaign=campaign,
                step_type=step_data.get('step_type', 'Email'),
                name=step_data.get('name', 'New Step'),
                description=step_data.get('description', ''),
                order=step_data.get('order', 0),
                config=step_data.get('config', {}),
                content_data=step_data.get('content_data', {}),
                metadata=step_data.get('metadata', {}),
                is_enabled=step_data.get('is_enabled', True)
            )
        
        # Update template usage count
        template.usage_count += 1
        template.save()
        
        serializer = MarketingCampaignSerializer(campaign)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CampaignDashboardView(APIView):
    """
    API view for campaign dashboard data
    """
    permission_classes = []  # Temporarily remove authentication for testing
    
    def get(self, request):
        try:
            # For testing without authentication, use a default tenant
            if hasattr(request, 'user') and request.user.is_authenticated:
                tenant = request.user.tenant
                if not tenant:
                    return Response({
                        'error': 'User has no tenant assigned'
                    }, status=400)
            else:
                # Use the test tenant for unauthenticated requests
                from core.models import Tenant
                tenant = Tenant.objects.filter(name='Test Tenant').first()
                if not tenant:
                    return Response({
                        'error': 'No test tenant found'
                    }, status=400)
            
            # Get campaign statistics
            total_campaigns = MarketingCampaign.objects.filter(tenant=tenant).count()
            active_campaigns = MarketingCampaign.objects.filter(tenant=tenant, status='Active').count()
            
            # Get budget statistics with safe defaults
            try:
                budget_stats = MarketingCampaign.objects.filter(tenant=tenant).aggregate(
                    total_budget=Sum('budget'),
                    spent_budget=Sum('spent_budget')
                )
            except Exception:
                budget_stats = {'total_budget': 0, 'spent_budget': 0}
            
            # Get performance statistics with safe defaults
            try:
                performance_stats = CampaignPerformance.objects.filter(
                    campaign__tenant=tenant
                ).aggregate(
                    avg_roi=Avg('roi')
                )
            except Exception:
                performance_stats = {'avg_roi': 0}
            
            # Get Optimizer insights count
            try:
                insights_count = OptimizerInsight.objects.filter(
                    is_dismissed=False,
                    is_actioned=False
                ).count()
            except Exception:
                insights_count = 0
            
            # Get top performing campaigns
            try:
                top_campaigns = MarketingCampaign.objects.all().order_by('-optimizer_health_score')[:5]
            except Exception:
                top_campaigns = MarketingCampaign.objects.all()[:5]
            
            # Get recent insights
            try:
                recent_insights = OptimizerInsight.objects.all().order_by('-created_at')[:10]
            except Exception:
                recent_insights = []
            
            # Mock performance trends
            performance_trends = {
                'impressions': [1200, 1350, 1100, 1400, 1600, 1800],
                'clicks': [120, 135, 110, 140, 160, 180],
                'conversions': [12, 14, 11, 15, 18, 20],
                'dates': ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06']
            }
            
            dashboard_data = {
                'total_campaigns': total_campaigns,
                'active_campaigns': active_campaigns,
                'total_budget': budget_stats.get('total_budget', 0) or 0,
                'spent_budget': budget_stats.get('spent_budget', 0) or 0,
                'average_roi': performance_stats.get('avg_roi', 0) or 0,
                'optimizer_insights_count': insights_count,
                'performance_trends': performance_trends,
                'top_performing_campaigns': MarketingCampaignSerializer(top_campaigns, many=True).data,
                'recent_insights': OptimizerInsightSerializer(recent_insights, many=True).data
            }
            
            serializer = CampaignDashboardSerializer(dashboard_data)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({
                'error': f'Error loading dashboard data: {str(e)}'
            }, status=500)


class OptimizerRecommendationView(APIView):
    """
    API view for Optimizer AI recommendations
    """
    permission_classes = []  # Temporarily remove authentication for testing
    
    def get(self, request):
        # No tenant filtering needed since we removed tenant model
        
        # Mock recommendations - in real implementation, this would come from AI analysis
        recommendations = [
            {
                'recommendation_type': 'campaign_optimization',
                'title': 'Optimize Email Subject Lines',
                'description': 'Your email campaigns show 15% lower open rates than industry average',
                'impact_score': 8.5,
                'confidence_score': 85.0,
                'action_items': [
                    'Use action-oriented language',
                    'Keep subject lines under 50 characters',
                    'Test personalization variables'
                ],
                'estimated_improvement': {
                    'open_rate': '+15%',
                    'click_rate': '+8%',
                    'conversion_rate': '+5%'
                },
                'priority': 'high'
            },
            {
                'recommendation_type': 'audience_targeting',
                'title': 'Expand Target Audience',
                'description': 'Your current audience is too narrow, limiting campaign reach',
                'impact_score': 7.2,
                'confidence_score': 78.0,
                'action_items': [
                    'Create lookalike audiences',
                    'Test broader demographics',
                    'Explore new interest categories'
                ],
                'estimated_improvement': {
                    'reach': '+40%',
                    'impressions': '+35%',
                    'cost_per_click': '-12%'
                },
                'priority': 'medium'
            }
        ]
        
        serializer = CatalystRecommendationSerializer(recommendations, many=True)
        return Response(serializer.data) 