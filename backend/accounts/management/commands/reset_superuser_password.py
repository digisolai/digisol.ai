from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Reset superuser password to a known value'

    def add_arguments(self, parser):
        parser.add_argument(
            '--password',
            type=str,
            default='admin123456',
            help='Password to set for the superuser'
        )

    def handle(self, *args, **options):
        password = options['password']
        
        try:
            # Find the superuser
            superuser = User.objects.filter(is_superuser=True).first()
            if not superuser:
                self.stdout.write("❌ No superuser found")
                return
            
            self.stdout.write(f"🔧 Resetting password for superuser: {superuser.email}")
            
            # Reset the password
            superuser.set_password(password)
            superuser.save()
            
            self.stdout.write(f"✅ Password reset successfully to: {password}")
            
            # Test the password
            if superuser.check_password(password):
                self.stdout.write("✅ Password verification successful")
            else:
                self.stdout.write("❌ Password verification failed")
                
        except Exception as e:
            self.stdout.write(f"❌ Failed to reset password: {e}")
