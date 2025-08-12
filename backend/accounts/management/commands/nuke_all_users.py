from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Nuke all users from all environments and create a fresh superuser'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force deletion without confirmation'
        )
        parser.add_argument(
            '--production',
            action='store_true',
            help='Run in production mode (use production settings)'
        )

    def handle(self, *args, **options):
        force = options['force']
        production = options['production']
        
        # Check environment
        env = "PRODUCTION" if production else "LOCAL"
        self.stdout.write(f"🚀 Running in {env} environment")
        
        if not force:
            self.stdout.write("⚠️  This will DELETE ALL USERS from the database!")
            self.stdout.write("⚠️  Use --force to proceed")
            return
        
        try:
            # Count existing users
            user_count = User.objects.count()
            self.stdout.write(f"🔍 Found {user_count} users in database")
            
            if user_count > 0:
                self.stdout.write("💥 NUKING ALL USERS...")
                
                # Delete all users
                with transaction.atomic():
                    User.objects.all().delete()
                    self.stdout.write(f"✅ NUKED {user_count} users")
            else:
                self.stdout.write("✅ Database is already empty")
            
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
                
            # Show database info
            self.stdout.write(f"\n📊 Database Info:")
            self.stdout.write(f"   Engine: {User.objects.db}")
            self.stdout.write(f"   Total users: {User.objects.count()}")
            
        except Exception as e:
            self.stdout.write(f"❌ Failed to nuke users: {e}")
            return False
        
        self.stdout.write("🎉 ALL USERS NUKED AND FRESH SUPERUSER CREATED!")
        return True
