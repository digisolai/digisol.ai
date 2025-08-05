from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import CustomUser
from core.models import Tenant

class Command(BaseCommand):
    help = 'Setup authentication with a superuser account and tenant'

    def handle(self, *args, **options):
        self.stdout.write("🔍 Setting up authentication...")
        
        # Check existing users
        users = CustomUser.objects.all()
        self.stdout.write(f"Found {users.count()} existing users")
        
        # Check existing tenants
        tenants = Tenant.objects.all()
        self.stdout.write(f"Found {tenants.count()} existing tenants")
        
        # Create a default tenant if none exists
        if tenants.count() == 0:
            self.stdout.write("🏢 Creating default tenant...")
            try:
                tenant = Tenant.objects.create(
                    name="DigiSol AI Demo",
                    subdomain="demo",
                    is_active=True
                )
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Tenant created successfully: {tenant.name}")
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"❌ Failed to create tenant: {e}")
                )
                return
        else:
            tenant = tenants.first()
            self.stdout.write(f"✅ Using existing tenant: {tenant.name}")
        
        if users.count() == 0:
            self.stdout.write("❌ No users found. Creating superuser...")
            
            try:
                # Create superuser
                email = "admin@digisol.ai"
                password = "admin123456"
                
                user = CustomUser.objects.create_superuser(
                    email=email,
                    password=password,
                    first_name="Admin",
                    last_name="User"
                )
                
                # Assign tenant to the user
                user.tenant = tenant
                user.save()
                
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Superuser created successfully!")
                )
                self.stdout.write(f"📧 Email: {email}")
                self.stdout.write(f"🔑 Password: {password}")
                self.stdout.write(f"🏢 Tenant: {tenant.name}")
                self.stdout.write("⚠️  Please change this password after first login!")
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"❌ Failed to create superuser: {e}")
                )
        else:
            self.stdout.write("✅ Users already exist in database")
            
            # Show existing users and ensure they have tenants
            for user in users:
                if not user.tenant:
                    self.stdout.write(f"⚠️  User {user.email} has no tenant. Assigning default tenant...")
                    user.tenant = tenant
                    user.save()
                    self.stdout.write(f"✅ Assigned tenant {tenant.name} to {user.email}")
                else:
                    self.stdout.write(f"📧 {user.email} (Superuser: {user.is_superuser}, Tenant: {user.tenant.name})")
        
        self.stdout.write("🎉 Authentication setup complete!") 