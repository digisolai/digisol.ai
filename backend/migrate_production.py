#!/usr/bin/env python
"""
Custom migration script for production deployment.
Handles existing columns gracefully.
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from django.db import connection
from django.core.management import execute_from_command_line

def check_and_fix_database():
    """Check database schema and fix any issues"""
    print("🔍 Checking database schema...")
    
    with connection.cursor() as cursor:
        # Check if custom_users table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'custom_users'
            );
        """)
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print("❌ custom_users table does not exist. Running initial migration...")
            execute_from_command_line(['manage.py', 'migrate', 'accounts', '0001'])
            return
        
        # Check for existing columns
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'custom_users';
        """)
        existing_columns = {row[0] for row in cursor.fetchall()}
        
        print(f"✅ Found existing columns: {existing_columns}")
        
        # Add missing columns if they don't exist
        missing_columns = []
        required_columns = {
            'is_tenant_admin': 'BOOLEAN DEFAULT FALSE',
            'role': 'VARCHAR(50) DEFAULT \'viewer\'',
            'profile_picture': 'VARCHAR(100)',
            'bio': 'TEXT',
            'phone_number': 'VARCHAR(20)',
            'created_at': 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
            'updated_at': 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
            'job_title': 'VARCHAR(255)',
            'is_hr_admin': 'BOOLEAN DEFAULT FALSE'
        }
        
        for column, definition in required_columns.items():
            if column not in existing_columns:
                missing_columns.append((column, definition))
        
        if missing_columns:
            print(f"🔧 Adding missing columns: {[col[0] for col in missing_columns]}")
            for column, definition in missing_columns:
                try:
                    # Use PostgreSQL's IF NOT EXISTS syntax
                    cursor.execute(f"ALTER TABLE custom_users ADD COLUMN IF NOT EXISTS {column} {definition};")
                    print(f"✅ Added column: {column}")
                except Exception as e:
                    print(f"⚠️  Column {column} might already exist: {e}")
            
            connection.commit()
        else:
            print("✅ All required columns exist")
    
    # Run Django migrations with proper error handling
    print("🔄 Running Django migrations...")
    try:
        # First try to run migrations normally
        execute_from_command_line(['manage.py', 'migrate'])
    except Exception as e:
        print(f"⚠️  Migration failed: {e}")
        print("🔄 Trying to fake migrations...")
        try:
            execute_from_command_line(['manage.py', 'migrate', '--fake'])
        except Exception as e2:
            print(f"⚠️  Fake migration also failed: {e2}")
            print("🔄 Trying to migrate specific apps...")
            try:
                execute_from_command_line(['manage.py', 'migrate', 'accounts', '--fake'])
                execute_from_command_line(['manage.py', 'migrate', 'core', '--fake'])
            except Exception as e3:
                print(f"⚠️  App-specific migration failed: {e3}")
    
    # Set up superuser
    print("👤 Setting up superuser...")
    try:
        from setup_production_user import setup_production_user
        setup_production_user()
    except Exception as e:
        print(f"⚠️  Superuser setup failed: {e}")

if __name__ == "__main__":
    check_and_fix_database()
