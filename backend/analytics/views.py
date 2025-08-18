from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from core.permissions import DigiSolAdminOrAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q, Sum, Avg
from django.utils import timezone
from datetime import date, timedelta
from core.models import Campaign, Contact, Tenant
from .models import (
    Event, ReportConfiguration, LeadFunnelEvent, ReportTemplate, SavedReport, 
    ReportExecution, AnalyticsModel, AnalyticsInsight, SEOAnalysis, SWOTAnalysis, 
    IndustryAnalysis, DataSource, DataSyncLog
)
from .serializers import (
    DashboardSummarySerializer, EventSerializer, ReportConfigurationSerializer, 
    AnalyticsSummarySerializer, LeadFunnelEventSerializer, ReportTemplateSerializer,
    SavedReportSerializer, ReportExecutionSerializer, AnalyticsModelSerializer,
    AnalyticsInsightSerializer, SEOAnalysisSerializer, SWOTAnalysisSerializer,
    IndustryAnalysisSerializer, DataSourceSerializer, DataSyncLogSerializer,
    QuantiaInsightSerializer, QuantiaReportDataSerializer, MetrikaAnalysisSerializer,
    MetrikaModelPerformanceSerializer, ComprehensiveReportSerializer
)
from accounts.permissions import IsTenantUser

class CampaignSummaryView(APIView):
    permission_classes = [DigiSolAdminOrAuthenticated]

    def get(self, request, campaign_id):
        tenant = request.user.tenant
        campaign = get_object_or_404(Campaign, id=campaign_id, tenant=tenant)
        events = Event.objects.filter(campaign=campaign)

        # Aggregate event counts
        total_opens = events.filter(event_type='email_opened').values('contact').distinct().count()
        total_clicks = events.filter(event_type='email_clicked').count()
        total_conversions = events.filter(event_type='lead_converted').count()
        total_sent = events.filter(event_type='campaign_sent').count()
        total_unsubscribed = events.filter(event_type='unsubscribed').count()

        return Response({
            'campaign_id': str(campaign.id),
            'campaign_name': campaign.name,
            'total_opens': total_opens,
            'total_clicks': total_clicks,
            'total_conversions': total_conversions,
            'total_sent': total_sent,
            'total_unsubscribed': total_unsubscribed,
        }, status=status.HTTP_200_OK)


class DashboardSummaryView(APIView):
    permission_classes = [DigiSolAdminOrAuthenticated]

    def get(self, request, *args, **kwargs):
        user_tenant = request.user.tenant

        # Active campaigns
        active_campaigns_count = Campaign.objects.filter(
            tenant=user_tenant,
            status='active'
        ).count()

        # Next scheduled campaign
        next_scheduled_campaign = Campaign.objects.filter(
            tenant=user_tenant,
            status='scheduled',
            start_date__gte=date.today()
        ).order_by('start_date').first()
        next_scheduled_date = next_scheduled_campaign.start_date if next_scheduled_campaign else None

        # Total emails sent (event_type='email_sent')
        total_emails_sent_count = Event.objects.filter(
            tenant=user_tenant,
            event_type='email_sent'
        ).count()

        # Recent leads (last 3 contacts)
        recent_leads_data = Contact.objects.filter(tenant=user_tenant).order_by('-created_at')[:3].values(
            'first_name', 'last_name', 'email', 'created_at'
        )
        formatted_recent_leads = [
            {
                'name': f"{lead['first_name']} {lead['last_name']}",
                'email': lead['email'],
                'date': lead['created_at'].strftime("%Y-%m-%d")
            }
            for lead in recent_leads_data
        ]

        # AI credits usage
        ai_text_credits_used = getattr(user_tenant, 'ai_text_credits_used_current_period', 0)
        ai_image_credits_used = getattr(user_tenant, 'ai_image_credits_used_current_period', 0)

        summary_data = {
            'active_campaigns': active_campaigns_count,
            'next_scheduled': next_scheduled_date,
            'total_emails_sent': total_emails_sent_count,
            'recent_leads': formatted_recent_leads,
            'ai_text_credits_used': ai_text_credits_used,
            'ai_image_credits_used': ai_image_credits_used,
        }

        serializer = DashboardSummarySerializer(summary_data)
        return Response(serializer.data)


