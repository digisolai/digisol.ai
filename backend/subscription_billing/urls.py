from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SubscriptionPlanViewSet, CustomerViewSet, SubscriptionViewSet, 
    PaymentTransactionViewSet, StripeWebhookView, 
    CreateCheckoutSessionView, CreateCustomerPortalSessionView, CurrentPlanView
)

# Create a router for the billing app
router = DefaultRouter()
router.register(r'plans', SubscriptionPlanViewSet, basename='subscription-plan')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'transactions', PaymentTransactionViewSet, basename='payment-transaction')

app_name = 'subscription_billing'

urlpatterns = [
    path('', include(router.urls)),
    path('stripe-webhooks/', StripeWebhookView.as_view(), name='stripe-webhooks'),
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('create-customer-portal-session/', CreateCustomerPortalSessionView.as_view(), name='create-customer-portal-session'),
    path('current-plan/', CurrentPlanView.as_view(), name='current-plan'),
] 