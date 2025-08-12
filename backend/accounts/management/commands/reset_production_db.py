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
            
            # Step 3: Delete all users
            self.stdout.write("💥 Deleting all existing users...")
            user_count = User.objects.count()
            self.stdout.write(f"Found {user_count} users to delete")
            
            if user_count > 0:
                User.objects.all().delete()
                self.stdout.write(f"✅ Deleted {user_count} users")
            else:
                self.stdout.write("✅ No users to delete")
            
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
