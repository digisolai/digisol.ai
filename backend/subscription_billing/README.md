# Subscription & Billing System

This Django app provides a comprehensive subscription and billing system for DigiSol.AI, supporting multi-tenancy and Stripe integration.

## Models

### SubscriptionPlan
- Defines available subscription tiers with feature limits
- Includes pricing, feature allocations, and corporate suite gating
- Global plans available to all tenants

### Customer
- Links users/tenants to Stripe customer records
- Supports both individual user and tenant-level billing
- Global management for Stripe customer operations

### Subscription
- Tracks active subscriptions for tenants
- Links to Stripe subscription records
- Tenant-aware with proper multi-tenancy support
- Supports various subscription statuses (active, trialing, past_due, etc.)

### PaymentTransaction
- Records all payment transactions
- Links to Stripe charge records
- Supports different transaction types (subscription, credits, etc.)
- Tenant-aware for proper data isolation

## Features

### Subscription Plans
- **Starter**: $29/month - 1,000 contacts, 5,000 emails, 100 AI text credits
- **Professional**: $99/month - 10,000 contacts, 50,000 emails, 500 AI text credits
- **Business**: $299/month - 50,000 contacts, 250,000 emails, 2,000 AI text credits
- **Enterprise**: $999/month - Unlimited contacts/emails, 10,000 AI text credits

### Feature Limits
- Contact management limits
- Email sending limits
- AI text generation credits
- AI image generation credits
- AI planning request limits
- User seat allocations
- Support level tiers

### Corporate Suite Gating
- Business and Enterprise plans include corporate suite features
- Feature access controlled by subscription plan

## API Endpoints

### Subscription Plans
- `GET /api/billing/subscription-plans/` - List available plans
- `GET /api/billing/subscription-plans/{id}/` - Get plan details
- `GET /api/billing/subscription-plans/available_plans/` - Get plans for current tenant

### Customers
- `GET /api/billing/customers/` - List customers (filtered by user/tenant)
- `POST /api/billing/customers/` - Create customer record
- `GET /api/billing/customers/my_customer/` - Get current user's customer record

### Subscriptions
- `GET /api/billing/subscriptions/` - List subscriptions (filtered by tenant)
- `POST /api/billing/subscriptions/` - Create subscription
- `GET /api/billing/subscriptions/my_subscription/` - Get current tenant's active subscription
- `POST /api/billing/subscriptions/{id}/cancel/` - Cancel subscription at period end
- `POST /api/billing/subscriptions/{id}/reactivate/` - Reactivate subscription

### Payment Transactions
- `GET /api/billing/payment-transactions/` - List transactions (filtered by tenant)
- `GET /api/billing/payment-transactions/my_transactions/` - Get current tenant's transactions

## Utility Functions

The `utils.py` module provides helper functions:

- `get_active_subscription(tenant)` - Get tenant's active subscription
- `get_subscription_limits(tenant)` - Get current plan limits
- `check_feature_access(tenant, feature_name)` - Check feature access
- `get_usage_period_dates(tenant)` - Get billing period dates
- `is_subscription_expiring_soon(tenant)` - Check if subscription expires soon
- `create_customer_for_user(user, tenant)` - Create customer record
- `get_subscription_summary(tenant)` - Get comprehensive subscription summary

## Setup

1. **Install the app**:
   ```bash
   python manage.py startapp subscription_billing
   ```

2. **Add to INSTALLED_APPS**:
   ```python
   'subscription_billing.apps.SubscriptionBillingConfig',
   ```

3. **Run migrations**:
   ```bash
   python manage.py makemigrations subscription_billing
   python manage.py migrate subscription_billing
   ```

4. **Create default plans**:
   ```bash
   python manage.py create_default_subscription_plans
   ```

5. **Add URLs**:
   ```python
   path('api/billing/', include('subscription_billing.urls')),
   ```

## Stripe Integration

The system is designed to integrate with Stripe:

- `stripe_customer_id` field for customer linking
- `stripe_subscription_id` field for subscription linking
- `stripe_charge_id` field for payment tracking
- `stripe_price_id` field for plan pricing

## Multi-Tenancy Support

- All models use proper tenant filtering
- `TenantAwareManager` for automatic tenant filtering
- Customer records can link to both users and tenants
- Subscription records directly link to tenants

## Admin Interface

Comprehensive Django admin interface with:

- Subscription plan management with feature limits
- Customer record management
- Subscription status tracking
- Payment transaction history
- Filtering and search capabilities

## Usage Examples

### Check Feature Access
```python
from subscription_billing.utils import check_feature_access

if check_feature_access(user.tenant, 'corporate_suite'):
    # Show corporate features
    pass
```

### Get Subscription Summary
```python
from subscription_billing.utils import get_subscription_summary

summary = get_subscription_summary(user.tenant)
if summary['has_subscription']:
    print(f"Plan: {summary['plan_name']}")
    print(f"Cost: ${summary['plan_cost']}/month")
    print(f"Days until expiry: {summary['days_until_expiry']}")
```

### Create Customer Record
```python
from subscription_billing.utils import create_customer_for_user

customer = create_customer_for_user(user)
```

## Security & Permissions

- All endpoints require authentication
- Users can only access their own customer records
- Tenants can only access their own subscriptions and transactions
- Superusers have full access to all records
- Proper tenant filtering on all querysets 