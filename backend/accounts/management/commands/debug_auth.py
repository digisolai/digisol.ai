from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model, authenticate
from django.db import connection
import requests
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Debug authentication issues and database state'

    def handle(self, *args, **options):
        self.stdout.write("🔍 Testing Database State and Authentication")
        self.stdout.write("=" * 50)
        
        # Test database connection
        self.test_database_connection()
        
        # Check table structure
        self.check_user_table()
        
        # Check existing users
        user_count = self.check_existing_users()
        
        # Create superuser if needed
        if user_count == 0:
            self.create_test_superuser()
        else:
            self.create_test_superuser()  # Try anyway to ensure we have one
        
        # Test user creation
        self.test_user_creation()
        
        # Test authentication locally
        self.test_local_authentication()
        
        # Test API endpoints
        self.test_api_endpoints()
        
        self.stdout.write("\n" + "=" * 50)
        self.stdout.write("🏁 Testing complete!")

    def test_database_connection(self):
        """Test if we can connect to the database"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()
                self.stdout.write(f"✅ Database connection successful: {version[0]}")
                return True
        except Exception as e:
            self.stdout.write(f"❌ Database connection failed: {e}")
            return False

    def check_user_table(self):
        """Check the structure of the custom_users table"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = 'custom_users'
                    ORDER BY ordinal_position;
                """)
                columns = cursor.fetchall()
                self.stdout.write("\n📋 Custom Users Table Structure:")
                for col in columns:
                    self.stdout.write(f"  {col[0]}: {col[1]} (nullable: {col[2]}, default: {col[3]})")
                return True
        except Exception as e:
            self.stdout.write(f"❌ Failed to check user table: {e}")
            return False

    def check_existing_users(self):
        """Check if there are any users in the database"""
        try:
            users = User.objects.all()
            self.stdout.write(f"\n👥 Found {users.count()} users in database:")
            for user in users:
                self.stdout.write(f"  - {user.email} (active: {user.is_active}, staff: {user.is_staff}, superuser: {user.is_superuser})")
                # Check if password is properly hashed
                if user.password.startswith('pbkdf2_sha256$'):
                    self.stdout.write(f"    ✅ Password properly hashed")
                else:
                    self.stdout.write(f"    ❌ Password not properly hashed: {user.password[:50]}...")
            return users.count()
        except Exception as e:
            self.stdout.write(f"❌ Failed to check users: {e}")
            return 0

    def create_test_superuser(self):
        """Create a test superuser"""
        try:
            # Check if superuser already exists
            if User.objects.filter(is_superuser=True).exists():
                self.stdout.write("\n✅ Superuser already exists")
                return True
            
            # Create superuser
            user = User.objects.create_superuser(
                username='admin',
                email='admin@digisolai.ca',
                password='admin123456',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(f"\n✅ Created superuser: {user.email}")
            return True
        except Exception as e:
            self.stdout.write(f"❌ Failed to create superuser: {e}")
            return False

    def test_user_creation(self):
        """Test creating a regular user"""
        try:
            # Delete test user if exists
            User.objects.filter(email='test@example.com').delete()
            
            # Create test user
            user = User.objects.create_user(
                username='testuser',
                email='test@example.com',
                password='test123456',
                first_name='Test',
                last_name='User'
            )
            self.stdout.write(f"\n✅ Created test user: {user.email} (active: {user.is_active})")
            
            # Test authentication
            auth_user = authenticate(username='test@example.com', password='test123456')
            if auth_user:
                self.stdout.write(f"✅ Authentication successful for {auth_user.email}")
            else:
                self.stdout.write("❌ Authentication failed")
            
            return True
        except Exception as e:
            self.stdout.write(f"❌ Failed to create test user: {e}")
            return False

    def test_local_authentication(self):
        """Test authentication locally with the superuser"""
        try:
            # Get the superuser
            superuser = User.objects.filter(is_superuser=True).first()
            if not superuser:
                self.stdout.write("❌ No superuser found for authentication test")
                return False
            
            self.stdout.write(f"\n🔐 Testing local authentication with {superuser.email}")
            
            # Test with email
            auth_user = authenticate(username=superuser.email, password='admin123456')
            if auth_user:
                self.stdout.write(f"✅ Local authentication successful with email")
            else:
                self.stdout.write("❌ Local authentication failed with email")
            
            # Test with username
            auth_user = authenticate(username=superuser.username, password='admin123456')
            if auth_user:
                self.stdout.write(f"✅ Local authentication successful with username")
            else:
                self.stdout.write("❌ Local authentication failed with username")
            
            # Check password directly
            if superuser.check_password('admin123456'):
                self.stdout.write("✅ Password check successful")
            else:
                self.stdout.write("❌ Password check failed")
            
            return True
        except Exception as e:
            self.stdout.write(f"❌ Failed to test local authentication: {e}")
            return False

    def test_api_endpoints(self):
        """Test the API endpoints"""
        base_url = "https://digisol-backend.onrender.com"
        
        # Test health endpoint
        try:
            response = requests.get(f"{base_url}/api/core/health/")
            self.stdout.write(f"\n🏥 Health endpoint: {response.status_code}")
            if response.status_code == 200:
                self.stdout.write(f"  Response: {response.json()}")
        except Exception as e:
            self.stdout.write(f"❌ Health endpoint failed: {e}")
        
        # Test registration endpoint
        try:
            data = {
                "username": "apitest",
                "email": "apitest@example.com",
                "password": "apitest123456",
                "first_name": "API",
                "last_name": "Test"
            }
            response = requests.post(f"{base_url}/api/accounts/register/", json=data)
            self.stdout.write(f"\n📝 Registration endpoint: {response.status_code}")
            if response.status_code in [200, 201, 400]:
                self.stdout.write(f"  Response: {response.json()}")
        except Exception as e:
            self.stdout.write(f"❌ Registration endpoint failed: {e}")
        
        # Test login endpoint with email
        try:
            data = {
                "email": "admin@digisolai.ca",
                "password": "admin123456"
            }
            response = requests.post(f"{base_url}/api/accounts/token/", json=data)
            self.stdout.write(f"\n🔑 Login endpoint (email): {response.status_code}")
            if response.status_code in [200, 400, 401]:
                self.stdout.write(f"  Response: {response.json()}")
        except Exception as e:
            self.stdout.write(f"❌ Login endpoint failed: {e}")
        
        # Test login endpoint with username
        try:
            data = {
                "username": "admin@digisolai.ca",
                "password": "admin123456"
            }
            response = requests.post(f"{base_url}/api/accounts/token/", json=data)
            self.stdout.write(f"\n🔑 Login endpoint (username): {response.status_code}")
            if response.status_code in [200, 400, 401]:
                self.stdout.write(f"  Response: {response.json()}")
        except Exception as e:
            self.stdout.write(f"❌ Login endpoint failed: {e}")
