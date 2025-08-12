# DigiSol.AI API Endpoints Complete List

## 🔗 **Base URL**
- **Production**: `https://digisol-backend.onrender.com/api`
- **Development**: `http://localhost:8000/api`

---

## 🔐 **Authentication Endpoints**

### **Accounts** (`/api/accounts/`)
```
POST   /accounts/token/                    # Login (JWT)
POST   /accounts/token/refresh/            # Refresh JWT token
POST   /accounts/token/verify/             # Verify JWT token
POST   /accounts/register/                 # User registration
GET    /accounts/me/                       # Get current user profile
PUT    /accounts/me/                       # Update user profile
POST   /accounts/password/reset/           # Password reset request
POST   /accounts/password/reset/confirm/   # Password reset confirmation
GET    /accounts/users/                    # List users (admin only)
POST   /accounts/users/                    # Create user (admin only)
GET    /accounts/users/{id}/               # Get user details
PUT    /accounts/users/{id}/               # Update user
DELETE /accounts/users/{id}/               # Delete user
```

---

## 🏢 **Core Management Endpoints**

### **Core** (`/api/core/`)
```
# Health & System
GET    /core/health/                       # Detailed health check
GET    /core/db-health/                    # Database health check
POST   /core/setup/                        # Production setup

# Tenants
GET    /core/tenants/                      # List tenants
POST   /core/tenants/                      # Create tenant
GET    /core/tenants/{id}/                 # Get tenant details
PUT    /core/tenants/{id}/                 # Update tenant
DELETE /core/tenants/{id}/                 # Delete tenant

# Brand Profiles
GET    /core/brand-profiles/               # List brand profiles
POST   /core/brand-profiles/               # Create brand profile
GET    /core/brand-profiles/{id}/          # Get brand profile
PUT    /core/brand-profiles/{id}/          # Update brand profile
DELETE /core/brand-profiles/{id}/          # Delete brand profile

# Contacts
GET    /core/contacts/                     # List contacts
POST   /core/contacts/                     # Create contact
GET    /core/contacts/{id}/                # Get contact details
PUT    /core/contacts/{id}/                # Update contact
DELETE /core/contacts/{id}/                # Delete contact

# Campaigns
GET    /core/campaigns/                    # List campaigns
POST   /core/campaigns/                    # Create campaign
GET    /core/campaigns/{id}/               # Get campaign details
PUT    /core/campaigns/{id}/               # Update campaign
DELETE /core/campaigns/{id}/               # Delete campaign

# Automation Workflows
GET    /core/automation-workflows/         # List workflows
POST   /core/automation-workflows/         # Create workflow
GET    /core/automation-workflows/{id}/    # Get workflow details
PUT    /core/automation-workflows/{id}/    # Update workflow
DELETE /core/automation-workflows/{id}/    # Delete workflow

# Automation Executions
GET    /core/automation-executions/        # List executions
POST   /core/automation-executions/        # Create execution
GET    /core/automation-executions/{id}/   # Get execution details
PUT    /core/automation-executions/{id}/   # Update execution
DELETE /core/automation-executions/{id}/   # Delete execution

# Brand Assets
GET    /core/brand-assets/                 # List brand assets
POST   /core/brand-assets/                 # Create brand asset
GET    /core/brand-assets/{id}/            # Get brand asset
PUT    /core/brand-assets/{id}/            # Update brand asset
DELETE /core/brand-assets/{id}/            # Delete brand asset

# Client Portal
GET    /core/client-portals/               # List client portals
POST   /core/client-portals/               # Create client portal
GET    /core/client-portals/{id}/          # Get client portal
PUT    /core/client-portals/{id}/          # Update client portal
DELETE /core/client-portals/{id}/          # Delete client portal

# Client Users
GET    /core/client-users/                 # List client users
POST   /core/client-users/                 # Create client user
GET    /core/client-users/{id}/            # Get client user
PUT    /core/client-users/{id}/            # Update client user
DELETE /core/client-users/{id}/            # Delete client user

# Client Activities
GET    /core/client-activities/            # List client activities
POST   /core/client-activities/            # Create client activity
GET    /core/client-activities/{id}/       # Get client activity
PUT    /core/client-activities/{id}/       # Update client activity
DELETE /core/client-activities/{id}/       # Delete client activity

# Client Billing
GET    /core/client-billing/               # List client billing
POST   /core/client-billing/               # Create client billing
GET    /core/client-billing/{id}/          # Get client billing
PUT    /core/client-billing/{id}/          # Update client billing
DELETE /core/client-billing/{id}/          # Delete client billing
```

---

## 🤖 **AI Services Endpoints**

