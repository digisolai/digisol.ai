#!/usr/bin/env python3
"""
Test script to check server status and deployment.
"""

import requests
import time

def test_server_status():
    """Test if the server is responding."""
    
    base_url = "https://digisol-backend.onrender.com"
    endpoints = [
        "/",
        "/health/",
        "/api/accounts/token/"
    ]
    
    print("Testing DigiSol Backend Server Status")
    print("=" * 50)
    
    for endpoint in endpoints:
        url = base_url + endpoint
        print(f"\nTesting: {url}")
        print("-" * 30)
        
        try:
            # Test with a simple GET request first
            response = requests.get(url, timeout=10)
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers:")
            for header, value in response.headers.items():
                if 'access-control' in header.lower() or 'content-type' in header.lower():
                    print(f"  {header}: {value}")
            
            if response.status_code == 200:
                print("✅ Server is responding")
            elif response.status_code == 405:
                print("⚠️  Method not allowed (expected for some endpoints)")
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
                
        except requests.exceptions.Timeout:
            print("❌ Request timed out - server might be starting up")
        except requests.exceptions.ConnectionError:
            print("❌ Connection error - server might be down")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("Server Status Test Complete")

if __name__ == "__main__":
    test_server_status()
