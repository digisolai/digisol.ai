from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Tenant
from accounts.models import CustomUser


class Command(BaseCommand):
    help = 'Create a test user with tenant for testing campaigns'

    def handle(self, *args, **options):
        self.stdout.write('Creating test user and tenant...')
        
        # Create or get a tenant
        tenant, created = Tenant.objects.get_or_create(
            name='Test Tenant',
            defaults={
                'subdomain': 'test',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(f'Created tenant: {tenant.name}')
        else:
            self.stdout.write(f'Using existing tenant: {tenant.name}')
        
        # Create or get a test user
        user, created = CustomUser.objects.get_or_create(
            email='test@example.com',
            defaults={
                'username': 'testuser',
                'first_name': 'Test',
                'last_name': 'User',
                'tenant': tenant,
                'is_staff': True,
                'is_active': True,
                'is_tenant_admin': True,
                'role': 'tenant_admin'
            }
        )
        
        if created:
            self.stdout.write(f'Created test user: {user.email}')
        else:
            # Update existing user to ensure they have the tenant
            user.tenant = tenant
            user.save()
            self.stdout.write(f'Updated existing user: {user.email}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Test user created successfully!\n'
                f'Email: {user.email}\n'
                f'Password: (use Django admin or create password)\n'
                f'Tenant: {tenant.name}'
            )
        ) 