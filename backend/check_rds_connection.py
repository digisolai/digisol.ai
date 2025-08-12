#!/usr/bin/env python3
"""
Check RDS connection and verify credentials
"""

import os
import psycopg2

def check_rds_connection():
    """Check RDS connection with different credentials"""
    
    # RDS connection details
    DB_HOST = "digisol-ai-production.cfgcmkkkw211.us-west-2.rds.amazonaws.com"
    DB_PORT = "5432"
    
    print("🔍 Checking RDS connection...")
    print(f"Host: {DB_HOST}")
    print(f"Port: {DB_PORT}")
    print()
    
    # Try different common usernames
    usernames = [
        "digisol_user",
        "digisol_ai_user", 
        "postgres",
        "admin",
        "master"
    ]
    
    for username in usernames:
        print(f"Testing username: {username}")
        
        # Try to connect with a test password
        try:
            conn = psycopg2.connect(
                dbname="postgres",
                user=username,
                password="test_password",
                host=DB_HOST,
                port=DB_PORT,
                sslmode='require',
                connect_timeout=5
            )
            print(f"✅ Connected with {username}!")
            conn.close()
            return username
        except psycopg2.OperationalError as e:
            if "password authentication failed" in str(e):
                print(f"   ❌ Password wrong for {username}")
            elif "does not exist" in str(e):
                print(f"   ❌ User {username} does not exist")
            else:
                print(f"   ❌ Connection failed: {e}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print()
    print("🔧 Next steps:")
    print("1. Go to AWS RDS Console")
    print("2. Click on your database: digisol-ai-production")
    print("3. Check the 'Configuration' tab for the master username")
    print("4. Reset the password if needed")
    
    return None

def test_with_correct_credentials():
    """Test with user-provided credentials"""
    
    print("\n🔧 Manual credential test:")
    username = input("Enter username: ")
    password = input("Enter password: ")
    
    DB_HOST = "digisol-ai-production.cfgcmkkkw211.us-west-2.rds.amazonaws.com"
    DB_PORT = "5432"
    
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user=username,
            password=password,
            host=DB_HOST,
            port=DB_PORT,
            sslmode='require'
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT current_user, current_database();")
        user, db = cursor.fetchone()
        print(f"✅ Success! Connected as {user} to {db}")
        
        # List databases
        cursor.execute("SELECT datname FROM pg_database;")
        databases = [row[0] for row in cursor.fetchall()]
        print(f"📋 Available databases: {databases}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 RDS Connection Troubleshooter")
    print("=" * 40)
    
    # First, try to detect the correct username
    correct_username = check_rds_connection()
    
    if correct_username:
        print(f"\n✅ Found working username: {correct_username}")
        print("Now you need to find the correct password.")
    
    # Manual test
    test_with_correct_credentials()
