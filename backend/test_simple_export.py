#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings')
django.setup()

from django.test import Client

def test_simple_endpoints():
    print("Testing simple endpoints...")
    
    client = Client()
    
    # Test the basic contacts endpoint first
    try:
        response = client.get('/api/accounts/contacts/')
        print(f"Basic contacts endpoint - Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Basic contacts endpoint works")
        else:
            print(f"❌ Basic contacts endpoint failed: {response.content.decode('utf-8')}")
    except Exception as e:
        print(f"❌ Error testing basic contacts: {e}")
    
    # Test the export endpoint
    try:
        response = client.get('/api/accounts/contacts/export-csv/')
        print(f"Export endpoint - Status: {response.status_code}")
        print(f"Content-Type: {response.get('Content-Type')}")
        print(f"Content-Disposition: {response.get('Content-Disposition')}")
        
        if response.status_code == 200:
            print("✅ Export endpoint works!")
            print(f"Content length: {len(response.content)} bytes")
        else:
            print(f"❌ Export endpoint failed: {response.content.decode('utf-8')}")
    except Exception as e:
        print(f"❌ Error testing export: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_simple_endpoints() 