class EventViewSet(ModelViewSet):
    """
    ViewSet for managing analytics events.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    filterset_fields = ['event_type', 'campaign', 'contact']
    search_fields = ['event_type', 'details']
    ordering_fields = ['timestamp', 'event_type']
    ordering = ['-timestamp']

    def get_queryset(self):
        """Filter events by tenant."""
        return Event.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        """Set tenant automatically."""
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get event summary statistics."""
        queryset = self.get_queryset()
        
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        recent_events = queryset.filter(timestamp__gte=start_date)
        
        summary = {
            'total_events': recent_events.count(),
            'events_by_type': recent_events.values('event_type').annotate(
                count=Count('id')
            ),
            'total_value': recent_events.aggregate(
                total=Sum('value')
            )['total'] or 0,
            'average_value': recent_events.aggregate(
                avg=Avg('value')
            )['avg'] or 0,
        }
        
        return Response(summary)

    @action(detail=False, methods=['get'])
    def by_campaign(self, request):
        """Get events grouped by campaign."""
        queryset = self.get_queryset()
        campaign_id = request.query_params.get('campaign_id')
        
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)
        
        events_by_campaign = queryset.values('campaign__name').annotate(
            total_events=Count('id'),
            total_value=Sum('value')
        ).order_by('-total_events')
        
        return Response(events_by_campaign)


class ReportConfigurationViewSet(ModelViewSet):
    """
    ViewSet for managing report configurations.
    """
    queryset = ReportConfiguration.objects.all()
    serializer_class = ReportConfigurationSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter configurations by tenant."""
        return ReportConfiguration.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        """Set tenant and creator automatically."""
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)

    def perform_update(self, serializer):
        """Ensure tenant cannot be changed."""
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Execute a report configuration and return results."""
        report_config = self.get_object()
        config = report_config.configuration_json
        
        # This would typically call a report generation service
        # For now, return placeholder data
        results = {
            'report_id': str(report_config.id),
            'report_name': report_config.name,
            'executed_at': timezone.now(),
            'data': {
                'metrics': config.get('metrics', []),
                'time_range': config.get('time_range', ''),
                'results': 'Report execution not implemented yet'
            }
        }
        
        return Response(results)


class AnalyticsSummaryView(APIView):
    """
    API view for comprehensive analytics summary.
    """
    permission_classes = [DigiSolAdminOrAuthenticated]

    def get(self, request):
        """Get comprehensive analytics summary."""
        tenant = request.user.tenant
        
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Calculate metrics
        events = Event.objects.filter(tenant=tenant, timestamp__gte=start_date)
        contacts = Contact.objects.filter(tenant=tenant, created_at__gte=start_date)
        
        total_leads = contacts.count()
        conversion_events = events.filter(event_type='lead_converted')
        conversion_rate = (conversion_events.count() / total_leads * 100) if total_leads > 0 else 0
        
        # Calculate deal values
        deal_values = events.filter(event_type='lead_converted', value__isnull=False)
        average_deal_value = deal_values.aggregate(avg=Avg('value'))['avg'] or 0
        total_revenue = deal_values.aggregate(total=Sum('value'))['total'] or 0
        
        # Top performing campaigns
        top_campaigns = events.values('campaign__name').annotate(
            total_events=Count('id'),
            total_value=Sum('value')
        ).order_by('-total_value')[:5]
        
        # Recent events
        recent_events = events.order_by('-timestamp')[:10].values(
            'event_type', 'timestamp', 'campaign__name', 'contact__email', 'value'
        )
        
        summary_data = {
            'total_leads': total_leads,
            'conversion_rate': round(conversion_rate, 2),
            'average_deal_value': average_deal_value,
            'total_revenue': total_revenue,
            'top_performing_campaigns': list(top_campaigns),
            'recent_events': list(recent_events),
        }
        
        serializer = AnalyticsSummarySerializer(summary_data)
        return Response(serializer.data)


