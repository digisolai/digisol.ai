#!/usr/bin/env python3
"""
Script to set the admin password for development
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings')
django.setup()

from accounts.models import CustomUser

def set_admin_password():
    """Set the admin password to a known value for development"""
    
    email = "admin@digisolai.ca"
    password = "admin123"  # Simple password for development
    
    try:
        # Find the admin user
        user = CustomUser.objects.get(email=email)
        
        # Set the password
        user.set_password(password)
        user.save()
        
        print(f"✅ Password updated successfully for {email}")
        print(f"🔑 New password: {password}")
        print("⚠️  Remember to change this password in production!")
        
        # Verify the password works
        if user.check_password(password):
            print("✅ Password verification successful!")
        else:
            print("❌ Password verification failed!")
            
    except CustomUser.DoesNotExist:
        print(f"❌ User {email} not found!")
        print("Creating new superuser...")
        
        # Create the superuser
        user = CustomUser.objects.create_superuser(
            email=email,
            password=password,
            first_name="Admin",
            last_name="User"
        )
        
        print(f"✅ Superuser created successfully!")
        print(f"📧 Email: {email}")
        print(f"🔑 Password: {password}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    set_admin_password()
