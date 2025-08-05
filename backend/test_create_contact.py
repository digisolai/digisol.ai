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
from core.serializers import ContactSerializer

def test_create_contact():
    print("Testing Contact Creation...")
    
    # Get or create a tenant
    tenant, created = Tenant.objects.get_or_create(
        name="Test Tenant for API",
        defaults={
            'subdomain': 'test-api',
            'is_active': True
        }
    )
    print(f"Using tenant: {tenant.name} (created: {created})")
    
    # Create a test contact
    contact_data = {
        'first_name': 'Test',
        'last_name': 'Contact',
        'email': 'test@example.com',
        'company': 'Test Company',
        'job_title': 'Test Role',
        'lead_source': 'Website',
        'lead_status': 'New Lead',
        'priority': 'Medium',
        'score': 0
    }
    
    try:
        contact = Contact.objects.create(tenant=tenant, **contact_data)
        print(f"Successfully created contact: {contact.first_name} {contact.last_name}")
        print(f"Contact ID: {contact.id}")
        print(f"Contact email: {contact.email}")
        print(f"Contact tenant: {contact.tenant.name}")
        
        # Test serialization
        serializer = ContactSerializer(contact)
        print(f"Serialized data: {serializer.data}")
        
    except Exception as e:
        print(f"Error creating contact: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_create_contact() 