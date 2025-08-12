#!/usr/bin/env python3
"""
Script to set up superuser with unlimited access for marketing purposes.
Run this script to configure your superuser account to appear as a fully paid customer.
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings_render')
django.setup()

from django.core.management import call_command
from django.core.management.base import CommandError

def main():
    """Set up superuser with unlimited access"""
    print("🚀 Setting up superuser with unlimited access...")
    print("=" * 50)
    
    try:
        # Run the management command
        call_command('setup_superuser_unlimited', email='cam.r.brown82@gmail.com')
        
        print("\n✅ Success! Your superuser account now has unlimited access.")
        print("\n📋 What this means:")
        print("   • You'll appear as a fully paid customer")
        print("   • All features will be available without restrictions")
        print("   • No upgrade prompts will be shown")
        print("   • Perfect for marketing and demonstration purposes")
        
        print("\n🎯 Next steps:")
        print("   1. Log into your superuser account")
        print("   2. All features should now be fully accessible")
        print("   3. You can demonstrate the full power of DigiSol.AI")
        
        print("\n💡 For regular users:")
        print("   • All features are still visible and explorable")
        print("   • Upgrade prompts will guide them to paid plans")
        print("   • No features are hidden - just limited usage")
        
    except CommandError as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
