from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
import json

from .models import (
    BudgetCategory, Budget, Expense, BudgetGoal, 
    BudgetForecast, PecuniaRecommendation
)
from .serializers import (
    BudgetCategorySerializer, BudgetSerializer, ExpenseSerializer,
    BudgetGoalSerializer, BudgetForecastSerializer, PecuniaRecommendationSerializer,
    BudgetSummarySerializer, PecuniaAnalysisSerializer
)


class BudgetCategoryViewSet(viewsets.ModelViewSet):
    """
    Enhanced ViewSet for managing budget categories.
    Automatically filters by tenant and provides CRUD operations.
    """
    queryset = BudgetCategory.objects.all()
    serializer_class = BudgetCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        """
        Override to ensure only categories for the current tenant are returned.
        """
        return BudgetCategory.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        """
        Override to automatically set the tenant to the current user's tenant.
        """
        serializer.save(tenant=self.request.user.tenant)

    def perform_update(self, serializer):
        """
        Override to ensure the tenant cannot be changed during updates.
        """
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=False, methods=['get'])
    def default_categories(self, request):
        """
        Get or create default categories for new tenants.
        """
        tenant = request.user.tenant
        default_categories = [
            {'name': 'Paid Advertising', 'description': 'Google Ads, Facebook Ads, etc.', 'color': '#3182CE'},
            {'name': 'Content Marketing', 'description': 'Blog posts, videos, infographics', 'color': '#38A169'},
            {'name': 'SEO', 'description': 'Search engine optimization', 'color': '#D69E2E'},
            {'name': 'Social Media', 'description': 'Social media management and ads', 'color': '#E53E3E'},
            {'name': 'Email Marketing', 'description': 'Email campaigns and automation', 'color': '#805AD5'},
            {'name': 'Events', 'description': 'Webinars, conferences, trade shows', 'color': '#DD6B20'},
            {'name': 'Software & Tools', 'description': 'Marketing software subscriptions', 'color': '#319795'},
            {'name': 'Agency & Services', 'description': 'External agency fees and services', 'color': '#2D3748'},
        ]
        
        created_categories = []
        for cat_data in default_categories:
            category, created = BudgetCategory.objects.get_or_create(
                tenant=tenant,
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'color': cat_data['color'],
                    'is_default': True
                }
            )
            if created:
                created_categories.append(category)
        
        serializer = self.get_serializer(BudgetCategory.objects.filter(tenant=tenant), many=True)
        return Response(serializer.data)


