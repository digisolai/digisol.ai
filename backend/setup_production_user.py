#!/usr/bin/env python3
"""
Setup production superuser for DigiSol.AI
This script should be run during deployment to ensure a superuser exists.
"""

import os
import sys
import django

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from django.core.management import execute_from_command_line

def setup_production_superuser():
    """Nuke all users and create a fresh superuser"""
    try:
        print("🔧 Setting up production superuser...")
        
        # Run the nuke command
        execute_from_command_line(['manage.py', 'nuke_all_users', '--force'])
        
        print("🎉 Production superuser setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to setup superuser: {e}")
        return False

if __name__ == "__main__":
    success = setup_production_superuser()
    if success:
        print("🎉 Production superuser setup completed successfully!")
    else:
        print("💥 Production superuser setup failed!")
        sys.exit(1)
