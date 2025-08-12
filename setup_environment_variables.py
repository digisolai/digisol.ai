#!/usr/bin/env python3
"""
Script to help set up all environment variables for DigiSol.AI production deployment.
This script will guide you through setting up all necessary API keys and configuration.
"""

import os
import sys
import secrets
import string

def generate_secret_key():
    """Generate a secure Django secret key"""
    return ''.join(secrets.choice(string.ascii_letters + string.digits + string.punctuation) for _ in range(50))

def get_user_input(prompt, default=None, required=True):
    """Get user input with validation"""
    while True:
        if default:
            user_input = input(f"{prompt} (default: {default}): ").strip()
            if not user_input:
                user_input = default
        else:
            user_input = input(f"{prompt}: ").strip()
        
        if user_input or not required:
            return user_input
        else:
            print("This field is required. Please enter a value.")

def main():
    """Main setup function"""
    print("🚀 DigiSol.AI Environment Variables Setup")
    print("=" * 50)
    print("This script will help you set up all environment variables needed for production.")
    print("Make sure you have your API keys ready before starting.\n")
    
    # Check if user wants to continue
    continue_setup = input("Do you want to continue? (y/N): ").strip().lower()
    if continue_setup != 'y':
        print("Setup cancelled.")
        return
    
    print("\n📋 Let's set up your environment variables:\n")
    
    # Core Django Settings
    print("🔐 Core Django Settings")
    print("-" * 30)
    
    secret_key = get_user_input(
        "Django Secret Key (leave empty to generate)",
        default=generate_secret_key(),
        required=False
    )
    
    allowed_hosts = get_user_input(
        "Allowed Hosts (comma-separated)",
        default="digisol-backend.onrender.com,www.digisolai.ca,digisolai.ca",
        required=False
    )
    
    csrf_trusted_origins = get_user_input(
        "CSRF Trusted Origins (comma-separated)",
        default="https://*.digisolai.ca,https://*.netlify.app,https://*.onrender.com",
        required=False
    )
    
    # Database Configuration
    print("\n🗄️ Database Configuration")
    print("-" * 30)
    
    use_aws_rds = get_user_input(
        "Use AWS RDS PostgreSQL? (y/N)",
        default="y",
        required=False
    ).lower() == 'y'
    
    if use_aws_rds:
        db_name = get_user_input("Database Name", required=True)
        db_user = get_user_input("Database User", required=True)
        db_password = get_user_input("Database Password", required=True)
        db_host = get_user_input("Database Host (RDS endpoint)", required=True)
        db_port = get_user_input("Database Port", default="5432", required=False)
    else:
        database_url = get_user_input("DATABASE_URL (postgresql://user:pass@host:port/db)", required=True)
    
    # Stripe Configuration
    print("\n💳 Stripe Payment Processing")
    print("-" * 30)
    
    stripe_secret_key = get_user_input("Stripe Secret Key (sk_live_...)", required=True)
    stripe_publishable_key = get_user_input("Stripe Publishable Key (pk_live_...)", required=True)
    stripe_webhook_secret = get_user_input("Stripe Webhook Secret (whsec_...)", required=True)
    
    # Google Gemini AI
    print("\n🤖 Google Gemini AI")
    print("-" * 30)
    
    google_gemini_api_key = get_user_input("Google Gemini API Key", required=True)
    
    # AWS S3 (Optional)
    print("\n☁️ AWS S3 Storage (Optional)")
    print("-" * 30)
    
    use_s3 = get_user_input("Use AWS S3 for file storage? (y/N)", default="n", required=False).lower() == 'y'
    
    if use_s3:
        aws_access_key_id = get_user_input("AWS Access Key ID", required=True)
        aws_secret_access_key = get_user_input("AWS Secret Access Key", required=True)
        aws_storage_bucket_name = get_user_input("AWS S3 Bucket Name", required=True)
        aws_s3_region_name = get_user_input("AWS S3 Region", default="us-east-1", required=False)
    else:
        aws_access_key_id = aws_secret_access_key = aws_storage_bucket_name = aws_s3_region_name = ""
    
    # Email Configuration
    print("\n📧 Email Configuration")
    print("-" * 30)
    
    default_from_email = get_user_input("Default From Email", default="noreply@digisolai.ca", required=False)
    
    # Redis (Optional)
    print("\n🔄 Redis/Celery (Optional)")
    print("-" * 30)
    
    redis_url = get_user_input("Redis URL (leave empty to skip)", required=False)
    
    # Analytics (Optional)
    print("\n📊 Analytics (Optional)")
    print("-" * 30)
    
    google_analytics_id = get_user_input("Google Analytics ID (leave empty to skip)", required=False)
    
    # Generate environment variables file
    print("\n📝 Generating environment variables...")
    
    env_content = f"""# DigiSol.AI Environment Variables
# Generated on {os.popen('date').read().strip()}

# Core Django Settings
SECRET_KEY={secret_key}
ALLOWED_HOSTS={allowed_hosts}
CSRF_TRUSTED_ORIGINS={csrf_trusted_origins}

# Database Configuration
"""
    
    if use_aws_rds:
        env_content += f"""DB_NAME={db_name}
DB_USER={db_user}
DB_PASSWORD={db_password}
DB_HOST={db_host}
DB_PORT={db_port}
"""
    else:
        env_content += f"""DATABASE_URL={database_url}
"""
    
    env_content += f"""
# Stripe Payment Processing
STRIPE_SECRET_KEY={stripe_secret_key}
STRIPE_PUBLISHABLE_KEY={stripe_publishable_key}
STRIPE_WEBHOOK_SECRET={stripe_webhook_secret}

# Google Gemini AI
GOOGLE_GEMINI_API_KEY={google_gemini_api_key}
GOOGLE_APPLICATION_CREDENTIALS_JSON={{}}

# Email Configuration
DEFAULT_FROM_EMAIL={default_from_email}
"""
    
    if use_s3:
        env_content += f"""
# AWS S3 Storage
AWS_ACCESS_KEY_ID={aws_access_key_id}
AWS_SECRET_ACCESS_KEY={aws_secret_access_key}
AWS_STORAGE_BUCKET_NAME={aws_storage_bucket_name}
AWS_S3_REGION_NAME={aws_s3_region_name}
"""
    
    if redis_url:
        env_content += f"""
# Redis/Celery
REDIS_URL={redis_url}
"""
    
    if google_analytics_id:
        env_content += f"""
# Analytics
GOOGLE_ANALYTICS_ID={google_analytics_id}
"""
    
    # Save to file
    env_file_path = "production_env_variables.txt"
    with open(env_file_path, 'w') as f:
        f.write(env_content)
    
    print(f"\n✅ Environment variables saved to: {env_file_path}")
    print("\n📋 Next Steps:")
    print("1. Copy these variables to your deployment platform (Render.com)")
    print("2. Test your setup using the test scripts")
    print("3. Deploy to production")
    
    # Show the content
    print(f"\n📄 Environment Variables Content:")
    print("=" * 50)
    print(env_content)
    print("=" * 50)
    
    print("\n🔒 Security Reminder:")
    print("- Keep these keys secure and never commit them to Git")
    print("- Rotate your API keys regularly")
    print("- Use different keys for development and production")
    
    print("\n🎯 Ready for Production!")
    print("Your DigiSol.AI application is now configured for multiple users.")

if __name__ == '__main__':
    main()
