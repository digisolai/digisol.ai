from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Fix production database schema by adding missing CustomUser fields'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Add missing columns safely
            commands = [
                "ALTER TABLE custom_users ADD COLUMN IF NOT EXISTS department VARCHAR(100);",
                "ALTER TABLE custom_users ADD COLUMN IF NOT EXISTS is_hr_admin BOOLEAN DEFAULT FALSE;",
                "ALTER TABLE custom_users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);",
                "ALTER TABLE custom_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();",
                "ALTER TABLE custom_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();",
                "ALTER TABLE custom_users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(100);",
                "ALTER TABLE custom_users ADD COLUMN IF NOT EXISTS bio TEXT;",
                "ALTER TABLE custom_users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);",
    
                "ALTER TABLE custom_users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'viewer';",
                "UPDATE custom_users SET created_at = NOW() WHERE created_at IS NULL;",
                "UPDATE custom_users SET updated_at = NOW() WHERE updated_at IS NULL;",
            ]
            
            for cmd in commands:
                try:
                    cursor.execute(cmd)
                    self.stdout.write(f"✅ {cmd}")
                except Exception as e:
                    self.stdout.write(f"⚠️ {cmd} - {e}")
            
        self.stdout.write(self.style.SUCCESS('Database schema fix completed!'))