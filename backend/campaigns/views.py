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
    CampaignCreateSerializer, CampaignUpdateSerializer, CampaignStatsSerializer
)

class MarketingCampaignViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing marketing campaigns with AI integration
    """
    queryset = MarketingCampaign.objects.all()
    serializer_class = MarketingCampaignSerializer
    permission_classes = []  # Temporarily remove authentication for testing
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CampaignCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CampaignUpdateSerializer
        return MarketingCampaignSerializer

    def perform_create(self, serializer):
        # Temporarily create without user for testing
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get campaign statistics"""
        total_campaigns = MarketingCampaign.objects.count()
        active_campaigns = MarketingCampaign.objects.filter(status='Active').count()
        total_budget = MarketingCampaign.objects.aggregate(Sum('budget'))['budget__sum'] or 0
        total_spent = MarketingCampaign.objects.aggregate(Sum('actual_spent'))['actual_spent__sum'] or 0
        average_roi = MarketingCampaign.objects.aggregate(Avg('target_roi'))['target_roi__avg'] or 0
        
        stats = {
            'total_campaigns': total_campaigns,
            'active_campaigns': active_campaigns,
            'total_budget': total_budget,
            'total_spent': total_spent,
            'average_roi': average_roi
        }
        
        serializer = CampaignStatsSerializer(stats)
        return Response(serializer.data)

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
            'total_budget': MarketingCampaign.objects.aggregate(Sum('budget'))['budget__sum'] or 0,
            'total_spent': MarketingCampaign.objects.aggregate(Sum('actual_spent'))['actual_spent__sum'] or 0,
            'average_roi': MarketingCampaign.objects.aggregate(Avg('target_roi'))['target_roi__avg'] or 0,
            'performance_by_type': {
                'email': {'count': 5, 'avg_roi': 2.5},
                'social': {'count': 3, 'avg_roi': 3.2},
                'search': {'count': 2, 'avg_roi': 4.1}
            }
        }
        
        return Response(analytics) 