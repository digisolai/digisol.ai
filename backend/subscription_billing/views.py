import stripe
from django.conf import settings
from rest_framework import viewsets, status, permissions
from core.permissions import DigiSolAdminOrAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from datetime import datetime, timedelta
import stripe
from django.conf import settings
from .models import SubscriptionPlan, Customer, Subscription, PaymentTransaction, UsageTracking
from .serializers import (
    SubscriptionPlanSerializer, CustomerSerializer, SubscriptionSerializer,
    PaymentTransactionSerializer, CurrentPlanSerializer
)
from accounts.models import CustomUser

stripe.api_key = settings.STRIPE_SECRET_KEY


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows Subscription Plans to be viewed.
    Only superusers can create, update, or delete plans.
    """
    queryset = SubscriptionPlan.objects.all().order_by('monthly_cost')
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny] # Allow anyone to view plans
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['support_level']
    search_fields = ['name', 'description']
    ordering_fields = ['monthly_cost']
    ordering = ['monthly_cost']

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser] # Only Django admin can manage plans
        else:
            permission_classes = [permissions.AllowAny] # Allow all to list/retrieve
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def create_stripe_products_and_prices(self, request):
        """
        Creates Stripe Products and Prices for all SubscriptionPlans.
        This should be run once or whenever plans change.
        """
        created_prices = []
        for plan in self.get_queryset():
            if not plan.stripe_price_id:
                try:
                    # Create Stripe Product (if it doesn't exist for the plan name)
                    product = stripe.Product.create(
                        name=plan.name,
                        description=plan.description or f"DigiSol.AI {plan.name} Plan",
                        type='service'
                    )
                    # Create Stripe Price
                    price = stripe.Price.create(
                        product=product.id,
                        unit_amount=int(plan.monthly_cost * 100), # Amount in cents
                        currency='usd',
                        recurring={"interval": "month"},
                    )
                    plan.stripe_price_id = price.id
                    plan.save()
                    created_prices.append({'plan': plan.name, 'price_id': price.id, 'product_id': product.id})
                except stripe.error.StripeError as e:
                    return Response({'error': str(e), 'plan': plan.name}, status=status.HTTP_400_BAD_REQUEST)
            else:
                created_prices.append({'plan': plan.name, 'price_id': plan.stripe_price_id, 'status': 'already exists'})
        return Response(created_prices, status=status.HTTP_200_OK)


class CustomerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Customer records to be viewed or edited.
    Managed internally, mainly for linking Users to Stripe Customer IDs.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user']
    search_fields = ['user__email', 'stripe_customer_id']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        # Only allow superusers to see all customers
        if self.request.user.is_superuser:
            return Customer.objects.all()
        # Regular users can only see their own customer record
        return Customer.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # When creating a customer, link it to the current user
        with transaction.atomic():
            user = self.request.user
            
            # Check if Customer already exists for this user
            if Customer.objects.filter(user=user).exists():
                raise serializers.ValidationError("A customer record already exists for this user.")

            customer = serializer.save(user=user)
            
            # Create Stripe Customer
            if not customer.stripe_customer_id:
                try:
                    stripe_customer = stripe.Customer.create(
                        name=f"{user.first_name} {user.last_name}",
                        email=user.email,
                        metadata={'user_id': str(user.id)}
                    )
                    customer.stripe_customer_id = stripe_customer.id
                    customer.save()
                except stripe.error.StripeError as e:
                    raise serializers.ValidationError(f"Failed to create Stripe customer: {str(e)}")


class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Subscription records to be viewed or edited.
    """
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'plan', 'cancel_at_period_end']
    search_fields = ['plan__name', 'stripe_subscription_id']
    ordering_fields = ['created_at', 'current_period_start']
    ordering = ['-created_at']

    def get_queryset(self):
        # Only allow superusers to see all subscriptions
        if self.request.user.is_superuser:
            return Subscription.objects.all()
        # Regular users only see their own subscription
        return Subscription.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # When creating a subscription, link it to the current user
        serializer.save(user=self.request.user)


class PaymentTransactionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Payment Transaction records to be viewed.
    """
    queryset = PaymentTransaction.objects.all()
    serializer_class = PaymentTransactionSerializer
    permission_classes = [DigiSolAdminOrAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'currency']
    search_fields = ['stripe_payment_intent_id']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']

    def get_queryset(self):
        # Only allow superusers to see all transactions
        if self.request.user.is_superuser:
            return PaymentTransaction.objects.all()
        # Regular users only see their own transactions
        return PaymentTransaction.objects.filter(subscription__user=self.request.user)


class StripeWebhookViewSet(viewsets.ViewSet):
    """
    Handle Stripe webhooks for subscription events.
    """
    permission_classes = []  # No authentication for webhooks

    @action(detail=False, methods=['post'])
    def stripe_webhook(self, request):
        """
        Handle Stripe webhook events for subscription management.
        """
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

        event_data = event['data']['object']
        
        if event['type'] == 'customer.subscription.created':
            self._handle_subscription_created(event_data)
        elif event['type'] == 'customer.subscription.updated':
            self._handle_subscription_updated(event_data)
        elif event['type'] == 'customer.subscription.deleted':
            self._handle_subscription_deleted(event_data)
        elif event['type'] == 'invoice.payment_succeeded':
            self._handle_payment_succeeded(event_data)
        elif event['type'] == 'invoice.payment_failed':
            self._handle_payment_failed(event_data)

        return Response({'status': 'success'})

    def _handle_subscription_created(self, event_data):
        """Handle subscription creation event."""
        try:
            # Get user from metadata
            user_id = event_data['metadata'].get('user_id')
            user = CustomUser.objects.get(id=user_id)
            
            # Get or create customer
            customer, created = Customer.objects.get_or_create(
                user=user,
                defaults={'stripe_customer_id': event_data['customer']}
            )
            
            # Get plan
            plan = SubscriptionPlan.objects.get(stripe_price_id=event_data['items']['data'][0]['price']['id'])
            
            # Create subscription
            subscription = Subscription.objects.create(
                customer=customer,
                plan=plan,
                user=user,
                stripe_subscription_id=event_data['id'],
                status=event_data['status'],
                current_period_start=datetime.fromtimestamp(event_data['current_period_start']),
                current_period_end=datetime.fromtimestamp(event_data['current_period_end'])
            )
            
        except Exception as e:
            print(f"Error handling subscription created: {e}")

    def _handle_subscription_updated(self, event_data):
        """Handle subscription update event."""
        try:
            subscription = Subscription.objects.get(stripe_subscription_id=event_data['id'])
            subscription.status = event_data['status']
            subscription.current_period_start = datetime.fromtimestamp(event_data['current_period_start'])
            subscription.current_period_end = datetime.fromtimestamp(event_data['current_period_end'])
            subscription.cancel_at_period_end = event_data.get('cancel_at_period_end', False)
            subscription.save()
        except Subscription.DoesNotExist:
            pass

    def _handle_subscription_deleted(self, event_data):
        """Handle subscription deletion event."""
        try:
            subscription = Subscription.objects.get(stripe_subscription_id=event_data['id'])
            subscription.status = 'canceled'
            subscription.save()
        except Subscription.DoesNotExist:
            pass

    def _handle_payment_succeeded(self, event_data):
        """Handle successful payment event."""
        try:
            subscription = Subscription.objects.get(stripe_subscription_id=event_data['subscription'])
            
            # Create payment transaction record
            PaymentTransaction.objects.create(
                subscription=subscription,
                stripe_payment_intent_id=event_data.get('payment_intent'),
                amount=event_data['amount_paid'] / 100,  # Convert from cents
                currency=event_data['currency'],
                status='succeeded',
                payment_method=event_data.get('payment_method_types', [None])[0]
            )
        except Subscription.DoesNotExist:
            pass

    def _handle_payment_failed(self, event_data):
        """Handle failed payment event."""
        try:
            subscription = Subscription.objects.get(stripe_subscription_id=event_data['subscription'])
            
            # Create payment transaction record
            PaymentTransaction.objects.create(
                subscription=subscription,
                stripe_payment_intent_id=event_data.get('payment_intent'),
                amount=event_data['amount_due'] / 100,  # Convert from cents
                currency=event_data['currency'],
                status='failed',
                payment_method=event_data.get('payment_method_types', [None])[0]
            )
        except Subscription.DoesNotExist:
            pass


class SubscriptionManagementViewSet(viewsets.ViewSet):
    """
    API endpoints for subscription management actions.
    """
    permission_classes = [DigiSolAdminOrAuthenticated]

    @action(detail=False, methods=['post'])
    def create_subscription(self, request):
        """
        Create a new subscription for the authenticated user.
        """
        user = request.user
        plan_id = request.data.get('plan_id')
        
        if not plan_id:
            return Response({"detail": "Plan ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            plan = SubscriptionPlan.objects.get(id=plan_id)
        except SubscriptionPlan.DoesNotExist:
            return Response({"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Get or create customer
        customer, created = Customer.objects.get_or_create(user=user)
        
        if not customer.stripe_customer_id:
            try:
                stripe_customer = stripe.Customer.create(
                    name=f"{user.first_name} {user.last_name}",
                    email=user.email,
                    metadata={'user_id': str(user.id)}
                )
                customer.stripe_customer_id = stripe_customer.id
                customer.save()
            except stripe.error.StripeError as e:
                return Response({"detail": f"Failed to create Stripe customer: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create Stripe subscription
        try:
            stripe_subscription = stripe.Subscription.create(
                customer=customer.stripe_customer_id,
                items=[{'price': plan.stripe_price_id}],
                metadata={ # Pass user_id to webhook for linking
                    'user_id': str(user.id),
                }
            )
            
            return Response({
                'subscription_id': stripe_subscription.id,
                'client_secret': stripe_subscription.latest_invoice.payment_intent.client_secret if stripe_subscription.latest_invoice.payment_intent else None
            }, status=status.HTTP_201_CREATED)
            
        except stripe.error.StripeError as e:
            return Response({"detail": f"Failed to create subscription: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def cancel_subscription(self, request):
        """
        Cancel the user's current subscription.
        """
        user = request.user
        
        try:
            subscription = Subscription.objects.get(user=user, status__in=['active', 'trialing'])
        except Subscription.DoesNotExist:
            return Response({"detail": "No active subscription found."}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            # Cancel at period end
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=True
            )
            
            subscription.cancel_at_period_end = True
            subscription.save()
            
            return Response({"detail": "Subscription will be canceled at the end of the current period."}, status=status.HTTP_200_OK)
            
        except stripe.error.StripeError as e:
            return Response({"detail": f"Failed to cancel subscription: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def current_plan(self, request):
        """
        Returns the authenticated user's current plan and usage details.
        """
        user = request.user
        
        # Get or create usage tracking
        usage_tracking, created = UsageTracking.objects.get_or_create(
            user=user,
            defaults={
                'current_period_end': timezone.now() + timedelta(days=30)
            }
        )
        
        # Check if user has an active subscription
        try:
            subscription = Subscription.objects.get(user=user, status__in=['active', 'trialing'])
            plan = subscription.plan
        except Subscription.DoesNotExist:
            # Return free plan details
            return Response({
                "plan_name": "Free",
                "subscription_status": "no_subscription",
                "features": {
                    "contacts_limit": 100,
                    "emails_limit": 1000,
                    "ai_text_credits": 100,
                    "ai_image_credits": 5,
                    "ai_planning_requests": 2,
                },
                "usage": {
                    "contacts_used_current_period": usage_tracking.contacts_used_current_period or 0,
                    "emails_sent_current_period": usage_tracking.emails_sent_current_period or 0,
                    "ai_text_credits_used_current_period": usage_tracking.ai_text_credits_used_current_period or 0,
                    "ai_image_credits_used_current_period": usage_tracking.ai_image_credits_used_current_period or 0,
                    "ai_planning_requests_used_current_period": usage_tracking.ai_planning_requests_used_current_period or 0,
                },
                "remaining": {
                    "remaining_text_credits": max(0, 100 - (usage_tracking.ai_text_credits_used_current_period or 0)),
                    "remaining_image_credits": max(0, 5 - (usage_tracking.ai_image_credits_used_current_period or 0)),
                    "remaining_planning_requests": max(0, 2 - (usage_tracking.ai_planning_requests_used_current_period or 0)),
                    "remaining_contacts": max(0, 100 - (usage_tracking.contacts_used_current_period or 0)),
                    "remaining_emails": max(0, 1000 - (usage_tracking.emails_sent_current_period or 0)),
                }
            }, status=status.HTTP_200_OK)
        
        # Return paid plan details
        return Response({
            "plan_name": plan.name,
            "subscription_status": subscription.status,
            "features": {
                "contacts_limit": plan.contact_limit,
                "emails_limit": plan.email_send_limit,
                "ai_text_credits": plan.ai_text_credits_per_month,
                "ai_image_credits": plan.ai_image_credits_per_month,
                "ai_planning_requests": plan.ai_planning_requests_per_month,
                "includes_design_studio": plan.includes_design_studio,
                "includes_ai_agents": plan.includes_ai_agents,
                "includes_analytics": plan.includes_analytics,
                "includes_automations": plan.includes_automations,
                "includes_integrations": plan.includes_integrations,
                "includes_learning_center": plan.includes_learning_center,
                "includes_project_management": plan.includes_project_management,
                "includes_team_collaboration": plan.includes_team_collaboration,
                "includes_white_label": plan.includes_white_label,
            },
            "usage": {
                "contacts_used_current_period": usage_tracking.contacts_used_current_period or 0,
                "emails_sent_current_period": usage_tracking.emails_sent_current_period or 0,
                "ai_text_credits_used_current_period": usage_tracking.ai_text_credits_used_current_period or 0,
                "ai_image_credits_used_current_period": usage_tracking.ai_image_credits_used_current_period or 0,
                "ai_planning_requests_used_current_period": usage_tracking.ai_planning_requests_used_current_period or 0,
            },
            "remaining": {
                "remaining_text_credits": max(0, plan.ai_text_credits_per_month - (usage_tracking.ai_text_credits_used_current_period or 0)),
                "remaining_image_credits": max(0, plan.ai_image_credits_per_month - (usage_tracking.ai_image_credits_used_current_period or 0)),
                "remaining_planning_requests": max(0, plan.ai_planning_requests_per_month - (usage_tracking.ai_planning_requests_used_current_period or 0)),
                "remaining_contacts": max(0, plan.contact_limit - (usage_tracking.contacts_used_current_period or 0)) if plan.contact_limit > 0 else -1,
                "remaining_emails": max(0, plan.email_send_limit - (usage_tracking.emails_sent_current_period or 0)) if plan.email_send_limit > 0 else -1,
            }
        }, status=status.HTTP_200_OK)