### **AI Services** (`/api/ai-services/`)
```
# AI Profiles
GET    /ai-services/ai-profiles/           # List AI profiles
POST   /ai-services/ai-profiles/           # Create AI profile
GET    /ai-services/ai-profiles/{id}/      # Get AI profile
PUT    /ai-services/ai-profiles/{id}/      # Update AI profile
DELETE /ai-services/ai-profiles/{id}/      # Delete AI profile

# AI Tasks
GET    /ai-services/ai-tasks/              # List AI tasks
POST   /ai-services/ai-tasks/              # Create AI task
GET    /ai-services/ai-tasks/{id}/         # Get AI task
PUT    /ai-services/ai-tasks/{id}/         # Update AI task
DELETE /ai-services/ai-tasks/{id}/         # Delete AI task

# AI Recommendations
GET    /ai-services/ai-recommendations/    # List AI recommendations
POST   /ai-services/ai-recommendations/    # Create AI recommendation
GET    /ai-services/ai-recommendations/{id}/ # Get AI recommendation
PUT    /ai-services/ai-recommendations/{id}/ # Update AI recommendation
DELETE /ai-services/ai-recommendations/{id}/ # Delete AI recommendation

# Image Generation
GET    /ai-services/image-generation/      # List image generation requests
POST   /ai-services/image-generation/      # Create image generation request
GET    /ai-services/image-generation/{id}/ # Get image generation request
PUT    /ai-services/image-generation/{id}/ # Update image generation request
DELETE /ai-services/image-generation/{id}/ # Delete image generation request

# AI Chat
POST   /ai-services/chat/                  # AI chat endpoint
POST   /ai-services/chat/stream/           # Streaming AI chat
GET    /ai-services/chat/history/          # Chat history
DELETE /ai-services/chat/history/{id}/     # Delete chat message

# Content Generation
POST   /ai-services/generate-content/      # Generate content
POST   /ai-services/generate-email/        # Generate email content
POST   /ai-services/generate-social/       # Generate social media content
POST   /ai-services/generate-blog/         # Generate blog content
```

---

## 📢 **Campaign Management Endpoints**

### **Campaigns** (`/api/campaigns/`)
```
# Campaigns
GET    /campaigns/                         # List campaigns
POST   /campaigns/                         # Create campaign
GET    /campaigns/{id}/                    # Get campaign details
PUT    /campaigns/{id}/                    # Update campaign
DELETE /campaigns/{id}/                    # Delete campaign

# Campaign Steps
GET    /campaigns/steps/                   # List campaign steps
POST   /campaigns/steps/                   # Create campaign step
GET    /campaigns/steps/{id}/              # Get campaign step
PUT    /campaigns/steps/{id}/              # Update campaign step
DELETE /campaigns/steps/{id}/              # Delete campaign step

# Campaign Executions
GET    /campaigns/executions/              # List campaign executions
POST   /campaigns/executions/              # Create campaign execution
GET    /campaigns/executions/{id}/         # Get campaign execution
PUT    /campaigns/executions/{id}/         # Update campaign execution
DELETE /campaigns/executions/{id}/         # Delete campaign execution

# Campaign Analytics
GET    /campaigns/analytics/               # Campaign analytics
GET    /campaigns/{id}/analytics/          # Specific campaign analytics
GET    /campaigns/performance/             # Performance metrics
```

---

## 📋 **Project Management Endpoints**

### **Project Management** (`/api/project-management/`)
```
# Projects
GET    /project-management/projects/       # List projects
POST   /project-management/projects/       # Create project
GET    /project-management/projects/{id}/  # Get project details
PUT    /project-management/projects/{id}/  # Update project
DELETE /project-management/projects/{id}/  # Delete project

# Project Tasks
GET    /project-management/tasks/          # List project tasks
POST   /project-management/tasks/          # Create project task
GET    /project-management/tasks/{id}/     # Get project task
PUT    /project-management/tasks/{id}/     # Update project task
DELETE /project-management/tasks/{id}/     # Delete project task

# Project Milestones
GET    /project-management/milestones/     # List project milestones
POST   /project-management/milestones/     # Create project milestone
GET    /project-management/milestones/{id}/ # Get project milestone
PUT    /project-management/milestones/{id}/ # Update project milestone
DELETE /project-management/milestones/{id}/ # Delete project milestone

# Project Resources
GET    /project-management/resources/      # List project resources
POST   /project-management/resources/      # Create project resource
GET    /project-management/resources/{id}/ # Get project resource
PUT    /project-management/resources/{id}/ # Update project resource
DELETE /project-management/resources/{id}/ # Delete project resource
```

---

## 💳 **Billing Endpoints**

