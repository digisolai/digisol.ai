#!/usr/bin/env python3
"""
Create database in AWS RDS using Python
"""

import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    """Create the digisol_ai_prod database"""
    
    # Database connection parameters
    DB_HOST = "digisol-ai-production.cfgcmkkkw211.us-west-2.rds.amazonaws.com"
    DB_USER = "digisol_ai_user"  # ✅ Correct username from your RDS
    DB_PASSWORD = input("Enter your database password: ")  # Secure input
    DB_PORT = "5432"
    
    print("🔧 Creating database digisol_ai_prod...")
    
    try:
        # Connect to the default postgres database
        conn = psycopg2.connect(
            dbname="postgres",
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            sslmode='require'
        )
        
        # Set isolation level to autocommit
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        cursor = conn.cursor()
        
        # Create the database
        cursor.execute("CREATE DATABASE digisol_ai_prod;")
        print("✅ Database 'digisol_ai_prod' created successfully!")
        
        # Grant privileges
        cursor.execute("GRANT ALL PRIVILEGES ON DATABASE digisol_ai_prod TO digisol_ai_user;")
        print("✅ Privileges granted to digisol_ai_user!")
        
        cursor.close()
        conn.close()
        
        # Test connection to the new database
        print("🔍 Testing connection to new database...")
        test_conn = psycopg2.connect(
            dbname="digisol_ai_prod",
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            sslmode='require'
        )
        
        test_cursor = test_conn.cursor()
        test_cursor.execute("SELECT current_database();")
        db_name = test_cursor.fetchone()[0]
        print(f"✅ Successfully connected to database: {db_name}")
        
        test_cursor.close()
        test_conn.close()
        
        print("🎉 Database setup complete!")
        
    except psycopg2.Error as e:
        print(f"❌ Database creation failed: {e}")
        if "already exists" in str(e):
            print("ℹ️  Database already exists, continuing...")
        else:
            raise

if __name__ == "__main__":
    create_database()