class BudgetViewSet(viewsets.ModelViewSet):
    """
    Enhanced ViewSet for managing budgets with aggregated spending data and Pecunia AI integration.
    """
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'amount', 'start_date', 'end_date', 'created_at', 'pecunia_health_score']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Override to ensure only budgets for the current tenant are returned.
        """
        queryset = Budget.objects.filter(tenant=self.request.user.tenant)
        
        # Apply filters
        budget_type = self.request.query_params.get('budget_type', None)
        status_filter = self.request.query_params.get('status', None)
        category = self.request.query_params.get('category', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if budget_type:
            queryset = queryset.filter(budget_type=budget_type)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if category:
            queryset = queryset.filter(category_id=category)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset

    def perform_create(self, serializer):
        """
        Override to automatically set the tenant and update Pecunia health score.
        """
        budget = serializer.save(tenant=self.request.user.tenant)
        budget.update_pecunia_health_score()

    def perform_update(self, serializer):
        """
        Override to ensure the tenant cannot be changed and update Pecunia health score.
        """
        budget = serializer.save(tenant=self.request.user.tenant)
        budget.update_pecunia_health_score()

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get budget summary and dashboard data.
        """
        tenant = request.user.tenant
        budgets = Budget.objects.filter(tenant=tenant, is_active=True)
        
        total_budgets = budgets.count()
        active_budgets = budgets.filter(status='active').count()
        
        total_allocated = budgets.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        # Calculate total spent by summing all expenses for all budgets
        total_spent = Decimal('0.00')
        for budget in budgets:
            total_spent += budget.spent_amount
        
        total_remaining = total_allocated - total_spent
        
        overall_spending_percentage = (total_spent / total_allocated * 100) if total_allocated > 0 else 0
        
        # Calculate overall Pecunia health score
        health_scores = [b.pecunia_health_score for b in budgets if b.pecunia_health_score is not None]
        pecunia_health_score = int(sum(health_scores) / len(health_scores)) if health_scores else 75
        
        # Get top recommendations
        top_recommendations = PecuniaRecommendation.objects.filter(
            tenant=tenant,
            is_implemented=False
        ).order_by('-priority', '-created_at')[:5]
        
        # Budget breakdown by category
        budget_breakdown = []
        for budget in budgets:
            budget_breakdown.append({
                'id': budget.id,
                'name': budget.name,
                'amount': budget.amount,
                'spent': budget.spent_amount,
                'remaining': budget.remaining_amount,
                'percentage': budget.spending_percentage,
                'category': budget.category.name if budget.category else 'Uncategorized',
                'status': budget.status,
                'health_score': budget.pecunia_health_score
            })
        
        # Spending trends (last 6 months)
        spending_trends = []
        for i in range(6):
            date = timezone.now().date() - timedelta(days=30*i)
            month_expenses = Expense.objects.filter(
                tenant=tenant,
                date__year=date.year,
                date__month=date.month
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            spending_trends.append({
                'month': date.strftime('%Y-%m'),
                'amount': month_expenses
            })
        
        summary_data = {
            'total_budgets': total_budgets,
            'active_budgets': active_budgets,
            'total_allocated': float(total_allocated),
            'total_spent': float(total_spent),
            'total_remaining': float(total_remaining),
            'overall_spending_percentage': float(round(overall_spending_percentage, 2)),
            'pecunia_health_score': pecunia_health_score,
            'top_recommendations': PecuniaRecommendationSerializer(top_recommendations, many=True).data,
            'budget_breakdown': budget_breakdown,
            'spending_trends': spending_trends
        }
        
        serializer = BudgetSummarySerializer(summary_data)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def ask_pecunia(self, request, pk=None):
        """
        Ask Pecunia AI for budget analysis and recommendations.
        """
        budget = self.get_object()
        query = request.data.get('query', '')
        
        # Simulate Pecunia AI analysis (in real implementation, this would call an AI service)
        analysis = self._generate_pecunia_analysis(budget, query)
        
        return Response(analysis)

    def _generate_pecunia_analysis(self, budget, query):
        """
        Generate Pecunia AI analysis for a budget.
        """
        # Calculate health score
        health_score = budget.pecunia_health_score or 75
        
        # Determine risk level
        if health_score >= 80:
            risk_level = 'low'
        elif health_score >= 60:
            risk_level = 'medium'
        else:
            risk_level = 'high'
        
        # Generate recommendations based on budget status
        recommendations = []
        
        if budget.spending_percentage > 100:
            recommendations.append({
                'title': 'Budget Overrun Alert',
                'description': f'Your budget is {budget.spending_percentage:.1f}% over allocated amount.',
                'recommendation_type': 'risk_alert',
                'priority': 'critical',
                'estimated_impact': budget.spent_amount - budget.amount,
                'impact_type': 'savings'
            })
        
        if budget.spending_percentage > budget.time_progress_percentage * 1.2:
            recommendations.append({
                'title': 'Spending Rate Warning',
                'description': 'You are spending faster than your time progress suggests.',
                'recommendation_type': 'risk_alert',
                'priority': 'high',
                'estimated_impact': None,
                'impact_type': 'efficiency'
            })
        
        if budget.spending_percentage < 50 and budget.time_progress_percentage > 70:
            recommendations.append({
                'title': 'Under-Spending Opportunity',
                'description': 'You have significant budget remaining with little time left.',
                'recommendation_type': 'opportunity',
                'priority': 'medium',
                'estimated_impact': budget.remaining_amount * 0.1,
                'impact_type': 'revenue'
            })
        
        # Generate forecasts
        forecasts = []
        if budget.days_elapsed > 0:
            daily_rate = budget.spent_amount / budget.days_elapsed
            remaining_days = budget.total_days - budget.days_elapsed
            
            baseline_forecast = daily_rate * remaining_days
            optimistic_forecast = baseline_forecast * 0.8
            pessimistic_forecast = baseline_forecast * 1.2
            
            forecasts = [
                {
                    'forecast_date': timezone.now().date(),
                    'projected_spend': baseline_forecast,
                    'confidence_level': 70,
                    'scenario_type': 'baseline'
                },
                {
                    'forecast_date': timezone.now().date(),
                    'projected_spend': optimistic_forecast,
                    'confidence_level': 60,
                    'scenario_type': 'optimistic'
                },
                {
                    'forecast_date': timezone.now().date(),
                    'projected_spend': pessimistic_forecast,
                    'confidence_level': 80,
                    'scenario_type': 'pessimistic'
                }
            ]
        
        analysis = {
            'health_score': health_score,
            'risk_level': risk_level,
            'recommendations': recommendations,
            'forecasts': forecasts,
            'variance_analysis': {
                'spending_variance': budget.spent_amount - (budget.amount * budget.time_progress_percentage / 100),
                'time_variance': budget.time_progress_percentage - budget.spending_percentage
            },
            'optimization_opportunities': [
                'Review recurring expenses',
                'Optimize ad spend allocation',
                'Consider bulk purchasing discounts'
            ],
            'savings_potential': budget.remaining_amount * 0.15  # Estimate 15% savings potential
        }
        
        return analysis


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    Enhanced ViewSet for managing expenses with advanced categorization and Pecunia AI integration.
    """
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['description', 'notes', 'vendor']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        """
        Override to ensure only expenses for the current tenant are returned.
        """
        queryset = Expense.objects.filter(tenant=self.request.user.tenant)
        
        # Apply filters
        budget_id = self.request.query_params.get('budget', None)
        category_id = self.request.query_params.get('category', None)
        payment_method = self.request.query_params.get('payment_method', None)
        status_filter = self.request.query_params.get('status', None)
        is_recurring = self.request.query_params.get('is_recurring', None)
        
        if budget_id:
            queryset = queryset.filter(budget_id=budget_id)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if is_recurring is not None:
            queryset = queryset.filter(is_recurring=is_recurring.lower() == 'true')
        
        return queryset

    def perform_create(self, serializer):
        """
        Override to automatically set the tenant and trigger Pecunia analysis.
        """
        expense = serializer.save(tenant=self.request.user.tenant)
        
        # Update budget health score
        expense.budget.update_pecunia_health_score()
        
        # Auto-categorize if not already categorized
        if not expense.category and not expense.pecunia_auto_categorized:
            self._auto_categorize_expense(expense)

    def perform_update(self, serializer):
        """
        Override to ensure the tenant cannot be changed and update budget health score.
        """
        expense = serializer.save(tenant=self.request.user.tenant)
        expense.budget.update_pecunia_health_score()

    def _auto_categorize_expense(self, expense):
        """
        Auto-categorize expense using simple keyword matching (in real implementation, this would use AI).
        """
        description_lower = expense.description.lower()
        
        # Simple keyword-based categorization
        category_mapping = {
            'google': 'Paid Advertising',
            'facebook': 'Paid Advertising',
            'ads': 'Paid Advertising',
            'advertising': 'Paid Advertising',
            'blog': 'Content Marketing',
            'content': 'Content Marketing',
            'video': 'Content Marketing',
            'seo': 'SEO',
            'search': 'SEO',
            'social': 'Social Media',
            'email': 'Email Marketing',
            'mailchimp': 'Email Marketing',
            'event': 'Events',
            'webinar': 'Events',
            'conference': 'Events',
            'software': 'Software & Tools',
            'subscription': 'Software & Tools',
            'tool': 'Software & Tools',
            'agency': 'Agency & Services',
            'service': 'Agency & Services',
        }
        
        for keyword, category_name in category_mapping.items():
            if keyword in description_lower:
                try:
                    category = BudgetCategory.objects.get(
                        tenant=expense.tenant,
                        name=category_name
                    )
                    expense.category = category
                    expense.pecunia_auto_categorized = True
                    expense.pecunia_confidence_score = 75  # Medium confidence
                    expense.save()
                    break
                except BudgetCategory.DoesNotExist:
                    continue

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """
        Get expense analytics and insights.
        """
        tenant = request.user.tenant
        expenses = Expense.objects.filter(tenant=tenant)
        
        # Total expenses
        total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        # Expenses by category
        category_breakdown = expenses.values('category__name').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')
        
        # Monthly spending trends
        monthly_trends = expenses.values('date__year', 'date__month').annotate(
            total=Sum('amount')
        ).order_by('date__year', 'date__month')
        
        # Top vendors
        top_vendors = expenses.values('vendor').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).filter(vendor__isnull=False).order_by('-total')[:10]
        
        # Payment method breakdown
        payment_methods = expenses.values('payment_method').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')
        
        analytics = {
            'total_expenses': total_expenses,
            'category_breakdown': list(category_breakdown),
            'monthly_trends': list(monthly_trends),
            'top_vendors': list(top_vendors),
            'payment_methods': list(payment_methods),
            'recurring_expenses': expenses.filter(is_recurring=True).aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00')
        }
        
        return Response(analytics)


class BudgetGoalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing budget goals and ROI tracking.
    """
    queryset = BudgetGoal.objects.all()
    serializer_class = BudgetGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BudgetGoal.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

    def perform_update(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class BudgetForecastViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing budget forecasts and scenario analysis.
    """
    queryset = BudgetForecast.objects.all()
    serializer_class = BudgetForecastSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BudgetForecast.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

    def perform_update(self, serializer):
        serializer.save(tenant=self.request.tenant)


class PecuniaRecommendationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Pecunia AI recommendations.
    """
    queryset = PecuniaRecommendation.objects.all()
    serializer_class = PecuniaRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PecuniaRecommendation.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

    def perform_update(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=True, methods=['post'])
    def implement(self, request, pk=None):
        """
        Mark a recommendation as implemented.
        """
        recommendation = self.get_object()
        implementation_notes = request.data.get('implementation_notes', '')
        
        recommendation.is_implemented = True
        recommendation.implemented_at = timezone.now()
        recommendation.implementation_notes = implementation_notes
        recommendation.save()
        
        serializer = self.get_serializer(recommendation)
        return Response(serializer.data)
