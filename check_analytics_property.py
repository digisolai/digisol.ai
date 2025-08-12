#!/usr/bin/env python3
"""
Check Google Analytics Property Type
This script helps identify if you have GA4 or Universal Analytics.
"""

def check_property_type():
    print("🔍 Google Analytics Property Type Checker")
    print("=" * 50)
    
    print("\n📊 Your Property ID: 500705696")
    print("\n🔍 Analysis:")
    
    if len("500705696") == 9 and "500705696".isdigit():
        print("❌ This appears to be a Universal Analytics (UA) Property ID")
        print("   - Format: 9 digits (no letters)")
        print("   - This is the OLD Google Analytics format")
        print("   - You need Google Analytics 4 (GA4) for the API integration")
    
    print("\n✅ What you need:")
    print("   - GA4 Property ID format: GA4-XXXXXXXXX")
    print("   - GA4 Measurement ID format: G-XXXXXXXXXX")
    
    print("\n🚀 Next Steps:")
    print("1. Go to https://analytics.google.com/")
    print("2. Check if you have any property starting with 'GA4-'")
    print("3. If not, create a new GA4 property:")
    print("   - Admin → Create Property → Web")
    print("   - Name: 'DigiSol AI'")
    print("   - Complete the setup")
    print("4. Get the new GA4 Property ID and Measurement ID")
    
    print("\n📋 After getting GA4 credentials:")
    print("   python setup_google_analytics.py")

if __name__ == "__main__":
    check_property_type()