### **Billing** (`/api/billing/`)
```
# Invoices
GET    /billing/invoices/                  # List invoices
POST   /billing/invoices/                  # Create invoice
GET    /billing/invoices/{id}/             # Get invoice details
PUT    /billing/invoices/{id}/             # Update invoice
DELETE /billing/invoices/{id}/             # Delete invoice

# Payments
GET    /billing/payments/                  # List payments
POST   /billing/payments/                  # Create payment
GET    /billing/payments/{id}/             # Get payment details
PUT    /billing/payments/{id}/             # Update payment
DELETE /billing/payments/{id}/             # Delete payment

# Billing Cycles
GET    /billing/cycles/                    # List billing cycles
POST   /billing/cycles/                    # Create billing cycle
GET    /billing/cycles/{id}/               # Get billing cycle
PUT    /billing/cycles/{id}/               # Update billing cycle
DELETE /billing/cycles/{id}/               # Delete billing cycle
```

### **Subscription Billing** (`/api/subscription-billing/`)
```
# Subscription Plans
GET    /subscription-billing/plans/        # List subscription plans
POST   /subscription-billing/plans/        # Create subscription plan
GET    /subscription-billing/plans/{id}/   # Get subscription plan
PUT    /subscription-billing/plans/{id}/   # Update subscription plan
DELETE /subscription-billing/plans/{id}/   # Delete subscription plan

# Subscriptions
GET    /subscription-billing/subscriptions/ # List subscriptions
POST   /subscription-billing/subscriptions/ # Create subscription
GET    /subscription-billing/subscriptions/{id}/ # Get subscription
PUT    /subscription-billing/subscriptions/{id}/ # Update subscription
DELETE /subscription-billing/subscriptions/{id}/ # Cancel subscription

# Usage Tracking
GET    /subscription-billing/usage/        # List usage records
POST   /subscription-billing/usage/        # Create usage record
GET    /subscription-billing/usage/{id}/   # Get usage record
PUT    /subscription-billing/usage/{id}/   # Update usage record
DELETE /subscription-billing/usage/{id}/   # Delete usage record

# Billing Webhooks
POST   /subscription-billing/webhooks/stripe/ # Stripe webhook handler
```

---

## 📚 **Learning Management Endpoints**

### **Learning** (`/api/learning/`)
```
# Courses
GET    /learning/courses/                  # List courses
POST   /learning/courses/                  # Create course
GET    /learning/courses/{id}/             # Get course details
PUT    /learning/courses/{id}/             # Update course
DELETE /learning/courses/{id}/             # Delete course

# Lessons
GET    /learning/lessons/                  # List lessons
POST   /learning/lessons/                  # Create lesson
GET    /learning/lessons/{id}/             # Get lesson details
PUT    /learning/lessons/{id}/             # Update lesson
DELETE /learning/lessons/{id}/             # Delete lesson

# Badges
GET    /learning/badges/                   # List badges
POST   /learning/badges/                   # Create badge
GET    /learning/badges/{id}/              # Get badge details
PUT    /learning/badges/{id}/              # Update badge
DELETE /learning/badges/{id}/              # Delete badge

# Learning Achievements
GET    /learning/achievements/             # List learning achievements
POST   /learning/achievements/             # Create learning achievement
GET    /learning/achievements/{id}/        # Get learning achievement
PUT    /learning/achievements/{id}/        # Update learning achievement
DELETE /learning/achievements/{id}/        # Delete learning achievement

# Progress Tracking
GET    /learning/progress/                 # Get user progress
POST   /learning/progress/                 # Update progress
GET    /learning/progress/{course_id}/     # Get course progress
```

---

## 📊 **Analytics Endpoints**

### **Analytics** (`/api/analytics/`)
```
# Events
GET    /analytics/events/                  # List events
POST   /analytics/events/                  # Create event
GET    /analytics/events/{id}/             # Get event details
PUT    /analytics/events/{id}/             # Update event
DELETE /analytics/events/{id}/             # Delete event

# Metrics
GET    /analytics/metrics/                 # List metrics
POST   /analytics/metrics/                 # Create metric
GET    /analytics/metrics/{id}/            # Get metric details
PUT    /analytics/metrics/{id}/            # Update metric
DELETE /analytics/metrics/{id}/            # Delete metric

# Reports
GET    /analytics/reports/                 # List reports
POST   /analytics/reports/                 # Create report
GET    /analytics/reports/{id}/            # Get report details
PUT    /analytics/reports/{id}/            # Update report
DELETE /analytics/reports/{id}/            # Delete report

# Dashboard Data
GET    /analytics/dashboard/               # Dashboard overview
GET    /analytics/dashboard/campaigns/     # Campaign analytics
GET    /analytics/dashboard/users/         # User analytics
GET    /analytics/dashboard/revenue/       # Revenue analytics
```

---

## 🔌 **Integration Endpoints**

