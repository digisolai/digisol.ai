import stripe
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone # Import timezone for current time
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework import serializers

from .models import SubscriptionPlan, Customer, Subscription, PaymentTransaction
from .serializers import (
    SubscriptionPlanSerializer, CustomerSerializer, SubscriptionSerializer, 
    PaymentTransactionSerializer, CurrentPlanSerializer
)
from core.models import Tenant # For linking to tenant and CustomUser
from core.models import CustomUser # For linking to CustomUser
from core.admin_access import is_digisol_admin, get_digisol_admin_plan


# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows Subscription Plans to be viewed.
    Only superusers can create, update, or delete plans.
    """
    queryset = SubscriptionPlan.objects.filter(is_active=True).order_by('monthly_cost')
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny] # Allow anyone to view plans
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['support_level']
    search_fields = ['name', 'description']
    ordering_fields = ['monthly_cost', 'created_at']
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
    Managed internally, mainly for linking Users/Tenants to Stripe Customer IDs.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated] # Or IsAdminUser for full CRUD
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user', 'tenant']
    search_fields = ['user__email', 'tenant__name', 'stripe_customer_id']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        # Only allow superusers to see all customers
        if self.request.user.is_superuser:
            return Customer.objects.all()
        # Regular users can only see their own customer record (if linked)
        return Customer.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # When creating a customer, link it to the current user's tenant if not already linked
        with transaction.atomic():
            user = self.request.user
            tenant = user.tenant
            
            if not tenant:
                raise serializers.ValidationError("User must be associated with a tenant to create a customer.")
            
            # Check if Customer already exists for this tenant
            if Customer.objects.filter(tenant=tenant).exists():
                raise serializers.ValidationError("A customer record already exists for this tenant.")

            customer = serializer.save(user=user, tenant=tenant)
            
            # Create Stripe Customer
            if not customer.stripe_customer_id:
                try:
                    stripe_customer = stripe.Customer.create(
                        email=user.email,
                        name=f"{user.first_name} {user.last_name} ({tenant.name})",
                        metadata={'tenant_id': str(tenant.id), 'user_id': str(user.id)}
                    )
                    customer.stripe_customer_id = stripe_customer.id
                    customer.save()
                except stripe.error.StripeError as e:
                    raise serializers.ValidationError({'stripe_error': str(e)})


class SubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows Subscriptions to be viewed.
    """
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'plan', 'tenant', 'cancel_at_period_end']
    search_fields = ['tenant__name', 'plan__name', 'stripe_subscription_id']
    ordering_fields = ['created_at', 'current_period_end']
    ordering = ['-created_at']

    def get_queryset(self):
        # Only allow superusers to see all subscriptions
        if self.request.user.is_superuser:
            return Subscription.objects.all()
        # Regular users only see subscriptions for their tenant
        return Subscription.objects.filter(tenant=self.request.user.tenant)

    @action(detail=False, methods=['get'])
    def my_subscription(self, request):
        """Get the current user's active subscription"""
        subscription = Subscription.objects.filter(
            tenant=request.user.tenant,
            status__in=['active', 'trialing']
        ).first()
        if subscription:
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        return Response({'detail': 'No active subscription found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a subscription at period end"""
        subscription = self.get_object()
        subscription.cancel_at_period_end = True
        subscription.save()
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reactivate(self, request, pk=None):
        """Reactivate a subscription that was set to cancel"""
        subscription = self.get_object()
        subscription.cancel_at_period_end = False
        subscription.save()
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)


class PaymentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows Payment Transactions to be viewed.
    """
    queryset = PaymentTransaction.objects.all()
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'transaction_type', 'currency', 'tenant']
    search_fields = ['stripe_charge_id', 'tenant__name']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']

    def get_queryset(self):
        # Only allow superusers to see all transactions
        if self.request.user.is_superuser:
            return PaymentTransaction.objects.all()
        # Regular users only see transactions for their tenant
        return PaymentTransaction.objects.filter(tenant=self.request.user.tenant)

    @action(detail=False, methods=['get'])
    def my_transactions(self, request):
        """Get the current user's payment transactions"""
        transactions = self.get_queryset()
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)


