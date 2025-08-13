from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import CustomUser


class Command(BaseCommand):
    help = 'Create a test user with tenant for testing campaigns'

    def handle(self, *args, **options):
        self.stdout.write('Creating test user and tenant...')
        
        # No tenant needed for simplified system
        
        # Create or get a test user
        user, created = CustomUser.objects.get_or_create(
            email='admin@digisolai.ca',
            defaults={
                'username': 'admin',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_active': True,
                'role': 'admin'
            }
        )
        
        if created:
            self.stdout.write(f'Created test user: {user.email}')
        else:
            # Update existing user
            user.save()
            self.stdout.write(f'Updated existing user: {user.email}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Test user created successfully!\n'
                f'Email: {user.email}\n'
                f'Password: (use Django admin or create password)'
            )
        ) 