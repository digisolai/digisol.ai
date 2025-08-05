#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings')
django.setup()

from core.models import Contact, Tenant
from accounts.models import CustomUser

def test_contacts():
    print("Testing Contacts API...")
    
    # Check if we have any tenants
    tenants = Tenant.objects.all()
    print(f"Found {tenants.count()} tenants")
    
    # Check if we have any contacts
    contacts = Contact.objects.all()
    print(f"Found {contacts.count()} contacts")
    
    # Check contacts by tenant
    for tenant in tenants:
        tenant_contacts = Contact.objects.filter(tenant=tenant)
        print(f"Tenant {tenant.name}: {tenant_contacts.count()} contacts")
    
    # Test the all_tenants method
    all_contacts = Contact.objects.all_tenants()
    print(f"All tenants method returns: {all_contacts.count()} contacts")
    
    # Check if there are any users
    users = CustomUser.objects.all()
    print(f"Found {users.count()} users")

if __name__ == "__main__":
    test_contacts() 