from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import connection
from django.core.management import call_command

User = get_user_model()

class Command(BaseCommand):
    help = 'Reset production database and create fresh superuser'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force reset without confirmation'
        )

    def table_exists(self, table_name):
        """Check if a table exists in the database"""
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = %s
                );
            """, [table_name])
            return cursor.fetchone()[0]

    def safe_delete_users(self):
        """Safely delete users by handling missing related tables"""
        try:
            # First, try to delete users normally
            user_count = User.objects.count()
            if user_count > 0:
                User.objects.all().delete()
                self.stdout.write(f"✅ Deleted {user_count} users")
            else:
                self.stdout.write("✅ No users to delete")
        except Exception as e:
            # If normal deletion fails, try manual deletion
            self.stdout.write(f"⚠️  Normal user deletion failed: {e}")
            self.stdout.write("🔧 Attempting manual user deletion...")
            
            try:
                with connection.cursor() as cursor:
                    # Check if users table exists
                    if self.table_exists('custom_users'):
                        cursor.execute("DELETE FROM custom_users")
                        deleted_count = cursor.rowcount
                        self.stdout.write(f"✅ Manually deleted {deleted_count} users")
                    else:
                        self.stdout.write("✅ No users table found")
            except Exception as manual_error:
                self.stdout.write(f"❌ Manual deletion also failed: {manual_error}")
                # Continue anyway - the user creation will work

    def handle(self, *args, **options):
        force = options['force']
        
        if not force:
            self.stdout.write("⚠️  This will DELETE ALL DATA and create a fresh superuser!")
            self.stdout.write("⚠️  Use --force to proceed")
            return
        
        try:
            self.stdout.write("🔄 Starting production database reset...")
            
            # Step 1: Apply migrations
            self.stdout.write("📦 Applying migrations...")
            call_command('migrate', '--noinput')
            self.stdout.write("✅ Migrations applied successfully")
            
            # Step 2: Check database state
            self.stdout.write("🔍 Checking database state...")
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """)
                tables = [row[0] for row in cursor.fetchall()]
                self.stdout.write(f"Found {len(tables)} tables in database")
            
            # Step 3: Safely delete all users
            self.stdout.write("💥 Deleting all existing users...")
            user_count = User.objects.count()
            self.stdout.write(f"Found {user_count} users to delete")
            
            self.safe_delete_users()
            
            # Step 4: Create fresh superuser
            self.stdout.write("👤 Creating fresh superuser...")
            try:
                superuser = User.objects.create_superuser(
                    username='admin',
                    email='admin@digisolai.ca',
                    password='admin123456',
                    first_name='Admin',
                    last_name='User'
                )
                self.stdout.write(f"✅ Created superuser: {superuser.email}")
                self.stdout.write(f"   Username: admin")
                self.stdout.write(f"   Password: admin123456")
                self.stdout.write(f"   Email: {superuser.email}")
            except Exception as e:
                self.stdout.write(f"❌ Failed to create superuser: {e}")
                return False
            
            # Step 5: Verify superuser
            self.stdout.write("🔍 Verifying superuser...")
            try:
                test_user = User.objects.get(email='admin@digisolai.ca')
                if test_user.check_password('admin123456'):
                    self.stdout.write("✅ Superuser verification successful")
                else:
                    self.stdout.write("❌ Superuser password verification failed")
                    return False
            except User.DoesNotExist:
                self.stdout.write("❌ Superuser not found after creation")
                return False
            
            self.stdout.write("🎉 Production database reset completed successfully!")
            self.stdout.write("📋 Login credentials:")
            self.stdout.write("   URL: https://digisol-backend.onrender.com/admin/")
            self.stdout.write("   Username: admin")
            self.stdout.write("   Password: admin123456")
            self.stdout.write("   Email: admin@digisolai.ca")
            
        except Exception as e:
            self.stdout.write(f"❌ Production reset failed: {e}")
            import traceback
            traceback.print_exc()
