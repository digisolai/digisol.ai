from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BudgetCategoryViewSet, BudgetViewSet, ExpenseViewSet,
    BudgetGoalViewSet, BudgetForecastViewSet, PecuniaRecommendationViewSet
)

router = DefaultRouter()
router.register(r'categories', BudgetCategoryViewSet, basename='budget-category')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'goals', BudgetGoalViewSet, basename='budget-goal')
router.register(r'forecasts', BudgetForecastViewSet, basename='budget-forecast')
router.register(r'recommendations', PecuniaRecommendationViewSet, basename='pecunia-recommendation')

urlpatterns = [
    path('', include(router.urls)),
] 