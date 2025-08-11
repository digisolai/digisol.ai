#!/usr/bin/env python3
"""
Simple script to check Gemini API quota status.
"""

import requests
import json

def check_quota_status():
    """Check the current quota status from the API."""
    
    # API endpoint
    url = "https://digisol-backend.onrender.com/api/ai-services/quota-status/"
    
    try:
        # Make the request
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            quota_status = data.get('quota_status', {})
            
            print("🔍 Gemini API Quota Status:")
            print("=" * 40)
            print(f"Daily Used: {quota_status.get('daily_used', 0)}/{quota_status.get('daily_limit', 50)}")
            print(f"Daily Remaining: {quota_status.get('daily_remaining', 50)}")
            print(f"Minute Used: {quota_status.get('minute_used', 0)}/{quota_status.get('minute_limit', 2)}")
            print(f"Minute Remaining: {quota_status.get('minute_remaining', 2)}")
            print(f"Quota Exceeded: {quota_status.get('quota_exceeded', False)}")
            
            if quota_status.get('quota_exceeded', False):
                print("\n❌ QUOTA EXCEEDED - API calls are blocked")
            else:
                print("\n✅ Quota OK - API calls are allowed")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error checking quota: {str(e)}")

if __name__ == "__main__":
    check_quota_status()
