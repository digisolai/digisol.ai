from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import CustomUser
from core.models import Tenant
import getpass

class Command(BaseCommand):
    help = 'Add a superuser with the specified email address'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address for the superuser',
            required=True
        )
        parser.add_argument(
            '--password',
            type=str,
            help='Password for the superuser (will prompt if not provided)',
            required=False
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Super',
            help='First name for the superuser'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='User',
            help='Last name for the superuser'
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        self.stdout.write(f"🔍 Adding superuser: {email}")

        # Check if user already exists
        try:
            existing_user = CustomUser.objects.get(email=email)
            if existing_user.is_superuser:
                self.stdout.write(
                    self.style.SUCCESS(f"✅ User {email} already exists and is a superuser!")
                )
                return
            else:
                # Make existing user a superuser
                existing_user.is_superuser = True
                existing_user.is_staff = True
                existing_user.save()
                self.stdout.write(
                    self.style.SUCCESS(f"✅ User {email} is now a superuser!")
                )
                return
        except CustomUser.DoesNotExist:
            pass

        # Get password if not provided
        if not password:
            password = getpass.getpass('Enter password for superuser: ')
            password_confirm = getpass.getpass('Confirm password: ')
            if password != password_confirm:
                self.stdout.write(
                    self.style.ERROR("❌ Passwords don't match!")
                )
                return

        # Get or create a default tenant
        tenants = Tenant.objects.all()
        if tenants.count() == 0:
            self.stdout.write("🏢 Creating default tenant...")
            try:
                tenant = Tenant.objects.create(
                    name="DigiSol AI Demo",
                    subdomain="demo",
                    is_active=True
                )
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Tenant created: {tenant.name}")
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"❌ Failed to create tenant: {e}")
                )
                return
        else:
            tenant = tenants.first()
            self.stdout.write(f"✅ Using existing tenant: {tenant.name}")

        # Create the superuser
        try:
            user = CustomUser.objects.create_superuser(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Assign tenant to the user
            user.tenant = tenant
            user.save()
            
            self.stdout.write(
                self.style.SUCCESS(f"✅ Superuser created successfully!")
            )
            self.stdout.write(f"📧 Email: {email}")
            self.stdout.write(f"👤 Name: {first_name} {last_name}")
            self.stdout.write(f"🏢 Tenant: {tenant.name}")
            self.stdout.write("⚠️  Please change this password after first login!")
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Failed to create superuser: {e}")
            ) 