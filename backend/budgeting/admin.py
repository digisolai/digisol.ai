from django.contrib import admin
from .models import BudgetCategory, Budget, Expense


@admin.register(BudgetCategory)
class BudgetCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant', 'created_at']
    list_filter = ['tenant', 'created_at']
    search_fields = ['name', 'description', 'tenant__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['name']


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant', 'amount', 'spent_amount', 'remaining_amount', 'spending_percentage', 'is_active', 'start_date', 'end_date']
    list_filter = ['is_active', 'tenant', 'category', 'start_date', 'end_date']
    search_fields = ['name', 'tenant__name', 'category__name']
    readonly_fields = ['id', 'spent_amount', 'remaining_amount', 'spending_percentage', 'created_at', 'updated_at']
    ordering = ['-start_date']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['description', 'budget', 'amount', 'date', 'category', 'tenant']
    list_filter = ['date', 'category', 'tenant', 'budget']
    search_fields = ['description', 'notes', 'budget__name', 'tenant__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-date']
