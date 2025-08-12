# Manual Production Database Fix

## 🚨 **Current Issue**
- Production backend is running but login fails
- Registration endpoint gives 500 errors
- Database reset command didn't work during deployment
- No valid users exist in production

## 🔧 **Solution: Manual Database Reset**

### Step 1: Access Render Shell
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your `digisol-backend` service
3. Click on the service
4. Go to "Shell" tab
5. Click "Connect" to open a shell

### Step 2: Run Manual Database Reset
In the Render shell, run these commands:

```bash
# Navigate to the backend directory
cd backend

# Activate the virtual environment (if needed)
source venv/bin/activate

# Run the database reset command
python manage.py reset_production_db --force
```

### Step 3: Alternative - Direct User Creation
If the reset command doesn't work, try creating a user directly:

```bash
# Navigate to the backend directory
cd backend

# Activate the virtual environment (if needed)
source venv/bin/activate

# Run Django shell
python manage.py shell

# In the Django shell, create a superuser:
from django.contrib.auth import get_user_model
User = get_user_model()

# Delete all existing users
User.objects.all().delete()

# Create a new superuser
superuser = User.objects.create_superuser(
    username='admin',
    email='admin@digisolai.ca',
    password='admin123456',
    first_name='Admin',
    last_name='User'
)

print(f"Created superuser: {superuser.email}")

# Exit the shell
exit()
```

### Step 4: Test the Fix
After running the commands, test the login:

```bash
# Test the login
curl -X POST https://digisol-backend.onrender.com/api/accounts/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digisolai.ca","password":"admin123456"}'
```

## 📋 **Expected Results**
After the manual fix:
- ✅ Login should work with `admin@digisolai.ca` / `admin123456`
- ✅ Admin interface should be accessible
- ✅ Registration endpoint should work
- ✅ All API endpoints should function normally

## 🔍 **If Manual Fix Doesn't Work**

### Check Database Connection
```bash
# In Render shell
python manage.py dbshell
```

### Check Environment Variables
```bash
# In Render shell
echo $DATABASE_URL
```

### Check Migration Status
```bash
# In Render shell
python manage.py showmigrations
```

## 🚀 **Prevention for Future Deployments**

To prevent this issue in future deployments:

1. **Add better error handling** to the reset command
2. **Add logging** to see what's happening during deployment
3. **Test the reset command locally** before deploying
4. **Add database connection checks** before running reset

## 📞 **Next Steps**
1. Access Render shell and run the manual reset
2. Test login functionality
3. If it works, the issue is resolved
4. If it doesn't work, we need to investigate further (database connection, environment variables, etc.)