class StripeWebhookView(APIView):
    """
    Handles Stripe Webhook events.
    This endpoint must be publicly accessible and configured in Stripe.
    """
    permission_classes = [] # No authentication needed for webhooks
    authentication_classes = [] # No authentication needed for webhooks

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError as e:
            # Invalid payload
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle the event
        event_type = event['type']
        event_data = event['data']['object']
        
        try:
            with transaction.atomic():
                if event_type == 'customer.created':
                    customer_id = event_data['id']
                    # Find or create local Customer object
                    Customer.objects.update_or_create(
                        stripe_customer_id=customer_id,
                        defaults={
                            'email': event_data.get('email'),
                            'name': event_data.get('name'),
                            # Link to user/tenant based on metadata if possible
                            # For simplicity, handle linking when user subscribes via checkout session
                        }
                    )
                    
                elif event_type == 'customer.subscription.created' or \
                     event_type == 'customer.subscription.updated':
                    subscription_id = event_data['id']
                    customer_id = event_data['customer']
                    plan_id = event_data['plan']['id'] # Stripe Price ID
                    
                    # Get associated local objects
                    customer = Customer.objects.get(stripe_customer_id=customer_id)
                    subscription_plan = SubscriptionPlan.objects.get(stripe_price_id=plan_id)
                    tenant_id = event_data['metadata'].get('tenant_id') # Get tenant_id from metadata
                    tenant = Tenant.objects.get(id=tenant_id)
                    
                    subscription, created = Subscription.objects.update_or_create(
                        stripe_subscription_id=subscription_id,
                        defaults={
                            'customer': customer,
                            'plan': subscription_plan,
                            'tenant': tenant,
                            'status': event_data['status'],
                            'current_period_start': timezone.datetime.fromtimestamp(event_data['current_period_start']),
                            'current_period_end': timezone.datetime.fromtimestamp(event_data['current_period_end']),
                            'cancel_at_period_end': event_data['cancel_at_period_end'],
                        }
                    )
                    
                    # Link subscription to tenant if not already linked
                    if not tenant.active_subscription:
                        tenant.active_subscription = subscription
                        tenant.save()

                elif event_type == 'customer.subscription.deleted':
                    subscription_id = event_data['id']
                    subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
                    subscription.status = 'canceled'
                    subscription.save()
                    # Also unlink from tenant if this was the active subscription
                    tenant = subscription.tenant
                    if tenant.active_subscription == subscription:
                        tenant.active_subscription = None
                        tenant.save()

                elif event_type == 'invoice.payment_succeeded':
                    # Record payment transaction
                    charge_id = event_data['charge']
                    amount = event_data['amount_paid'] / 100 # In dollars
                    customer_id = event_data['customer']
                    subscription_id = event_data.get('subscription')
                    
                    customer = Customer.objects.get(stripe_customer_id=customer_id)
                    subscription = Subscription.objects.get(stripe_subscription_id=subscription_id) if subscription_id else None
                    tenant = subscription.tenant if subscription else (customer.tenant if customer.tenant else None)
                    
                    PaymentTransaction.objects.create(
                        tenant=tenant,
                        customer=customer,
                        subscription=subscription,
                        stripe_charge_id=charge_id,
                        amount=amount,
                        currency=event_data['currency'],
                        status='succeeded',
                        transaction_type='subscription' if subscription else 'other'
                    )

                elif event_type == 'invoice.payment_failed':
                    # Notify user, etc.
                    pass

                # Add more event types as needed
                
                return Response(status=status.HTTP_200_OK)

        except Exception as e:
            # Log specific errors for debugging
            print(f"Webhook error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST) # Bad request for unexpected errors


class CreateCheckoutSessionView(APIView):
    """
    Creates a Stripe Checkout Session for a new subscription.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        tenant = user.tenant
        
        if not tenant:
            return Response({"detail": "User must belong to a tenant."}, status=status.HTTP_400_BAD_REQUEST)
        
        price_id = request.data.get('price_id') # Stripe Price ID from frontend
        
        if not price_id:
            return Response({"detail": "Price ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get or create Stripe Customer
            customer, created = Customer.objects.get_or_create(tenant=tenant, defaults={'user': user})
            if not customer.stripe_customer_id:
                stripe_customer = stripe.Customer.create(
                    email=user.email,
                    name=f"{user.first_name} {user.last_name} ({tenant.name})",
                    metadata={'tenant_id': str(tenant.id), 'user_id': str(user.id)}
                )
                customer.stripe_customer_id = stripe_customer.id
                customer.save()
            
            # Create Checkout Session
            checkout_session = stripe.checkout.Session.create(
                customer=customer.stripe_customer_id,
                line_items=[
                    {
                        'price': price_id,
                        'quantity': 1,
                    },
                ],
                mode='subscription',
                success_url='http://localhost:5173/dashboard?session_id={CHECKOUT_SESSION_ID}', # Redirect back to frontend
                cancel_url='http://localhost:5173/billing?canceled=true',
                metadata={ # Pass tenant_id to webhook for linking
                    'tenant_id': str(tenant.id),
                    'user_id': str(user.id)
                }
            )
            return Response({'session_url': checkout_session.url}, status=status.HTTP_200_OK)
        
        except stripe.error.StripeError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': 'An internal server error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateCustomerPortalSessionView(APIView):
    """
    Creates a Stripe Customer Portal Session.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        tenant = user.tenant
        
        if not tenant or not tenant.billing_customer_tenant or not tenant.billing_customer_tenant.stripe_customer_id:
            return Response({"detail": "No Stripe customer found for this tenant."}, status=status.HTTP_400_BAD_REQUEST)
        
        customer_id = tenant.billing_customer_tenant.stripe_customer_id
        
        try:
            portalSession = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url='http://localhost:5173/billing', # Redirect back to frontend
            )
            return Response({'portal_url': portalSession.url}, status=status.HTTP_200_OK)
        except stripe.error.StripeError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': 'An internal server error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CurrentPlanView(APIView):
    """
    Returns the authenticated tenant's current plan and usage details.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests"""
        response = Response(status=200)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response["Access-Control-Max-Age"] = "86400"
        return response
    
    def get(self, request, *args, **kwargs):
        try:
            # PERMANENT DIGISOL.AI ADMIN ACCESS - HARD-CODED
            # This bypasses all subscription checks for DigiSol.AI internal users
            if is_digisol_admin(request.user):
                return Response(get_digisol_admin_plan())
            
            user_tenant = request.user.tenant
            if not user_tenant:
                return Response({"detail": "User not associated with a tenant."}, status=status.HTTP_400_BAD_REQUEST)
            
            # PERMANENT DIGISOL.AI ADMIN ACCESS - HARD-CODED
            # This bypasses all subscription checks for DigiSol.AI internal users
            if is_digisol_admin(request.user):
                return Response(get_digisol_admin_plan())
            
            # Check if tenant has an active subscription
            if not user_tenant.active_subscription:
                # Return response with upgrade prompts instead of hiding features
                return Response({
                    "plan_name": "Free Trial",
                    "subscription_status": "trial",
                    "monthly_cost": "0.00",
                    "annual_cost": "0.00",
                    "description": "Explore all features with limited usage. Upgrade for higher limits and priority support.",
                    "contact_limit": 100,
                    "email_send_limit": 1000,
                    "ai_text_credits_per_month": 100,
                    "ai_image_credits_per_month": 5,
                    "ai_planning_requests_per_month": 2,
                    "user_seats": 1,
                    "support_level": "standard",
                    "contacts_used_current_period": user_tenant.contacts_used_current_period or 0,
                    "emails_sent_current_period": user_tenant.emails_sent_current_period or 0,
                    "ai_text_credits_used_current_period": user_tenant.ai_text_credits_used_current_period or 0,
                    "ai_image_credits_used_current_period": user_tenant.ai_image_credits_used_current_period or 0,
                    "ai_planning_requests_used_current_period": user_tenant.ai_planning_requests_used_current_period or 0,
                    "current_period_end": None,
                    "cancel_at_period_end": False,
                    "remaining_text_credits": max(0, 100 - (user_tenant.ai_text_credits_used_current_period or 0)),
                    "remaining_image_credits": max(0, 5 - (user_tenant.ai_image_credits_used_current_period or 0)),
                    "remaining_planning_requests": max(0, 2 - (user_tenant.ai_planning_requests_used_current_period or 0)),
                    "remaining_contacts": max(0, 100 - (user_tenant.contacts_used_current_period or 0)),
                    "remaining_emails": max(0, 1000 - (user_tenant.emails_sent_current_period or 0)),
                    "is_superuser": False,
                    "show_upgrade_prompt": True
                })
            
            # Try to use the serializer, but catch any errors
            try:
                serializer = CurrentPlanSerializer(user_tenant) 
                data = serializer.data
                data['is_superuser'] = False
                data['show_upgrade_prompt'] = False
                return Response(data)
            except Exception as serializer_error:
                print(f"Serializer error: {serializer_error}")
                # Fallback to manual response
                return Response({
                    "plan_name": user_tenant.active_subscription.plan.name if user_tenant.active_subscription and user_tenant.active_subscription.plan else None,
                    "subscription_status": user_tenant.active_subscription.status if user_tenant.active_subscription else "no_subscription",
                    "monthly_cost": str(user_tenant.active_subscription.plan.monthly_cost) if user_tenant.active_subscription and user_tenant.active_subscription.plan else "0.00",
                    "annual_cost": str(user_tenant.active_subscription.plan.annual_cost) if user_tenant.active_subscription and user_tenant.active_subscription.plan else "0.00",
                    "description": user_tenant.active_subscription.plan.description if user_tenant.active_subscription and user_tenant.active_subscription.plan else "No active subscription",
                    "contact_limit": user_tenant.active_subscription.plan.contact_limit if user_tenant.active_subscription and user_tenant.active_subscription.plan else 0,
                    "email_send_limit": user_tenant.active_subscription.plan.email_send_limit if user_tenant.active_subscription and user_tenant.active_subscription.plan else 0,
                    "ai_text_credits_per_month": user_tenant.active_subscription.plan.ai_text_credits_per_month if user_tenant.active_subscription and user_tenant.active_subscription.plan else 0,
                    "ai_image_credits_per_month": user_tenant.active_subscription.plan.ai_image_credits_per_month if user_tenant.active_subscription and user_tenant.active_subscription.plan else 0,
                    "ai_planning_requests_per_month": user_tenant.active_subscription.plan.ai_planning_requests_per_month if user_tenant.active_subscription and user_tenant.active_subscription.plan else 0,
                    "user_seats": user_tenant.active_subscription.plan.user_seats if user_tenant.active_subscription and user_tenant.active_subscription.plan else 0,
                    "support_level": user_tenant.active_subscription.plan.support_level if user_tenant.active_subscription and user_tenant.active_subscription.plan else "none",
                    "contacts_used_current_period": user_tenant.contacts_used_current_period,
                    "emails_sent_current_period": user_tenant.emails_sent_current_period,
                    "ai_text_credits_used_current_period": user_tenant.ai_text_credits_used_current_period,
                    "ai_image_credits_used_current_period": user_tenant.ai_image_credits_used_current_period,
                    "ai_planning_requests_used_current_period": user_tenant.ai_planning_requests_used_current_period,
                    "current_period_end": user_tenant.active_subscription.current_period_end if user_tenant.active_subscription else None,
                    "cancel_at_period_end": user_tenant.active_subscription.cancel_at_period_end if user_tenant.active_subscription else False,
                    "remaining_text_credits": 0,  # Simplified for now
                    "remaining_image_credits": 0,  # Simplified for now
                    "remaining_planning_requests": 0,  # Simplified for now
                    "remaining_contacts": 0,  # Simplified for now
                    "remaining_emails": 0,  # Simplified for now
                    "is_superuser": False,
                    "show_upgrade_prompt": False
                })
                
        except Exception as e:
            print(f"Error in CurrentPlanView: {e}")
            import traceback
            print(traceback.format_exc())
            return Response({"detail": "An error occurred while fetching plan data."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