class LeadFunnelEventViewSet(ModelViewSet):
    """
    ViewSet for managing lead funnel events.
    """
    queryset = LeadFunnelEvent.objects.all()
    serializer_class = LeadFunnelEventSerializer
    permission_classes = [DigiSolAdminOrAuthenticated, IsTenantUser]
    filterset_fields = ['event_type', 'campaign', 'campaign_step', 'contact']
    search_fields = ['event_type', 'event_data']
    ordering_fields = ['timestamp', 'event_type']
    ordering = ['-timestamp']

    def get_queryset(self):
        """Filter events by tenant and allow additional filtering."""
        queryset = super().get_queryset()
        
        # Apply tenant filtering
        if self.request.user.is_superuser:
            pass  # Superuser can see all
        elif hasattr(self.request.user, 'tenant') and self.request.user.tenant:
            queryset = queryset.filter(tenant=self.request.user.tenant)
        else:
            return LeadFunnelEvent.objects.none()  # No tenant, no events

        # Allow filtering by query parameters
        contact_id = self.request.query_params.get('contact_id')
        campaign_id = self.request.query_params.get('campaign_id')
        event_type = self.request.query_params.get('event_type')

        if contact_id:
            queryset = queryset.filter(contact_id=contact_id)
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        return queryset

    def perform_create(self, serializer):
        """Set tenant automatically."""
        if hasattr(self.request.user, 'tenant') and self.request.user.tenant:
            serializer.save(tenant=self.request.user.tenant)
        else:
            raise permissions.PermissionDenied("User is not associated with a tenant.")

    @action(detail=False, methods=['get'])
    def funnel_summary(self, request):
        """Get lead funnel summary statistics."""
        queryset = self.get_queryset()
        
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        recent_events = queryset.filter(timestamp__gte=start_date)
        
        # Calculate funnel metrics
        funnel_summary = {
            'total_events': recent_events.count(),
            'events_by_type': recent_events.values('event_type').annotate(
                count=Count('id')
            ),
            'unique_contacts': recent_events.values('contact').distinct().count(),
            'campaigns_with_events': recent_events.values('campaign').distinct().count(),
            'funnel_progression': {
                'mql_count': recent_events.filter(event_type='MQL_Achieved').count(),
                'sql_count': recent_events.filter(event_type='SQL_Achieved').count(),
                'won_count': recent_events.filter(event_type='Won_Opportunity').count(),
                'email_opens': recent_events.filter(event_type='Email_Opened').count(),
                'email_clicks': recent_events.filter(event_type='Email_Clicked').count(),
                'form_submissions': recent_events.filter(event_type='Form_Submission').count(),
            }
        }
        
        return Response(funnel_summary)

    @action(detail=False, methods=['get'])
    def by_campaign(self, request):
        """Get funnel events grouped by campaign."""
        queryset = self.get_queryset()
        campaign_id = request.query_params.get('campaign_id')
        
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)
        
        events_by_campaign = queryset.values('campaign__name').annotate(
            total_events=Count('id'),
            unique_contacts=Count('contact', distinct=True),
            mql_count=Count('id', filter=Q(event_type='MQL_Achieved')),
            sql_count=Count('id', filter=Q(event_type='SQL_Achieved')),
            won_count=Count('id', filter=Q(event_type='Won_Opportunity')),
        ).order_by('-total_events')
        
        return Response(events_by_campaign)

    @action(detail=False, methods=['get'])
    def contact_journey(self, request):
        """Get funnel events for a specific contact."""
        contact_id = request.query_params.get('contact_id')
        if not contact_id:
            return Response(
                {"error": "contact_id parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(contact_id=contact_id)
        
        # Get date range from query params
        days = int(request.query_params.get('days', 90))
        start_date = timezone.now() - timedelta(days=days)
        
        contact_events = queryset.filter(timestamp__gte=start_date).order_by('timestamp')
        
        journey_data = {
            'contact_id': contact_id,
            'total_events': contact_events.count(),
            'events': LeadFunnelEventSerializer(contact_events, many=True).data,
            'funnel_position': self._determine_funnel_position(contact_events),
        }
        
        return Response(journey_data)

    def _determine_funnel_position(self, events):
        """Determine the current funnel position for a contact based on their events."""
        event_types = list(events.values_list('event_type', flat=True))
        
        if 'Won_Opportunity' in event_types:
            return 'Won'
        elif 'SQL_Achieved' in event_types:
            return 'SQL'
        elif 'MQL_Achieved' in event_types:
            return 'MQL'
        elif 'Form_Submission' in event_types or 'Email_Clicked' in event_types:
            return 'Engaged'
        elif 'Email_Opened' in event_types or 'Page_Visit' in event_types:
            return 'Aware'
        else:
            return 'Unknown'


# ===== QUANTIA (REPORTS) VIEWS =====

class ReportTemplateViewSet(ModelViewSet):
    """
    ViewSet for managing report templates.
    """
    queryset = ReportTemplate.objects.all()
    serializer_class = ReportTemplateSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'template_type', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        """Filter templates by global availability or tenant."""
        if self.request.user.is_superuser:
            return ReportTemplate.objects.all()
        return ReportTemplate.objects.filter(is_global=True)

    def perform_create(self, serializer):
        """Set creator automatically."""
        serializer.save(created_by=self.request.user)


class SavedReportViewSet(ModelViewSet):
    """
    ViewSet for managing saved reports.
    """
    queryset = SavedReport.objects.all()
    serializer_class = SavedReportSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-updated_at']

    def get_queryset(self):
        """Filter reports by tenant."""
        return SavedReport.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        """Set tenant and creator automatically."""
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)

    def perform_update(self, serializer):
        """Ensure tenant cannot be changed."""
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """Generate a report based on saved configuration."""
        saved_report = self.get_object()
        
        # Create execution record
        execution = ReportExecution.objects.create(
            tenant=request.user.tenant,
            report=saved_report,
            executed_by=request.user,
            status='running'
        )
        
        try:
            # Simulate report generation
            # In production, this would call a background task
            results = self._generate_report_data(saved_report)
            
            execution.results = results
            execution.status = 'completed'
            execution.completed_at = timezone.now()
            execution.save()
            
            return Response({
                'execution_id': str(execution.id),
                'status': 'completed',
                'results': results
            })
            
        except Exception as e:
            execution.status = 'failed'
            execution.error_message = str(e)
            execution.completed_at = timezone.now()
            execution.save()
            
            return Response({
                'execution_id': str(execution.id),
                'status': 'failed',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _generate_report_data(self, saved_report):
        """Generate sample report data based on configuration."""
        config = saved_report.configuration
        
        # Sample data generation based on template type
        template_type = config.get('template_type', 'custom')
        
        if template_type == 'marketing_performance':
            return {
                'metrics': {
                    'total_campaigns': 12,
                    'active_campaigns': 8,
                    'total_leads': 847,
                    'conversion_rate': 2.3,
                    'total_revenue': 45600,
                    'roi': 3.2
                },
                'visualizations': [
                    {
                        'type': 'line_chart',
                        'title': 'Campaign Performance Over Time',
                        'data': [
                            {'date': '2025-01-01', 'leads': 45, 'conversions': 12},
                            {'date': '2025-01-02', 'leads': 52, 'conversions': 15},
                            {'date': '2025-01-03', 'leads': 38, 'conversions': 8},
                        ]
                    }
                ],
                'insights': [
                    {
                        'type': 'trend',
                        'title': 'Increasing Lead Generation',
                        'description': 'Lead generation has increased by 15% this month',
                        'confidence_score': 0.85,
                        'recommendations': ['Continue current campaign strategy', 'Increase budget for top-performing campaigns']
                    }
                ]
            }
        
        # Default response
        return {
            'metrics': config.get('metrics', {}),
            'visualizations': [],
            'insights': []
        }


class ReportExecutionViewSet(ModelViewSet):
    """
    ViewSet for managing report executions.
    """
    queryset = ReportExecution.objects.all()
    serializer_class = ReportExecutionSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    ordering_fields = ['started_at', 'status']
    ordering = ['-started_at']

    def get_queryset(self):
        """Filter executions by tenant."""
        return ReportExecution.objects.filter(tenant=self.request.user.tenant)


# ===== METRIKA (ADVANCED ANALYTICS) VIEWS =====

class AnalyticsModelViewSet(ModelViewSet):
    """
    ViewSet for managing analytics models.
    """
    queryset = AnalyticsModel.objects.all()
    serializer_class = AnalyticsModelSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'model_type', 'created_at', 'updated_at']
    ordering = ['-updated_at']

    def get_queryset(self):
        """Filter models by tenant."""
        return AnalyticsModel.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        """Set tenant and creator automatically."""
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)

    def perform_update(self, serializer):
        """Ensure tenant cannot be changed."""
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=True, methods=['post'])
    def train(self, request, pk=None):
        """Train or retrain an analytics model."""
        model = self.get_object()
        
        # Simulate model training
        # In production, this would call a background task
        model.last_trained = timezone.now()
        model.performance_metrics = {
            'accuracy': 0.85,
            'precision': 0.82,
            'recall': 0.88,
            'f1_score': 0.85
        }
        model.save()
        
        return Response({
            'model_id': str(model.id),
            'status': 'training_completed',
            'performance_metrics': model.performance_metrics
        })

    @action(detail=True, methods=['post'])
    def predict(self, request, pk=None):
        """Make predictions using the model."""
        model = self.get_object()
        input_data = request.data.get('input_data', {})
        
        # Simulate prediction
        # In production, this would load the model and make actual predictions
        predictions = {
            'model_id': str(model.id),
            'model_type': model.model_type,
            'predictions': [
                {'input': input_data, 'prediction': 0.75, 'confidence': 0.85}
            ]
        }
        
        return Response(predictions)


