#!/usr/bin/env python3
"""
Setup production superuser for DigiSol.AI
This script should be run during deployment to ensure a superuser exists.
"""

import os
import sys
import django

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection

def setup_production_superuser():
    """Ensure database is ready and create a fresh superuser"""
    try:
        print("🔧 Setting up production superuser...")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Python path: {sys.path[:3]}...")
        
        # First, ensure migrations are applied
        print("🔄 Ensuring migrations are applied...")
        try:
            execute_from_command_line(['manage.py', 'migrate', '--noinput'])
            print("✅ Migrations applied successfully")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            return False
        
        # Check if database tables exist
        print("🔍 Checking database schema...")
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('accounts_customuser', 'campaigns_campaign')
            """)
            tables = [row[0] for row in cursor.fetchall()]
            print(f"Found tables: {tables}")
        
        if 'accounts_customuser' not in tables:
            print("❌ User table doesn't exist, running makemigrations...")
            try:
                execute_from_command_line(['manage.py', 'makemigrations'])
                execute_from_command_line(['manage.py', 'migrate', '--noinput'])
                print("✅ Created and applied migrations")
            except Exception as e:
                print(f"❌ Failed to create migrations: {e}")
                return False
        
        # Now try to nuke users
        print("💥 Attempting to nuke all users...")
        try:
            execute_from_command_line(['manage.py', 'nuke_all_users', '--force'])
            print("✅ Nuke command executed successfully")
        except Exception as e:
            print(f"❌ Nuke command failed: {e}")
            # Fallback: try direct user creation
            print("🔄 Trying direct user creation...")
            from django.contrib.auth import get_user_model
            from django.db import transaction
            
            User = get_user_model()
            
            # Delete all users
            user_count = User.objects.count()
            print(f"Found {user_count} users, deleting...")
            User.objects.all().delete()
            
            # Create superuser
            with transaction.atomic():
                superuser = User.objects.create_superuser(
                    username='admin',
                    email='admin@digisolai.ca',
                    password='admin123456',
                    first_name='Admin',
                    last_name='User'
                )
                print(f"✅ Created superuser: {superuser.email}")
        
        print("🎉 Production superuser setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to setup superuser: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = setup_production_superuser()
    if success:
        print("🎉 Production superuser setup completed successfully!")
    else:
        print("💥 Production superuser setup failed!")
        sys.exit(1)
