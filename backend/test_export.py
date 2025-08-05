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
from django.urls import reverse

def test_export_csv():
    print("Testing CSV Export...")
    
    client = Client()
    
    try:
        # Test the export endpoint
        response = client.get('/api/accounts/contacts/export-csv/')
        
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.get('Content-Type')}")
        print(f"Content-Disposition: {response.get('Content-Disposition')}")
        print(f"Content Length: {len(response.content)} bytes")
        
        if response.status_code == 200:
            print("✅ Export endpoint is working!")
            
            # Save the CSV content to a file for inspection
            with open('test_export.csv', 'wb') as f:
                f.write(response.content)
            print("📄 CSV file saved as 'test_export.csv'")
            
            # Show first few lines of the CSV
            content = response.content.decode('utf-8')
            lines = content.split('\n')[:5]  # First 5 lines
            print("\n📋 First few lines of CSV:")
            for i, line in enumerate(lines, 1):
                print(f"{i}: {line}")
                
        else:
            print("❌ Export endpoint returned an error")
            print(f"Response content: {response.content.decode('utf-8')}")
            
    except Exception as e:
        print(f"❌ Error testing export: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_export_csv() 