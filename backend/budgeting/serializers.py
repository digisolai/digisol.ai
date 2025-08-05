from rest_framework import serializers
from .models import (
    BudgetCategory, Budget, Expense, BudgetGoal, 
    BudgetForecast, PecuniaRecommendation
)


class BudgetCategorySerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for the BudgetCategory model.
    """
    
    class Meta:
        model = BudgetCategory
        fields = [
            'id', 'name', 'description', 'color', 'icon', 
            'is_default', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        """
        Validate that the category name is not empty and follows naming conventions.
        """
        if not value.strip():
            raise serializers.ValidationError("Category name cannot be empty.")
        
        # Convert to title case for consistency
        return value.strip().title()


class BudgetGoalSerializer(serializers.ModelSerializer):
    """
    Serializer for BudgetGoal model.
    """
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = BudgetGoal
        fields = [
            'id', 'budget', 'goal_name', 'goal_type', 'target_value', 
            'current_value', 'unit', 'roi_percentage', 'cpa',
            'pecunia_feasibility_score', 'pecunia_recommendations',
            'progress_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_progress_percentage(self, obj):
        """Return the goal progress percentage."""
        return obj.progress_percentage


class BudgetForecastSerializer(serializers.ModelSerializer):
    """
    Serializer for BudgetForecast model.
    """
    
    class Meta:
        model = BudgetForecast
        fields = [
            'id', 'budget', 'forecast_date', 'projected_spend', 
            'confidence_level', 'scenario_name', 'scenario_type',
            'factors', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PecuniaRecommendationSerializer(serializers.ModelSerializer):
    """
    Serializer for PecuniaRecommendation model.
    """
    
    class Meta:
        model = PecuniaRecommendation
        fields = [
            'id', 'title', 'description', 'recommendation_type',
            'priority', 'estimated_impact', 'impact_type',
            'related_budget', 'related_expenses', 'is_implemented',
            'implemented_at', 'implementation_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BudgetSerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for the Budget model with calculated fields and related data.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    spent_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    spending_percentage = serializers.SerializerMethodField()
    days_elapsed = serializers.SerializerMethodField()
    total_days = serializers.SerializerMethodField()
    time_progress_percentage = serializers.SerializerMethodField()
    burn_rate = serializers.SerializerMethodField()
    goals = BudgetGoalSerializer(many=True, read_only=True)
    latest_forecast = serializers.SerializerMethodField()
    top_recommendations = serializers.SerializerMethodField()
    
    class Meta:
        model = Budget
        fields = [
            'id', 'name', 'budget_type', 'amount', 'start_date', 'end_date', 
            'category', 'category_name', 'category_color', 'status', 'is_active',
            'description', 'tags', 'spent_amount', 'remaining_amount', 
            'spending_percentage', 'days_elapsed', 'total_days', 
            'time_progress_percentage', 'burn_rate',
            'pecunia_health_score', 'pecunia_recommendations', 'pecunia_risk_level',
            'linked_goals', 'target_roi', 'target_cpa',
            'projected_spend', 'projected_variance',
            'goals', 'latest_forecast', 'top_recommendations',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_spent_amount(self, obj):
        """Return the total spent amount for this budget."""
        return obj.spent_amount

    def get_remaining_amount(self, obj):
        """Return the remaining budget amount."""
        return obj.remaining_amount

    def get_spending_percentage(self, obj):
        """Return the percentage of budget spent."""
        return round(obj.spending_percentage, 2)

    def get_days_elapsed(self, obj):
        """Return days elapsed since budget start."""
        return obj.days_elapsed

    def get_total_days(self, obj):
        """Return total budget period in days."""
        return obj.total_days

    def get_time_progress_percentage(self, obj):
        """Return percentage of time elapsed."""
        return round(obj.time_progress_percentage, 2)

    def get_burn_rate(self, obj):
        """Calculate daily burn rate."""
        if obj.days_elapsed > 0:
            return obj.spent_amount / obj.days_elapsed
        return 0

    def get_latest_forecast(self, obj):
        """Return the latest forecast for this budget."""
        latest = obj.forecasts.first()
        if latest:
            return BudgetForecastSerializer(latest).data
        return None

    def get_top_recommendations(self, obj):
        """Return top 3 recommendations for this budget."""
        recommendations = PecuniaRecommendation.objects.filter(
            related_budget=obj,
            is_implemented=False
        ).order_by('-priority', '-created_at')[:3]
        return PecuniaRecommendationSerializer(recommendations, many=True).data

    def validate(self, data):
        """
        Enhanced validation for budget data.
        """
        # Ensure end_date is after start_date
        if 'start_date' in data and 'end_date' in data:
            if data['start_date'] >= data['end_date']:
                raise serializers.ValidationError("End date must be after start date.")
        
        # Ensure amount is positive
        if 'amount' in data and data['amount'] <= 0:
            raise serializers.ValidationError("Budget amount must be greater than zero.")
        
        # Validate budget type specific constraints
        if 'budget_type' in data:
            budget_type = data['budget_type']
            if budget_type in ['annual', 'quarterly', 'monthly']:
                # For predefined periods, validate date ranges
                if 'start_date' in data and 'end_date' in data:
                    start = data['start_date']
                    end = data['end_date']
                    days_diff = (end - start).days
                    
                    if budget_type == 'annual' and days_diff < 360:
                        raise serializers.ValidationError("Annual budgets should cover at least 360 days.")
                    elif budget_type == 'quarterly' and (days_diff < 80 or days_diff > 100):
                        raise serializers.ValidationError("Quarterly budgets should cover approximately 90 days.")
                    elif budget_type == 'monthly' and (days_diff < 25 or days_diff > 35):
                        raise serializers.ValidationError("Monthly budgets should cover approximately 30 days.")
        
        return data


class ExpenseSerializer(serializers.ModelSerializer):
    """
    Enhanced serializer for the Expense model.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    budget_name = serializers.CharField(source='budget.name', read_only=True)
    budget_type = serializers.CharField(source='budget.budget_type', read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'budget', 'budget_name', 'budget_type', 'description', 
            'amount', 'date', 'category', 'category_name', 'category_color',
            'payment_method', 'status', 'vendor', 'invoice_number', 'receipt_url',
            'is_recurring', 'recurring_frequency',
            'pecunia_auto_categorized', 'pecunia_confidence_score',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """
        Enhanced validation for expense data.
        """
        # Ensure amount is positive
        if 'amount' in data and data['amount'] <= 0:
            raise serializers.ValidationError("Expense amount must be greater than zero.")
        
        # Ensure budget belongs to the same tenant
        if 'budget' in data:
            budget = data['budget']
            if hasattr(self, 'context') and 'request' in self.context:
                user_tenant = self.context['request'].user.tenant
                if budget.tenant != user_tenant:
                    raise serializers.ValidationError("Budget must belong to your tenant.")
        
        # Validate recurring expense data
        if data.get('is_recurring', False):
            if not data.get('recurring_frequency'):
                raise serializers.ValidationError("Recurring frequency is required for recurring expenses.")
        
        return data


class BudgetSummarySerializer(serializers.Serializer):
    """
    Serializer for budget summary and dashboard data.
    """
    total_budgets = serializers.IntegerField()
    active_budgets = serializers.IntegerField()
    total_allocated = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_remaining = serializers.DecimalField(max_digits=12, decimal_places=2)
    overall_spending_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    pecunia_health_score = serializers.IntegerField()
    top_recommendations = PecuniaRecommendationSerializer(many=True)
    budget_breakdown = serializers.ListField()
    spending_trends = serializers.ListField()


class PecuniaAnalysisSerializer(serializers.Serializer):
    """
    Serializer for Pecunia AI analysis results.
    """
    health_score = serializers.IntegerField()
    risk_level = serializers.CharField()
    recommendations = PecuniaRecommendationSerializer(many=True)
    forecasts = BudgetForecastSerializer(many=True)
    variance_analysis = serializers.DictField()
    optimization_opportunities = serializers.ListField()
    savings_potential = serializers.DecimalField(max_digits=12, decimal_places=2) 