### **Integrations** (`/api/integrations/`)
```
# Integrations
GET    /integrations/                      # List integrations
POST   /integrations/                      # Create integration
GET    /integrations/{id}/                 # Get integration details
PUT    /integrations/{id}/                 # Update integration
DELETE /integrations/{id}/                 # Delete integration

# API Credentials
GET    /integrations/credentials/          # List API credentials
POST   /integrations/credentials/          # Create API credential
GET    /integrations/credentials/{id}/     # Get API credential
PUT    /integrations/credentials/{id}/     # Update API credential
DELETE /integrations/credentials/{id}/     # Delete API credential

# Webhooks
GET    /integrations/webhooks/             # List webhooks
POST   /integrations/webhooks/             # Create webhook
GET    /integrations/webhooks/{id}/        # Get webhook details
PUT    /integrations/webhooks/{id}/        # Update webhook
DELETE /integrations/webhooks/{id}/        # Delete webhook

# Webhook Endpoints
POST   /integrations/webhooks/{id}/receive/ # Receive webhook
```

---

## 💰 **Budgeting Endpoints**

### **Budgeting** (`/api/budgeting/`)
```
# Budgets
GET    /budgeting/budgets/                 # List budgets
POST   /budgeting/budgets/                 # Create budget
GET    /budgeting/budgets/{id}/            # Get budget details
PUT    /budgeting/budgets/{id}/            # Update budget
DELETE /budgeting/budgets/{id}/            # Delete budget

# Budget Items
GET    /budgeting/items/                   # List budget items
POST   /budgeting/items/                   # Create budget item
GET    /budgeting/items/{id}/              # Get budget item
PUT    /budgeting/items/{id}/              # Update budget item
DELETE /budgeting/items/{id}/              # Delete budget item

# Budget Categories
GET    /budgeting/categories/              # List budget categories
POST   /budgeting/categories/              # Create budget category
GET    /budgeting/categories/{id}/         # Get budget category
PUT    /budgeting/categories/{id}/         # Update budget category
DELETE /budgeting/categories/{id}/         # Delete budget category

# Budget Analysis
GET    /budgeting/analysis/                # Budget analysis
GET    /budgeting/analysis/{budget_id}/    # Specific budget analysis
```

---

## 📄 **Template Endpoints**

### **Marketing Templates** (`/api/marketing-templates/`)
```
# Templates
GET    /marketing-templates/               # List marketing templates
POST   /marketing-templates/               # Create marketing template
GET    /marketing-templates/{id}/          # Get marketing template
PUT    /marketing-templates/{id}/          # Update marketing template
DELETE /marketing-templates/{id}/          # Delete marketing template

# Template Categories
GET    /marketing-templates/categories/    # List template categories
POST   /marketing-templates/categories/    # Create template category
GET    /marketing-templates/categories/{id}/ # Get template category
PUT    /marketing-templates/categories/{id}/ # Update template category
DELETE /marketing-templates/categories/{id}/ # Delete template category
```

### **Templates App** (`/api/templates/`)
```
# Templates
GET    /templates/                         # List templates
POST   /templates/                         # Create template
GET    /templates/{id}/                    # Get template details
PUT    /templates/{id}/                    # Update template
DELETE /templates/{id}/                    # Delete template

# Template Versions
GET    /templates/versions/                # List template versions
POST   /templates/versions/                # Create template version
GET    /templates/versions/{id}/           # Get template version
PUT    /templates/versions/{id}/           # Update template version
DELETE /templates/versions/{id}/           # Delete template version
```

---

## 🔧 **System Endpoints**

### **Health & Monitoring**
```
GET    /health/                           # Simple health check
GET    /api/core/health/                  # Detailed health check
GET    /api/core/db-health/               # Database health check
POST   /api/core/setup/                   # Production setup
```

### **Admin Interface**
```
GET    /admin/                            # Django admin interface
```

---

## 📝 **Authentication & Permissions**

### **Authentication Methods**
- **JWT Token**: Bearer token authentication
- **Session**: Django session authentication (admin)
- **API Key**: For integrations (planned)

### **Permission Levels**
- **Superuser**: Full access to all endpoints
- **Staff**: Limited admin access
- **Tenant Admin**: Full access within tenant
- **User**: Standard user access
- **Client**: Limited client portal access

### **Rate Limiting**
- **Standard**: 1000 requests/hour
- **Authenticated**: 5000 requests/hour
- **Admin**: 10000 requests/hour

---

## 📊 **Response Formats**

### **Success Response**
```json
{
  "status": "success",
  "data": {...},
  "message": "Operation completed successfully"
}
```

### **Error Response**
```json
{
  "status": "error",
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### **Pagination Response**
```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "count": 100,
    "next": "https://api.example.com/endpoint?page=2",
    "previous": null,
    "page": 1,
    "pages": 10
  }
}
```

---

**Total Endpoints**: 200+ REST API endpoints  
**Authentication**: JWT-based  
**Documentation**: Auto-generated with DRF  
**Version**: v1.0.0
