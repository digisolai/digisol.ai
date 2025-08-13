# Tenant System Simplification Plan

## Current Problems
- Over-engineered multi-tenant architecture for a marketing platform
- Complex tenant-aware managers and middleware
- Subscription tied to tenants instead of users
- Unnecessary complexity for individual users and small teams

## Proposed Solution: User-Centric Model

### 1. Remove Tenant Model
- Eliminate the `Tenant` model entirely
- Remove all `tenant` foreign key fields from models
- Remove `TenantAwareManager` and related middleware

### 2. User-Centric Subscriptions
- Move subscription logic to user level
- Each user has their own subscription plan
- Simplify billing to per-user pricing

### 3. Simplified Organization Structure
- Keep `Department` and `Team` models but make them optional
- Users can optionally join departments/teams
- No tenant requirement for basic functionality

### 4. Feature Access Control
- Use subscription plans to control feature access
- Role-based permissions within user's organization
- Simple user roles: Admin, Manager, User

## Migration Steps

### Phase 1: Database Schema Changes
1. Create new models without tenant fields
2. Create data migration scripts
3. Update all foreign key relationships

### Phase 2: Backend Changes
1. Remove tenant middleware
2. Update all views and serializers
3. Simplify authentication logic
4. Update subscription billing

### Phase 3: Frontend Changes
1. Remove tenant_id from user context
2. Update all API calls
3. Simplify UI components
4. Update routing and permissions

### Phase 4: Testing & Deployment
1. Comprehensive testing
2. Data migration validation
3. Gradual rollout

## Benefits
- **Simpler architecture**: Easier to maintain and debug
- **Better UX**: No confusing tenant concepts
- **Scalable**: Works for individuals and teams
- **Cost-effective**: Simpler infrastructure
- **Faster development**: Less complexity in new features

## Models to Update
- CustomUser (remove tenant field)
- Subscription (user-based instead of tenant-based)
- Campaign (user-based)
- Contact (user-based)
- AIProfile (user-based or global)
- Integration (user-based)
- Project (user-based)
- All other models with tenant relationships

## New User Roles
- **Individual**: Single user with personal subscription
- **Team Admin**: Can invite team members, manage billing
- **Team Member**: Access to shared resources within team
- **Superuser**: Platform administration

This simplification will make the platform much more user-friendly and easier to maintain while still supporting team collaboration when needed.
