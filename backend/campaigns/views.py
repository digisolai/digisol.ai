from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Sum, Avg, Count
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.conf import settings
from datetime import datetime, timedelta
import json

from .models import (
    MarketingCampaign, CampaignStep, OptimizerInsight, 
    CampaignPerformance, CampaignAudience, CampaignTemplate
)
from .serializers import (
    MarketingCampaignSerializer, CampaignStepSerializer, OptimizerInsightSerializer,
    CampaignPerformanceSerializer, CampaignAudienceSerializer, CampaignTemplateSerializer,
    CampaignCreateSerializer, CampaignUpdateSerializer, CampaignStatsSerializer
)

class MarketingCampaignViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing marketing campaigns with AI integration
    """
    queryset = MarketingCampaign.objects.all()
    serializer_class = MarketingCampaignSerializer
    permission_classes = []  # Temporarily remove authentication for testing
    
    def get_queryset(self):
        """Override to handle potential database issues gracefully"""
        try:
            return MarketingCampaign.objects.all()
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting campaigns queryset: {e}")
            # Return empty queryset if there's a database issue
            return MarketingCampaign.objects.none()
    
    def get_serializer_class(self):
        # Handle case where action is not set (like in tests)
        action = getattr(self, 'action', None)
        if action == 'create':
            return CampaignCreateSerializer
        elif action in ['update', 'partial_update']:
            return CampaignUpdateSerializer
        return MarketingCampaignSerializer
    
    def list(self, request, *args, **kwargs):
        """Override list method to add error handling"""
        try:
            # Set up proper context for the viewset
            self.format_kwarg = getattr(self, 'format_kwarg', None)
            
            # Add logging for production debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Campaigns list request from {request.META.get('REMOTE_ADDR', 'unknown')}")
            
            return super().list(request, *args, **kwargs)
        except Exception as e:
            import traceback
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in campaigns list view: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            # Return a more detailed error response in development
            if settings.DEBUG:
                return Response(
                    {
                        'error': 'Failed to fetch campaigns', 
                        'detail': str(e),
                        'traceback': traceback.format_exc()
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            else:
                return Response(
                    {'error': 'Failed to fetch campaigns', 'detail': 'Internal server error'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
    
    def perform_create(self, serializer):
        # Temporarily create without user for testing
        try:
            serializer.save()
        except Exception as e:
            import traceback
            print(f"Error creating campaign: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise

    def perform_update(self, serializer):
        try:
            serializer.save()
        except Exception as e:
            import traceback
            print(f"Error updating campaign: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get campaign statistics"""
        try:
            total_campaigns = MarketingCampaign.objects.count()
            active_campaigns = MarketingCampaign.objects.filter(status='Active').count()
            
            # Convert to float to ensure proper number types
            total_budget = float(MarketingCampaign.objects.aggregate(Sum('budget'))['budget__sum'] or 0)
            total_spent = float(MarketingCampaign.objects.aggregate(Sum('actual_spent'))['actual_spent__sum'] or 0)
            average_roi = float(MarketingCampaign.objects.aggregate(Avg('target_roi'))['target_roi__avg'] or 0)
                
            stats = {
                'total_campaigns': total_campaigns,
                'active_campaigns': active_campaigns,
                'total_budget': total_budget,
                'total_spent': total_spent,
                'average_roi': average_roi
            }
            
            serializer = CampaignStatsSerializer(stats)
            return Response(serializer.data)
        except Exception as e:
            import traceback
            print(f"Error in campaigns stats: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response(
                {'error': 'Failed to fetch campaign statistics', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def optimize(self, request, pk=None):
        """AI-powered campaign optimization"""
        campaign = self.get_object()
        
        # Simulate AI optimization
        campaign.optimizer_health_score = 85
        campaign.optimizer_optimized = True
        campaign.save()
        
        return Response({
            'message': 'Campaign optimized successfully',
            'health_score': campaign.optimizer_health_score
        })
    
    @action(detail=True, methods=['get'])
    def insights(self, request, pk=None):
        """Get AI insights for campaign"""
        campaign = self.get_object()
        
        # Simulate AI insights
        insights = {
            'performance_score': 78,
            'recommendations': [
                'Increase budget allocation for top-performing channels',
                'Optimize ad copy for better engagement',
                'Target audience segments with higher conversion rates'
            ],
            'trends': {
                'engagement_rate': '+15%',
                'conversion_rate': '+8%',
                'cost_per_click': '-12%'
            }
        }
        
        return Response(insights)

class CampaignStepViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing campaign steps
    """
    queryset = CampaignStep.objects.all()
    serializer_class = CampaignStepSerializer
    permission_classes = []  # Temporarily remove authentication

class OptimizerInsightViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing optimizer insights
    """
    queryset = OptimizerInsight.objects.all()
    serializer_class = OptimizerInsightSerializer
    permission_classes = []  # Temporarily remove authentication

class CampaignPerformanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing campaign performance data
    """
    queryset = CampaignPerformance.objects.all()
    serializer_class = CampaignPerformanceSerializer
    permission_classes = []  # Temporarily remove authentication

class CampaignAudienceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing campaign audience data
    """
    queryset = CampaignAudience.objects.all()
    serializer_class = CampaignAudienceSerializer
    permission_classes = []  # Temporarily remove authentication

class CampaignTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing campaign templates
    """
    queryset = CampaignTemplate.objects.all()
    serializer_class = CampaignTemplateSerializer
    permission_classes = []  # Temporarily remove authentication

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get template categories"""
        categories = CampaignTemplate.objects.values_list('category', flat=True).distinct()
        return Response(list(categories))

class CampaignAnalyticsView(APIView):
    """
    Analytics view for campaign performance
    """
    permission_classes = []  # Temporarily remove authentication
    
    def get(self, request):
        """Get campaign analytics data"""
        # Simulate analytics data
        analytics = {
            'total_campaigns': MarketingCampaign.objects.count(),
            'active_campaigns': MarketingCampaign.objects.filter(status='Active').count(),
            'total_budget': float(MarketingCampaign.objects.aggregate(Sum('budget'))['budget__sum'] or 0),
            'total_spent': float(MarketingCampaign.objects.aggregate(Sum('actual_spent'))['actual_spent__sum'] or 0),
            'average_roi': float(MarketingCampaign.objects.aggregate(Avg('target_roi'))['target_roi__avg'] or 0),
            'performance_by_type': {
                'email': {'count': 5, 'avg_roi': 2.5},
                'social': {'count': 3, 'avg_roi': 3.2},
                'search': {'count': 2, 'avg_roi': 4.1}
            }
        }
        
        return Response(analytics) 