class AnalyticsInsightViewSet(ModelViewSet):
    """
    ViewSet for managing analytics insights.
    """
    queryset = AnalyticsInsight.objects.all()
    serializer_class = AnalyticsInsightSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'insight_type', 'confidence_score']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter insights by tenant."""
        return AnalyticsInsight.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        """Set tenant automatically."""
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=False, methods=['get'])
    def recent_insights(self, request):
        """Get recent insights for the dashboard."""
        queryset = self.get_queryset()
        days = int(request.query_params.get('days', 7))
        start_date = timezone.now() - timedelta(days=days)
        
        recent_insights = queryset.filter(
            created_at__gte=start_date,
            is_actioned=False
        ).order_by('-confidence_score')[:10]
        
        serializer = self.get_serializer(recent_insights, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_actioned(self, request, pk=None):
        """Mark an insight as actioned."""
        insight = self.get_object()
        insight.is_actioned = True
        insight.save()
        
        return Response({'status': 'marked_as_actioned'})


# ===== SEO ANALYSIS VIEWS =====

class SEOAnalysisViewSet(ModelViewSet):
    """
    ViewSet for managing SEO analyses.
    """
    queryset = SEOAnalysis.objects.all()
    serializer_class = SEOAnalysisSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    search_fields = ['domain']
    ordering_fields = ['analysis_date', 'domain']
    ordering = ['-analysis_date']

    def get_queryset(self):
        """Filter analyses by tenant."""
        return SEOAnalysis.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        """Set tenant and creator automatically."""
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def run_analysis(self, request, pk=None):
        """Run a new SEO analysis."""
        seo_analysis = self.get_object()
        
        # Simulate SEO analysis
        # In production, this would integrate with Google Search Console, Analytics, etc.
        analysis_data = {
            'gsc_data': {
                'total_clicks': 1250,
                'total_impressions': 45000,
                'average_ctr': 2.8,
                'average_position': 15.2
            },
            'ga_data': {
                'organic_traffic': 3200,
                'organic_conversions': 45,
                'bounce_rate': 65.2
            },
            'technical_seo': {
                'mobile_usability_issues': 3,
                'indexing_issues': 1,
                'page_speed_score': 85
            },
            'keyword_data': {
                'ranking_keywords': 150,
                'top_10_keywords': 25,
                'keyword_opportunities': 45
            },
            'insights': [
                {
                    'type': 'opportunity',
                    'title': 'Mobile Optimization Needed',
                    'description': '3 mobile usability issues detected',
                    'priority': 'high'
                }
            ],
            'recommendations': [
                'Fix mobile usability issues',
                'Optimize page loading speed',
                'Target long-tail keywords'
            ]
        }
        
        seo_analysis.gsc_data = analysis_data['gsc_data']
        seo_analysis.ga_data = analysis_data['ga_data']
        seo_analysis.technical_seo = analysis_data['technical_seo']
        seo_analysis.keyword_data = analysis_data['keyword_data']
        seo_analysis.insights = analysis_data['insights']
        seo_analysis.recommendations = analysis_data['recommendations']
        seo_analysis.save()
        
        return Response({
            'analysis_id': str(seo_analysis.id),
            'status': 'completed',
            'data': analysis_data
        })


# ===== SWOT ANALYSIS VIEWS =====

class SWOTAnalysisViewSet(ModelViewSet):
    """
    ViewSet for managing SWOT analyses.
    """
    queryset = SWOTAnalysis.objects.all()
    serializer_class = SWOTAnalysisSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    search_fields = ['analysis_period']
    ordering_fields = ['analysis_date', 'analysis_period']
    ordering = ['-analysis_date']

    def get_queryset(self):
        """Filter analyses by tenant."""
        return SWOTAnalysis.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        """Set tenant and creator automatically."""
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def generate_swot(self, request, pk=None):
        """Generate SWOT analysis using AI."""
        swot_analysis = self.get_object()
        
        # Simulate AI-generated SWOT analysis
        # In production, this would use AI models to analyze data
        swot_data = {
            'strengths': [
                'Strong brand recognition in target market',
                'High customer satisfaction scores',
                'Efficient lead conversion process'
            ],
            'weaknesses': [
                'Limited presence on emerging platforms',
                'High customer acquisition cost',
                'Dependency on single revenue stream'
            ],
            'opportunities': [
                'Growing market demand for our services',
                'Untapped international markets',
                'Emerging technology trends'
            ],
            'threats': [
                'Increasing competition from new entrants',
                'Economic uncertainty affecting spending',
                'Regulatory changes in industry'
            ],
            'strategic_recommendations': [
                {
                    'category': 'leverage_strengths',
                    'recommendation': 'Launch referral program to capitalize on high customer satisfaction',
                    'priority': 'high'
                },
                {
                    'category': 'address_weaknesses',
                    'recommendation': 'Diversify marketing channels to reduce acquisition costs',
                    'priority': 'medium'
                }
            ]
        }
        
        swot_analysis.strengths = swot_data['strengths']
        swot_analysis.weaknesses = swot_data['weaknesses']
        swot_analysis.opportunities = swot_data['opportunities']
        swot_analysis.threats = swot_data['threats']
        swot_analysis.strategic_recommendations = swot_data['strategic_recommendations']
        swot_analysis.save()
        
        return Response({
            'analysis_id': str(swot_analysis.id),
            'status': 'completed',
            'data': swot_data
        })


# ===== INDUSTRY ANALYSIS VIEWS =====

class IndustryAnalysisViewSet(ModelViewSet):
    """
    ViewSet for managing industry analyses.
    """
    queryset = IndustryAnalysis.objects.all()
    serializer_class = IndustryAnalysisSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    search_fields = ['industry', 'sub_industry']
    ordering_fields = ['analysis_date', 'industry']
    ordering = ['-analysis_date']

    def get_queryset(self):
        """Filter analyses by tenant."""
        return IndustryAnalysis.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        """Set tenant and creator automatically."""
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def run_industry_analysis(self, request, pk=None):
        """Run comprehensive industry analysis."""
        industry_analysis = self.get_object()
        
        # Simulate industry analysis
        # In production, this would integrate with market research APIs
        analysis_data = {
            'market_size': {
                'current_size': 15000000000,  # $15B
                'projected_size': 22000000000,  # $22B
                'growth_rate': 8.5
            },
            'competitors': [
                {
                    'name': 'Competitor A',
                    'market_share': 25.5,
                    'strengths': ['Strong brand', 'Large customer base'],
                    'weaknesses': ['Slow innovation', 'High prices']
                }
            ],
            'trends': [
                'Increasing adoption of AI/ML solutions',
                'Growing demand for personalized experiences',
                'Shift towards subscription-based models'
            ],
            'strategic_implications': [
                {
                    'trend': 'AI/ML adoption',
                    'implication': 'Invest in AI capabilities to stay competitive',
                    'priority': 'high'
                }
            ]
        }
        
        industry_analysis.market_size = analysis_data['market_size']
        industry_analysis.competitors = analysis_data['competitors']
        industry_analysis.trends = analysis_data['trends']
        industry_analysis.strategic_implications = analysis_data['strategic_implications']
        industry_analysis.save()
        
        return Response({
            'analysis_id': str(industry_analysis.id),
            'status': 'completed',
            'data': analysis_data
        })


# ===== DATA INTEGRATION VIEWS =====

class DataSourceViewSet(ModelViewSet):
    """
    ViewSet for managing data sources.
    """
    queryset = DataSource.objects.all()
    serializer_class = DataSourceSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    search_fields = ['name']
    ordering_fields = ['name', 'source_type', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        """Filter sources by tenant."""
        return DataSource.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        """Set tenant automatically."""
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """Test connection to data source."""
        data_source = self.get_object()
        
        # Simulate connection test
        # In production, this would actually test the connection
        return Response({
            'source_id': str(data_source.id),
            'status': 'connected',
            'message': 'Connection successful'
        })

    @action(detail=True, methods=['post'])
    def sync_data(self, request, pk=None):
        """Sync data from the source."""
        data_source = self.get_object()
        
        # Create sync log
        sync_log = DataSyncLog.objects.create(
            tenant=request.user.tenant,
            data_source=data_source,
            status='running'
        )
        
        try:
            # Simulate data sync
            # In production, this would actually sync data
            sync_log.status = 'completed'
            sync_log.records_processed = 1250
            sync_log.sync_completed = timezone.now()
            sync_log.save()
            
            # Update data source last sync
            data_source.last_sync = timezone.now()
            data_source.save()
            
            return Response({
                'sync_id': str(sync_log.id),
                'status': 'completed',
                'records_processed': sync_log.records_processed
            })
            
        except Exception as e:
            sync_log.status = 'failed'
            sync_log.error_message = str(e)
            sync_log.sync_completed = timezone.now()
            sync_log.save()
            
            return Response({
                'sync_id': str(sync_log.id),
                'status': 'failed',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DataSyncLogViewSet(ModelViewSet):
    """
    ViewSet for managing data sync logs.
    """
    queryset = DataSyncLog.objects.all()
    serializer_class = DataSyncLogSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    ordering_fields = ['sync_started', 'status']
    ordering = ['-sync_started']

    def get_queryset(self):
        """Filter logs by tenant."""
        return DataSyncLog.objects.filter(tenant=self.request.user.tenant)


# ===== COMPREHENSIVE ANALYTICS VIEWS =====

class QuantiaInsightsView(APIView):
    """
    API view for Quantia's AI-generated insights.
    """
    permission_classes = [DigiSolAdminOrAuthenticated]

    def get(self, request):
        """Get Quantia insights for the dashboard."""
        tenant = request.user.tenant
        
        # Simulate Quantia insights
        insights = [
            {
                'insight_type': 'trend',
                'title': 'Email Performance Improving',
                'description': 'Your email open rates have increased by 15% this month compared to last month.',
                'confidence_score': 0.92,
                'recommendations': [
                    'Continue current subject line strategy',
                    'Test similar approaches with other campaigns'
                ],
                'related_data': {
                    'current_open_rate': 24.5,
                    'previous_open_rate': 21.3,
                    'improvement': 15.0
                }
            },
            {
                'insight_type': 'anomaly',
                'title': 'Unusual Drop in Conversions',
                'description': 'Conversion rate dropped 25% on Tuesday without clear cause.',
                'confidence_score': 0.78,
                'recommendations': [
                    'Investigate Tuesday\'s traffic sources',
                    'Check for technical issues on landing pages'
                ],
                'related_data': {
                    'normal_conversion_rate': 2.3,
                    'tuesday_conversion_rate': 1.7,
                    'drop_percentage': 25.0
                }
            }
        ]
        
        return Response(insights)

    def post(self, request):
        """Ask Quantia a question."""
        question = request.data.get('question', '')
        
        # Simulate Quantia's response
        # In production, this would use AI to generate insights
        response = {
            'question': question,
            'answer': f"Quantia analyzed your data and found that {question.lower()} shows positive trends. Consider focusing on your top-performing campaigns.",
            'confidence_score': 0.85,
            'related_metrics': {
                'campaign_performance': 'increasing',
                'lead_quality': 'stable',
                'conversion_rate': 'improving'
            }
        }
        
        return Response(response)


class MetrikaAnalysisView(APIView):
    """
    API view for Metrika's advanced analysis capabilities.
    """
    permission_classes = [DigiSolAdminOrAuthenticated]

    def post(self, request):
        """Run advanced analysis with Metrika."""
        analysis_type = request.data.get('analysis_type')
        problem_statement = request.data.get('problem_statement')
        data_sources = request.data.get('data_sources', [])
        
        # Simulate Metrika analysis
        # In production, this would use advanced ML models
        analysis_result = {
            'analysis_id': 'metrika_analysis_001',
            'analysis_type': analysis_type,
            'problem_statement': problem_statement,
            'methodology': 'Multi-variate regression analysis with cross-validation',
            'results': {
                'key_findings': [
                    'Customer acquisition cost is strongly correlated with ad spend',
                    'Email engagement predicts conversion likelihood with 85% accuracy'
                ],
                'predictions': {
                    'next_month_leads': 1250,
                    'conversion_rate': 2.8,
                    'revenue_forecast': 52000
                }
            },
            'insights': [
                {
                    'insight_type': 'prediction',
                    'title': 'Lead Generation Forecast',
                    'description': 'Based on current trends, you can expect 1,250 leads next month.',
                    'confidence_score': 0.88,
                    'impact_score': 0.75,
                    'recommendations': [
                        'Increase budget for top-performing channels',
                        'Optimize landing pages for better conversion'
                    ]
                }
            ],
            'recommendations': [
                {
                    'category': 'budget_optimization',
                    'recommendation': 'Shift 15% of budget from display to search ads',
                    'expected_impact': '12% increase in qualified leads',
                    'confidence': 0.82
                }
            ],
            'confidence_level': 0.85,
            'created_at': timezone.now()
        }
        
        return Response(analysis_result)


class ComprehensiveReportView(APIView):
    """
    API view for generating comprehensive reports combining Quantia and Metrika.
    """
    permission_classes = [DigiSolAdminOrAuthenticated]

    def post(self, request):
        """Generate a comprehensive report."""
        report_type = request.data.get('report_type', 'quantia')  # 'quantia' or 'metrika'
        date_range = request.data.get('date_range', {})
        include_seo = request.data.get('include_seo', False)
        include_swot = request.data.get('include_swot', False)
        include_industry = request.data.get('include_industry', False)
        
        # Generate comprehensive report
        report_data = {
            'report_id': 'comprehensive_report_001',
            'report_name': f'Comprehensive {report_type.title()} Report',
            'report_type': report_type,
            'date_range': date_range,
            'data_sources': ['campaigns', 'analytics', 'crm'],
            'generated_at': timezone.now(),
            'generated_by': {
                'id': request.user.id,
                'email': request.user.email,
                'full_name': request.user.get_full_name()
            }
        }
        
        # Add Quantia insights if requested
        if report_type == 'quantia':
            report_data['quantia_insights'] = [
                {
                    'insight_type': 'trend',
                    'title': 'Performance Summary',
                    'description': 'Overall marketing performance is strong with room for optimization.',
                    'confidence_score': 0.90,
                    'recommendations': ['Continue current strategy', 'Test new channels']
                }
            ]
            report_data['report_metrics'] = {
                'total_campaigns': 12,
                'total_leads': 847,
                'conversion_rate': 2.3,
                'roi': 3.2
            }
        
        # Add Metrika analysis if requested
        if report_type == 'metrika':
            report_data['metrika_analysis'] = {
                'analysis_id': 'metrika_001',
                'analysis_type': 'predictive_analytics',
                'problem_statement': 'Forecast next quarter performance',
                'methodology': 'Time series analysis with ML models',
                'results': {
                    'predictions': {
                        'leads': 1500,
                        'revenue': 75000,
                        'conversion_rate': 2.8
                    }
                },
                'confidence_level': 0.85
            }
        
        # Add SEO analysis if requested
        if include_seo:
            report_data['seo_analysis'] = {
                'analysis_date': timezone.now(),
                'domain': 'example.com',
                'gsc_data': {'total_clicks': 1250, 'total_impressions': 45000},
                'insights': [{'title': 'Mobile optimization needed', 'priority': 'high'}]
            }
        
        # Add SWOT analysis if requested
        if include_swot:
            report_data['swot_analysis'] = {
                'analysis_date': timezone.now(),
                'strengths': ['Strong brand', 'High customer satisfaction'],
                'weaknesses': ['High acquisition cost', 'Limited channels'],
                'opportunities': ['Market growth', 'New technologies'],
                'threats': ['Competition', 'Economic uncertainty']
            }
        
        # Add industry analysis if requested
        if include_industry:
            report_data['industry_analysis'] = {
                'analysis_date': timezone.now(),
                'industry': 'Technology',
                'market_size': {'current_size': 15000000000, 'growth_rate': 8.5},
                'trends': ['AI adoption', 'Personalization', 'Subscription models']
            }
        
        return Response(report_data)
