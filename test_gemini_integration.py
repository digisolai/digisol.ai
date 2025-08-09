#!/usr/bin/env python3
"""
Test script to verify Gemini integration is working properly.
Run this after setting up your API keys to test the connection.
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digisol_ai.settings')
django.setup()

from ai_services.gemini_utils import call_gemini_api, call_gemini_for_ai_agent, call_gemini_for_content_generation
from django.conf import settings

def test_gemini_connection():
    """Test basic Gemini API connection."""
    print("🔍 Testing Gemini API Connection...")
    
    # Check if API key is configured
    if not settings.GOOGLE_GEMINI_API_KEY:
        print("❌ ERROR: GOOGLE_GEMINI_API_KEY not configured in settings")
        print("   Please add your Gemini API key to your environment file")
        return False
    
    if settings.GOOGLE_GEMINI_API_KEY == 'your_gemini_key_here':
        print("❌ ERROR: GOOGLE_GEMINI_API_KEY is still set to placeholder value")
        print("   Please replace with your actual Gemini API key")
        return False
    
    print(f"✅ API Key configured: {settings.GOOGLE_GEMINI_API_KEY[:10]}...")
    
    try:
        # Test basic API call
        response = call_gemini_api(
            prompt="Hello! Please respond with 'Gemini integration is working!'",
            max_tokens=50,
            temperature=0.1
        )
        
        print(f"✅ Basic API call successful!")
        print(f"📝 Response: {response}")
        return True
        
    except Exception as e:
        print(f"❌ API call failed: {str(e)}")
        return False

def test_ai_agent_functionality():
    """Test AI agent functionality."""
    print("\n🤖 Testing AI Agent Functionality...")
    
    try:
        response = call_gemini_for_ai_agent(
            prompt="What are the key principles of lead nurturing?",
            agent_name="Lead Nurturing Specialist",
            agent_personality="A lead nurturing specialist who develops personalized engagement strategies.",
            specialization="lead_nurturing",
            context={"user_tenant": "Test Company"}
        )
        
        print(f"✅ AI Agent call successful!")
        print(f"📝 Response: {response[:200]}...")
        return True
        
    except Exception as e:
        print(f"❌ AI Agent call failed: {str(e)}")
        return False

def test_content_generation():
    """Test content generation functionality."""
    print("\n✍️ Testing Content Generation...")
    
    try:
        response = call_gemini_for_content_generation(
            prompt="Create a compelling email subject line for a product launch",
            content_type="email_subject",
            brand_context="Tech startup launching a new AI tool"
        )
        
        print(f"✅ Content generation successful!")
        print(f"📝 Response: {response}")
        return True
        
    except Exception as e:
        print(f"❌ Content generation failed: {str(e)}")
        return False

def main():
    """Run all tests."""
    print("🚀 Gemini Integration Test Suite")
    print("=" * 50)
    
    # Test basic connection
    connection_ok = test_gemini_connection()
    
    if not connection_ok:
        print("\n❌ Basic connection failed. Please check your API key configuration.")
        return
    
    # Test AI agent functionality
    agent_ok = test_ai_agent_functionality()
    
    # Test content generation
    content_ok = test_content_generation()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   Basic Connection: {'✅ PASS' if connection_ok else '❌ FAIL'}")
    print(f"   AI Agent: {'✅ PASS' if agent_ok else '❌ FAIL'}")
    print(f"   Content Generation: {'✅ PASS' if content_ok else '❌ FAIL'}")
    
    if connection_ok and agent_ok and content_ok:
        print("\n🎉 All tests passed! Your Gemini integration is working perfectly!")
        print("   You can now use the chat functionality in your application.")
    else:
        print("\n⚠️ Some tests failed. Please check the error messages above.")
        print("   Make sure your API key is valid and has sufficient quota.")

if __name__ == "__main__":
    main()
