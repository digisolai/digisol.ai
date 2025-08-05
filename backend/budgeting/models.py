import uuid
from decimal import Decimal
from django.db import models
from django.db.models import Sum, Q
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import Tenant
from core.managers import TenantAwareManager


class BudgetCategory(models.Model):
    """
    Budget category model for organizing budgets and expenses.
    Each category belongs to a specific tenant.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)  # e.g., 'Content Marketing', 'Paid Ads', 'SEO'
    description = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=7, default="#3182CE")  # Hex color for UI
    icon = models.CharField(max_length=50, blank=True, null=True)  # Icon identifier
    is_default = models.BooleanField(default=False)  # Default categories for new tenants
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'budget_categories'
        verbose_name = 'Budget Category'
        verbose_name_plural = 'Budget Categories'
        unique_together = ['name', 'tenant']  # Each category name unique per tenant

    def __str__(self):
        return f"{self.name} - {self.tenant.name}"


class Budget(models.Model):
    """
    Enhanced Budget model with advanced features for Pecunia AI integration.
    """
    BUDGET_TYPES = [
        ('annual', 'Annual'),
        ('quarterly', 'Quarterly'),
        ('monthly', 'Monthly'),
        ('campaign', 'Campaign-Specific'),
        ('departmental', 'Departmental'),
        ('project', 'Project-Based'),
        ('custom', 'Custom Period'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('over_budget', 'Over Budget'),
        ('under_budget', 'Under Budget'),
        ('archived', 'Archived'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    budget_type = models.CharField(max_length=20, choices=BUDGET_TYPES, default='custom')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    category = models.ForeignKey(BudgetCategory, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_active = models.BooleanField(default=True)
    
    # Pecunia AI Integration
    pecunia_health_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True, blank=True
    )
    pecunia_recommendations = models.JSONField(default=list, blank=True)
    pecunia_risk_level = models.CharField(
        max_length=20,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')],
        null=True, blank=True
    )
    
    # Goals and Targets
    linked_goals = models.JSONField(default=list, blank=True)  # Array of goal IDs from campaigns
    target_roi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    target_cpa = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Forecasting
    projected_spend = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    projected_variance = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    burn_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Daily spend rate
    
    # Metadata
    description = models.TextField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'budgets'
        verbose_name = 'Budget'
        verbose_name_plural = 'Budgets'
        unique_together = ['name', 'tenant', 'start_date']

    def __str__(self):
        return f"{self.name} - {self.tenant.name}"

    @property
    def spent_amount(self):
        """Calculate total expenses for this budget."""
        total = self.expenses.aggregate(total=Sum('amount'))['total']
        return total or Decimal('0.00')

    @property
    def remaining_amount(self):
        """Calculate remaining budget amount."""
        return self.amount - self.spent_amount

    @property
    def spending_percentage(self):
        """Calculate percentage of budget spent."""
        if self.amount == 0:
            return 0
        return (self.spent_amount / self.amount) * 100

    @property
    def days_elapsed(self):
        """Calculate days elapsed since budget start."""
        from django.utils import timezone
        today = timezone.now().date()
        if today < self.start_date:
            return 0
        return (min(today, self.end_date) - self.start_date).days

    @property
    def total_days(self):
        """Calculate total budget period in days."""
        return (self.end_date - self.start_date).days

    @property
    def time_progress_percentage(self):
        """Calculate percentage of time elapsed."""
        if self.total_days == 0:
            return 0
        return (self.days_elapsed / self.total_days) * 100

    def update_pecunia_health_score(self):
        """Update Pecunia health score based on various factors."""
        score = 100
        
        # Deduct points for over-spending
        if self.spending_percentage > 100:
            score -= min(30, (self.spending_percentage - 100) * 2)
        
        # Deduct points for spending too fast
        if self.time_progress_percentage > 0 and self.spending_percentage > self.time_progress_percentage * 1.2:
            score -= 20
        
        # Add points for good practices
        if self.spending_percentage < 80 and self.time_progress_percentage > 50:
            score += 10
        
        self.pecunia_health_score = max(0, min(100, score))
        self.save(update_fields=['pecunia_health_score'])


class Expense(models.Model):
    """
    Enhanced Expense model with advanced tracking and categorization.
    """
    PAYMENT_METHODS = [
        ('credit_card', 'Credit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('check', 'Check'),
        ('paypal', 'PayPal'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='expenses')
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    category = models.ForeignKey(BudgetCategory, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Enhanced fields
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='other')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='paid')
    vendor = models.CharField(max_length=200, blank=True, null=True)
    invoice_number = models.CharField(max_length=100, blank=True, null=True)
    receipt_url = models.URLField(blank=True, null=True)
    
    # Recurring expense tracking
    is_recurring = models.BooleanField(default=False)
    recurring_frequency = models.CharField(
        max_length=20,
        choices=[
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
            ('quarterly', 'Quarterly'),
            ('yearly', 'Yearly'),
        ],
        null=True, blank=True
    )
    
    # Pecunia AI Integration
    pecunia_auto_categorized = models.BooleanField(default=False)
    pecunia_confidence_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True, blank=True
    )
    
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'expenses'
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.description} - {self.amount} ({self.tenant.name})"


class BudgetGoal(models.Model):
    """
    Model for linking budgets to specific marketing goals and tracking ROI.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='goals')
    
    # Goal details
    goal_name = models.CharField(max_length=200)
    goal_type = models.CharField(
        max_length=50,
        choices=[
            ('leads', 'Lead Generation'),
            ('conversions', 'Conversions'),
            ('revenue', 'Revenue'),
            ('awareness', 'Brand Awareness'),
            ('engagement', 'Engagement'),
            ('custom', 'Custom'),
        ]
    )
    target_value = models.DecimalField(max_digits=12, decimal_places=2)
    current_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit = models.CharField(max_length=50, default='units')  # e.g., 'leads', 'dollars', 'clicks'
    
    # ROI tracking
    roi_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    cpa = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Pecunia AI assessment
    pecunia_feasibility_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True, blank=True
    )
    pecunia_recommendations = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'budget_goals'
        verbose_name = 'Budget Goal'
        verbose_name_plural = 'Budget Goals'

    def __str__(self):
        return f"{self.goal_name} - {self.budget.name}"

    @property
    def progress_percentage(self):
        """Calculate goal progress percentage."""
        if self.target_value == 0:
            return 0
        return min(100, (self.current_value / self.target_value) * 100)


