#!/usr/bin/env python3
"""
Manual database reset script for production
Run this directly on the production server to reset the database
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
from django.contrib.auth import get_user_model
from django.db import connection

def manual_reset():
    """Manual database reset for production"""
    try:
        print("🔄 Manual database reset for production...")
        
        # Step 1: Check current database state
        print("🔍 Checking current database state...")
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            tables = [row[0] for row in cursor.fetchall()]
            print(f"Found {len(tables)} tables in database")
        
        # Step 2: Apply migrations
        print("📦 Applying migrations...")
        try:
            execute_from_command_line(['manage.py', 'migrate', '--noinput'])
            print("✅ Migrations applied successfully")
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            return False
        
        # Step 3: Delete all users
        print("💥 Deleting all existing users...")
        User = get_user_model()
        user_count = User.objects.count()
        print(f"Found {user_count} users to delete")
        
        if user_count > 0:
            User.objects.all().delete()
            print(f"✅ Deleted {user_count} users")
        else:
            print("✅ No users to delete")
        
        # Step 4: Create fresh superuser
        print("👤 Creating fresh superuser...")
        try:
            superuser = User.objects.create_superuser(
                username='admin',
                email='admin@digisolai.ca',
                password='admin123456',
                first_name='Admin',
                last_name='User'
            )
            print(f"✅ Created superuser: {superuser.email}")
            print(f"   Username: admin")
            print(f"   Password: admin123456")
            print(f"   Email: {superuser.email}")
        except Exception as e:
            print(f"❌ Failed to create superuser: {e}")
            return False
        
        # Step 5: Verify superuser
        print("🔍 Verifying superuser...")
        try:
            test_user = User.objects.get(email='admin@digisolai.ca')
            if test_user.check_password('admin123456'):
                print("✅ Superuser verification successful")
            else:
                print("❌ Superuser password verification failed")
                return False
        except User.DoesNotExist:
            print("❌ Superuser not found after creation")
            return False
        
        print("🎉 Manual database reset completed successfully!")
        print("📋 Login credentials:")
        print("   URL: https://digisol-backend.onrender.com/admin/")
        print("   Username: admin")
        print("   Password: admin123456")
        print("   Email: admin@digisolai.ca")
        
        return True
        
    except Exception as e:
        print(f"❌ Manual reset failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = manual_reset()
    if success:
        print("🎉 Manual reset completed successfully!")
    else:
        print("💥 Manual reset failed!")
        sys.exit(1)
