#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_minimal')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth.models import User

# Create test user
email = 'cam.r.brown82@gmail.com'
username = 'cam'
password = 'testpassword123'

# Delete existing user if exists
User.objects.filter(email=email).delete()
User.objects.filter(username=username).delete()

# Create new user
user = User.objects.create_user(
    username=username,
    email=email,
    password=password,
    first_name='Cam',
    last_name='Brown'
)

print(f"User created successfully: {user.username} ({user.email})")
print(f"User ID: {user.id}")
print(f"Is superuser: {user.is_superuser}")
print("Test credentials:")
print(f"Email: {email}")
print(f"Password: {password}")