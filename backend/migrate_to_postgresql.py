#!/usr/bin/env python
"""
Database Migration Script: SQLite to PostgreSQL
This script helps migrate data from SQLite to PostgreSQL on Render.
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.conf import settings

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
    django.setup()

def check_database_connection():
    """Check if we can connect to the PostgreSQL database"""
    from django.db import connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✅ Successfully connected to PostgreSQL database")
            return True
    except Exception as e:
        print(f"❌ Failed to connect to PostgreSQL database: {e}")
        return False

def run_migrations():
    """Run Django migrations on the new PostgreSQL database"""
    print("🔄 Running migrations on PostgreSQL database...")
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migrations completed successfully")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def create_superuser():
    """Create the production superuser"""
    print("👤 Creating production superuser...")
    try:
        # Check if superuser already exists
        from accounts.models import CustomUser
        if CustomUser.objects.filter(is_superuser=True).exists():
            print("✅ Superuser already exists")
            return True
        
        # Create superuser
        user = CustomUser.objects.create_superuser(
            email='admin@digisolai.ca',
            password='admin123456',
            first_name='Admin',
            last_name='User'
        )
        print(f"✅ Superuser created successfully: {user.email}")
        return True
    except Exception as e:
        print(f"❌ Failed to create superuser: {e}")
        return False

def export_sqlite_data():
    """Export data from SQLite database"""
    print("📤 Exporting data from SQLite database...")
    try:
        # Create a backup of the SQLite database
        import shutil
        from pathlib import Path
        
        sqlite_path = Path(settings.BASE_DIR) / 'db.sqlite3'
        backup_path = Path(settings.BASE_DIR) / 'db_backup.sqlite3'
        
        if sqlite_path.exists():
            shutil.copy2(sqlite_path, backup_path)
            print(f"✅ SQLite database backed up to: {backup_path}")
        else:
            print("⚠️  No SQLite database found to backup")
        
        return True
    except Exception as e:
        print(f"❌ Failed to backup SQLite database: {e}")
        return False

def main():
    """Main migration process"""
    print("🚀 Starting PostgreSQL Migration Process")
    print("=" * 50)
    
    # Setup Django
    setup_django()
    
    # Check database connection
    if not check_database_connection():
        print("❌ Cannot proceed without database connection")
        sys.exit(1)
    
    # Export SQLite data (backup)
    export_sqlite_data()
    
    # Run migrations
    if not run_migrations():
        print("❌ Cannot proceed without successful migrations")
        sys.exit(1)
    
    # Create superuser
    create_superuser()
    
    print("=" * 50)
    print("✅ PostgreSQL migration completed successfully!")
    print("📝 Next steps:")
    print("   1. Test your application functionality")
    print("   2. Verify all data is accessible")
    print("   3. Monitor application performance")
    print("   4. Remove SQLite backup when confident")

if __name__ == '__main__':
    main()
