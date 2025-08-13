from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SubscriptionPlanViewSet, CustomerViewSet, SubscriptionViewSet, 
    PaymentTransactionViewSet, StripeWebhookViewSet, SubscriptionManagementViewSet
)

# Create a router for the billing app
router = DefaultRouter()
router.register(r'plans', SubscriptionPlanViewSet, basename='subscription-plan')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'transactions', PaymentTransactionViewSet, basename='payment-transaction')
router.register(r'webhooks', StripeWebhookViewSet, basename='stripe-webhook')
router.register(r'manage', SubscriptionManagementViewSet, basename='subscription-management')

app_name = 'subscription_billing'

urlpatterns = [
    path('', include(router.urls)),
] 