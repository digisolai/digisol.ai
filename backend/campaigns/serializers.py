from rest_framework import serializers
from .models import (
    MarketingCampaign, CampaignStep, OptimizerInsight,
    CampaignPerformance, CampaignAudience, CampaignTemplate
)
from accounts.serializers import UserProfileSerializer as CustomUserSerializer
from core.serializers import TenantSerializer


class CampaignAudienceSerializer(serializers.ModelSerializer):
    """Serializer for campaign audiences and segments"""
    created_by = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = CampaignAudience
        fields = [
            'id', 'name', 'description', 'segment_type', 'criteria', 'filters',
            'estimated_size', 'actual_size', 'engagement_rate', 'conversion_rate',
            'catalyst_score', 'catalyst_recommendations', 'is_active',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class CampaignTemplateSerializer(serializers.ModelSerializer):
    """Serializer for campaign templates"""
    created_by = CustomUserSerializer(read_only=True)
    tenant = TenantSerializer(read_only=True)
    
    class Meta:
        model = CampaignTemplate
        fields = [
            'id', 'name', 'description', 'category', 'campaign_data', 'steps_data',
            'settings', 'usage_count', 'rating', 'is_public', 'is_featured',
            'created_at', 'updated_at', 'created_by', 'tenant'
        ]
        read_only_fields = ['id', 'usage_count', 'created_at', 'updated_at', 'created_by']


class CampaignStepSerializer(serializers.ModelSerializer):
    """Serializer for campaign steps"""
    catalyst_suggestions = serializers.JSONField(read_only=True)
    performance_score = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = CampaignStep
        fields = [
            'id', 'campaign', 'step_type', 'name', 'description', 'order',
            'config', 'content_data', 'metadata', 'parent_steps',
            'true_path_next_step', 'false_path_next_step',
            'catalyst_optimized', 'catalyst_suggestions', 'performance_score',
            'is_enabled', 'execution_count', 'last_executed',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'execution_count', 'last_executed']


class OptimizerInsightSerializer(serializers.ModelSerializer):
    """Serializer for Optimizer AI insights"""
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    step_name = serializers.CharField(source='step.name', read_only=True)
    
    class Meta:
        model = OptimizerInsight
        fields = [
            'id', 'campaign', 'campaign_name', 'step', 'step_name',
            'insight_type', 'title', 'description', 'recommendation', 'priority',
            'predicted_impact', 'confidence_score', 'is_actioned', 'is_dismissed',
            'action_taken', 'context_data', 'created_at', 'updated_at', 'expires_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CampaignPerformanceSerializer(serializers.ModelSerializer):
    """Serializer for campaign performance data"""
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    step_name = serializers.CharField(source='step.name', read_only=True)
    
    class Meta:
        model = CampaignPerformance
        fields = [
            'id', 'campaign', 'campaign_name', 'step', 'step_name',
            'date', 'hour', 'impressions', 'clicks', 'conversions',
            'revenue', 'cost', 'opens', 'bounces', 'unsubscribes',
            'ctr', 'cpc', 'cpm', 'conversion_rate', 'roi', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ctr', 'cpc', 'cpm', 'conversion_rate', 'roi', 'created_at', 'updated_at']


class MarketingCampaignSerializer(serializers.ModelSerializer):
    """Main serializer for marketing campaigns with AI integration"""
    created_by = CustomUserSerializer(read_only=True)
    steps = CampaignStepSerializer(many=True, read_only=True)
    optimizer_insights = OptimizerInsightSerializer(many=True, read_only=True)
    performance_data = CampaignPerformanceSerializer(many=True, read_only=True)
    
    # Computed fields
    budget_utilization = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    total_steps = serializers.SerializerMethodField()
    active_insights = serializers.SerializerMethodField()
    
    class Meta:
        model = MarketingCampaign
        fields = [
            'id', 'name', 'description', 'campaign_type', 'objective',
            'status', 'start_date', 'end_date', 'target_audience_segment',
            'audience_criteria', 'estimated_reach', 'budget', 'spent_budget',
            'target_roi', 'optimizer_health_score', 'optimizer_recommendations',
            'auto_optimization_enabled', 'last_optimized', 'is_template',
            'template_category', 'performance_metrics', 'conversion_goals',
            'created_at', 'updated_at', 'created_by',
            'steps', 'optimizer_insights', 'performance_data',
            'budget_utilization', 'days_remaining', 'total_steps', 'active_insights'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'created_by', 'spent_budget',
            'optimizer_health_score', 'optimizer_recommendations', 'last_optimized',
            'performance_metrics', 'budget_utilization', 'days_remaining'
        ]

    def get_total_steps(self, obj):
        return obj.steps.count()

    def get_active_insights(self, obj):
        return obj.optimizer_insights.filter(is_dismissed=False, is_actioned=False).count()


class CampaignStepDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for campaign steps with performance data"""
    campaign = MarketingCampaignSerializer(read_only=True)
    performance_data = CampaignPerformanceSerializer(many=True, read_only=True)
    optimizer_insights = OptimizerInsightSerializer(many=True, read_only=True)
    
    class Meta:
        model = CampaignStep
        fields = [
            'id', 'campaign', 'step_type', 'name', 'description', 'order',
            'config', 'content_data', 'metadata', 'parent_steps',
            'true_path_next_step', 'false_path_next_step',
            'optimizer_optimized', 'optimizer_suggestions', 'performance_score',
            'is_enabled', 'execution_count', 'last_executed',
            'performance_data', 'optimizer_insights',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'execution_count', 'last_executed',
            'optimizer_suggestions', 'performance_score'
        ]


class CampaignCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new campaigns"""
    class Meta:
        model = MarketingCampaign
        fields = [
            'name', 'description', 'campaign_type', 'objective', 'status',
            'start_date', 'end_date', 'target_audience_segment', 'audience_criteria',
            'estimated_reach', 'budget', 'target_roi', 'auto_optimization_enabled',
            'is_template', 'template_category', 'conversion_goals'
        ]

    def create(self, validated_data):
        # Set the current user as creator if available
        if 'request' in self.context and hasattr(self.context['request'], 'user') and self.context['request'].user.is_authenticated:
            validated_data['created_by'] = self.context['request'].user
        else:
            # Get the first available user or set to None
            from accounts.models import CustomUser
            user = CustomUser.objects.first()
            validated_data['created_by'] = user
        return super().create(validated_data)


class CampaignUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating campaigns"""
    class Meta:
        model = MarketingCampaign
        fields = [
            'name', 'description', 'campaign_type', 'objective', 'status',
            'start_date', 'end_date', 'target_audience_segment', 'audience_criteria',
            'estimated_reach', 'budget', 'target_roi', 'auto_optimization_enabled',
            'is_template', 'template_category', 'conversion_goals'
        ]


class StepCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new campaign steps"""
    class Meta:
        model = CampaignStep
        fields = [
            'step_type', 'name', 'description', 'order', 'config', 'content_data',
            'metadata', 'parent_steps', 'true_path_next_step', 'false_path_next_step',
            'is_enabled'
        ]


class StepUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating campaign steps"""
    class Meta:
        model = CampaignStep
        fields = [
            'name', 'description', 'order', 'config', 'content_data', 'metadata',
            'parent_steps', 'true_path_next_step', 'false_path_next_step',
            'is_enabled'
        ]


class OptimizerInsightCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Optimizer insights"""
    class Meta:
        model = OptimizerInsight
        fields = [
            'campaign', 'step', 'insight_type', 'title', 'description',
            'recommendation', 'priority', 'predicted_impact', 'confidence_score',
            'context_data', 'expires_at'
        ]


class OptimizerInsightUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Optimizer insights"""
    class Meta:
        model = OptimizerInsight
        fields = [
            'is_actioned', 'is_dismissed', 'action_taken'
        ]


class CampaignPerformanceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating performance data"""
    class Meta:
        model = CampaignPerformance
        fields = [
            'campaign', 'step', 'date', 'hour', 'impressions', 'clicks',
            'conversions', 'revenue', 'cost', 'opens', 'bounces', 'unsubscribes',
            'metadata'
        ]


class CampaignDashboardSerializer(serializers.Serializer):
    """Serializer for campaign dashboard data"""
    total_campaigns = serializers.IntegerField()
    active_campaigns = serializers.IntegerField()
    total_budget = serializers.DecimalField(max_digits=10, decimal_places=2)
    spent_budget = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_roi = serializers.DecimalField(max_digits=5, decimal_places=2)
    optimizer_insights_count = serializers.IntegerField()
    performance_trends = serializers.JSONField()
    top_performing_campaigns = serializers.ListField()
    recent_insights = serializers.ListField()


class OptimizerRecommendationSerializer(serializers.Serializer):
    """Serializer for Optimizer AI recommendations"""
    recommendation_type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    impact_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    confidence_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    action_items = serializers.ListField(child=serializers.CharField())
    estimated_improvement = serializers.JSONField()
    priority = serializers.CharField()


class CampaignAnalyticsSerializer(serializers.Serializer):
    """Serializer for campaign analytics data"""
    campaign_id = serializers.UUIDField()
    date_range = serializers.JSONField()
    metrics = serializers.JSONField()
    trends = serializers.JSONField()
    comparisons = serializers.JSONField()
    optimizer_insights = OptimizerInsightSerializer(many=True)
    recommendations = OptimizerRecommendationSerializer(many=True) 