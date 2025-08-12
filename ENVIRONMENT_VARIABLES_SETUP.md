# Environment Variables Setup Guide

## Overview
This guide lists all the environment variables needed for your DigiSol.AI application to run in production with multiple users.

## Required Environment Variables

### 🔐 **Core Django Settings**
```bash
# Django Secret Key (REQUIRED)
SECRET_KEY=your-super-secret-django-key-here

# Allowed Hosts (REQUIRED)
ALLOWED_HOSTS=digisol-backend.onrender.com,www.digisolai.ca,digisolai.ca

# CSRF Trusted Origins (REQUIRED)
CSRF_TRUSTED_ORIGINS=https://*.digisolai.ca,https://*.netlify.app,https://*.onrender.com
```

### 🗄️ **Database Configuration (AWS RDS PostgreSQL)**
```bash
# AWS RDS Database (REQUIRED for production)
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432

# Fallback (if not using AWS RDS)
DATABASE_URL=postgresql://user:password@host:port/dbname
```

### ☁️ **AWS S3 Storage (Optional but Recommended)**
```bash
# AWS S3 for Media Files
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-s3-bucket-name
AWS_S3_REGION_NAME=us-east-1
```

### 💳 **Stripe Payment Processing (REQUIRED for billing)**
```bash
# Stripe Keys (REQUIRED for payments)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
```

### 🤖 **Google Gemini AI (REQUIRED for AI features)**
```bash
# Google Gemini API (REQUIRED for AI services)
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
GOOGLE_APPLICATION_CREDENTIALS_JSON={}
```

### 📧 **Email Configuration (Optional)**
```bash
# Email Settings
DEFAULT_FROM_EMAIL=noreply@digisolai.ca
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### 🔄 **Redis/Celery (Optional for background tasks)**
```bash
# Redis for Celery (Optional)
REDIS_URL=redis://your-redis-url:port
```

### 📊 **Analytics (Optional)**
```bash
# Google Analytics
GOOGLE_ANALYTICS_ID=your-ga-id
```

## Setup Instructions

### Step 1: Generate Django Secret Key
```bash
# Run this command to generate a secure secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Step 2: Get Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers → API Keys
3. Copy your **Publishable Key** and **Secret Key**
4. For webhook secret, go to Webhooks → Add endpoint → Copy the signing secret

### Step 3: Get Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### Step 4: Set Up AWS RDS Database
1. Create an RDS PostgreSQL instance in AWS
2. Note down the endpoint, database name, username, and password
3. Ensure the database is publicly accessible or configure VPC properly

### Step 5: Set Up AWS S3 (Optional)
1. Create an S3 bucket in AWS
2. Create an IAM user with S3 access
3. Get the access key and secret key

## Environment Variables by Platform

### For Render.com Deployment
Add these in your Render service environment variables:

```bash
# Core
SECRET_KEY=your-generated-secret-key
ALLOWED_HOSTS=digisol-backend.onrender.com,www.digisolai.ca,digisolai.ca
CSRF_TRUSTED_ORIGINS=https://*.digisolai.ca,https://*.netlify.app,https://*.onrender.com

# Database
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432

# Stripe
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

# AI
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
GOOGLE_APPLICATION_CREDENTIALS_JSON={}

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-s3-bucket-name
AWS_S3_REGION_NAME=us-east-1

# Email
DEFAULT_FROM_EMAIL=noreply@digisolai.ca

# Redis (Optional)
REDIS_URL=redis://your-redis-url:port

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=your-ga-id
```

### For Local Development
Create a `.env` file in your backend directory:

```bash
# Copy from env_template.txt and fill in your values
cp backend/env_template.txt backend/.env
```

## Testing Your Setup

### 1. Test Database Connection
```bash
cd backend
python check_rds_connection.py
```

### 2. Test Stripe Integration
```bash
cd backend
python manage.py shell
>>> from django.conf import settings
>>> import stripe
>>> stripe.api_key = settings.STRIPE_SECRET_KEY
>>> stripe.Customer.list(limit=1)
```

### 3. Test Gemini AI
```bash
cd backend
python manage.py shell
>>> from django.conf import settings
>>> print(f"Gemini API Key configured: {bool(settings.GOOGLE_GEMINI_API_KEY)}")
```

### 4. Test S3 Storage (if configured)
```bash
cd backend
python manage.py shell
>>> from django.conf import settings
>>> print(f"S3 configured: {bool(settings.AWS_ACCESS_KEY_ID)}")
```

## Security Best Practices

### ✅ **Do's:**
- Use strong, unique secret keys
- Rotate API keys regularly
- Use environment variables, never hardcode secrets
- Use HTTPS in production
- Limit database access with proper IAM roles

### ❌ **Don'ts:**
- Never commit secrets to Git
- Don't use test keys in production
- Don't share API keys publicly
- Don't use weak passwords

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check DB_HOST, DB_NAME, DB_USER, DB_PASSWORD
   - Ensure RDS is publicly accessible
   - Check security groups

2. **Stripe Payments Not Working**
   - Verify STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY
   - Check webhook endpoint configuration
   - Ensure using live keys in production

3. **AI Features Not Working**
   - Verify GOOGLE_GEMINI_API_KEY is set
   - Check API key permissions
   - Ensure sufficient quota

4. **File Uploads Failing**
   - Check AWS S3 credentials
   - Verify bucket permissions
   - Check CORS configuration

## Next Steps

1. **Set up all environment variables** in your deployment platform
2. **Test each integration** using the test scripts above
3. **Deploy to production** and verify everything works
4. **Set up monitoring** for API usage and errors
5. **Configure backups** for your database

---

**Need Help?** If you encounter issues, check the troubleshooting section or review the Django logs for specific error messages.
