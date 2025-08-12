from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import connection

User = get_user_model()

class Command(BaseCommand):
    help = 'Check the current state of users in production'

    def handle(self, *args, **options):
        try:
            self.stdout.write("🔍 Checking Production User State")
            self.stdout.write("=" * 50)
            
            # Check database connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()
                self.stdout.write(f"✅ Database: {version[0]}")
            
            # Count users
            user_count = User.objects.count()
            self.stdout.write(f"👥 Total users: {user_count}")
            
            if user_count > 0:
                self.stdout.write("\n📋 User Details:")
                for user in User.objects.all():
                    self.stdout.write(f"  - {user.email}")
                    self.stdout.write(f"    Username: {user.username}")
                    self.stdout.write(f"    Active: {user.is_active}")
                    self.stdout.write(f"    Staff: {user.is_staff}")
                    self.stdout.write(f"    Superuser: {user.is_superuser}")
                    self.stdout.write(f"    Password hash: {user.password[:50]}...")
                    
                    # Test password
                    if user.check_password('admin123456'):
                        self.stdout.write(f"    ✅ Password 'admin123456' works")
                    else:
                        self.stdout.write(f"    ❌ Password 'admin123456' does not work")
                    
                    self.stdout.write("")
            else:
                self.stdout.write("❌ No users found in database")
            
            # Check table structure
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = 'custom_users'
                    ORDER BY ordinal_position;
                """)
                columns = cursor.fetchall()
                self.stdout.write("\n📋 Table Structure:")
                for col in columns:
                    self.stdout.write(f"  {col[0]}: {col[1]} (nullable: {col[2]})")
                    
        except Exception as e:
            self.stdout.write(f"❌ Error: {e}")
            return False
        
        return True
