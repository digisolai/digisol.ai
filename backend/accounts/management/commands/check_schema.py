from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Check current database schema for CustomUser table'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Check if custom_users table exists
            cursor.execute("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'custom_users' 
                ORDER BY ordinal_position;
            """)
            
            columns = cursor.fetchall()
            
            self.stdout.write("📋 Current custom_users table schema:")
            self.stdout.write("=" * 50)
            
            for column in columns:
                self.stdout.write(f"  {column[0]}: {column[1]} ({'NULL' if column[2] == 'YES' else 'NOT NULL'})")
            
            # Check for specific missing columns
            column_names = [col[0] for col in columns]
            
            missing_columns = []
            required_columns = ['profile_picture', 'bio', 'phone_number', 'created_at', 'updated_at', 'role']
            
            for col in required_columns:
                if col not in column_names:
                    missing_columns.append(col)
            
            if missing_columns:
                self.stdout.write(self.style.ERROR(f"❌ Missing columns: {missing_columns}"))
            else:
                self.stdout.write(self.style.SUCCESS("✅ All required columns exist!")) 