class BudgetForecast(models.Model):
    """
    Model for storing Pecunia's budget forecasts and scenarios.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='forecasts')
    
    # Forecast details
    forecast_date = models.DateField()
    projected_spend = models.DecimalField(max_digits=12, decimal_places=2)
    confidence_level = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Scenario analysis
    scenario_name = models.CharField(max_length=200, blank=True, null=True)
    scenario_type = models.CharField(
        max_length=50,
        choices=[
            ('baseline', 'Baseline'),
            ('optimistic', 'Optimistic'),
            ('pessimistic', 'Pessimistic'),
            ('custom', 'Custom'),
        ],
        default='baseline'
    )
    
    # Factors affecting forecast
    factors = models.JSONField(default=dict, blank=True)  # e.g., {'market_trends': 0.1, 'seasonality': 0.05}
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'budget_forecasts'
        verbose_name = 'Budget Forecast'
        verbose_name_plural = 'Budget Forecasts'
        ordering = ['-forecast_date']

    def __str__(self):
        return f"{self.budget.name} - {self.forecast_date}"


class PecuniaRecommendation(models.Model):
    """
    Model for storing Pecunia AI recommendations and insights.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    
    # Recommendation details
    title = models.CharField(max_length=200)
    description = models.TextField()
    recommendation_type = models.CharField(
        max_length=50,
        choices=[
            ('optimization', 'Budget Optimization'),
            ('risk_alert', 'Risk Alert'),
            ('opportunity', 'Opportunity'),
            ('efficiency', 'Efficiency Improvement'),
            ('savings', 'Cost Savings'),
        ]
    )
    
    # Priority and impact
    priority = models.CharField(
        max_length=20,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')]
    )
    estimated_impact = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    impact_type = models.CharField(
        max_length=20,
        choices=[('savings', 'Savings'), ('revenue', 'Revenue'), ('efficiency', 'Efficiency')],
        null=True, blank=True
    )
    
    # Related entities
    related_budget = models.ForeignKey(Budget, on_delete=models.CASCADE, null=True, blank=True)
    related_expenses = models.ManyToManyField(Expense, blank=True)
    
    # Status tracking
    is_implemented = models.BooleanField(default=False)
    implemented_at = models.DateTimeField(null=True, blank=True)
    implementation_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantAwareManager()

    class Meta:
        db_table = 'pecunia_recommendations'
        verbose_name = 'Pecunia Recommendation'
        verbose_name_plural = 'Pecunia Recommendations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.tenant.name}"
