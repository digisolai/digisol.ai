from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Delete all users and create a fresh superuser'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force deletion without confirmation'
        )

    def handle(self, *args, **options):
        force = options['force']
        
        try:
            # Count existing users
            user_count = User.objects.count()
            self.stdout.write(f"🔍 Found {user_count} users in database")
            
            if user_count > 0:
                if not force:
                    self.stdout.write("⚠️  This will delete ALL users. Use --force to proceed.")
                    return
                
                self.stdout.write("🗑️  Deleting all users...")
                
                # Delete all users
                with transaction.atomic():
                    User.objects.all().delete()
                    self.stdout.write(f"✅ Deleted {user_count} users")
            
            # Create fresh superuser
            self.stdout.write("📝 Creating fresh superuser...")
            
            with transaction.atomic():
                superuser = User.objects.create_superuser(
                    username='admin',
                    email='admin@digisolai.ca',
                    password='admin123456',
                    first_name='Admin',
                    last_name='User'
                )
                
                self.stdout.write(f"✅ Created superuser: {superuser.email}")
                self.stdout.write(f"   Username: {superuser.username}")
                self.stdout.write(f"   Password: admin123456")
                self.stdout.write(f"   Email: {superuser.email}")
                self.stdout.write(f"   Active: {superuser.is_active}")
                self.stdout.write(f"   Staff: {superuser.is_staff}")
                self.stdout.write(f"   Superuser: {superuser.is_superuser}")
            
            # Test the superuser
            if superuser.check_password('admin123456'):
                self.stdout.write("✅ Password verification successful")
            else:
                self.stdout.write("❌ Password verification failed")
                
        except Exception as e:
            self.stdout.write(f"❌ Failed to cleanup users: {e}")
            return False
        
        self.stdout.write("🎉 User cleanup completed successfully!")
        return True
