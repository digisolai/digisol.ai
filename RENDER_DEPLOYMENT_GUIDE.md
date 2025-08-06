# Render.com Deployment Guide - DigiSol AI Backend

## 🚀 **Quick Setup for Render.com**

### **Step 1: Create Render Account**
1. Go to https://render.com/
2. Sign up with GitHub
3. Connect your repository

### **Step 2: Create Web Service**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure settings:
   - **Name**: `digisol-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn --config gunicorn.conf.py digisol_ai.wsgi:application`
   - **Plan**: Free

### **Step 3: Set Environment Variables**
In Render Dashboard → Environment → Environment Variables:

```env
# Django Settings
DEBUG=False
SECRET_KEY=your-very-long-secret-key-here-at-least-50-characters
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
DJANGO_SETTINGS_MODULE=digisol_ai.settings_render

# Database (if using Render PostgreSQL)
DB_NAME=digisol_ai_production
DB_USER=digisol_user
DB_PASSWORD=your-database-password
DB_HOST=your-database-host
DB_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=https://www.digisol.ca,https://digisol.ca

# Optional: AI Services
OPENAI_API_KEY=your-openai-key
GOOGLE_GEMINI_API_KEY=your-gemini-key

# Optional: AWS S3 (if using)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=your-bucket-name
```

## 🔧 **Common Build Issues & Solutions**

### **Issue 1: ModuleNotFoundError: No module named 'pytest_django'**
**Solution**: ✅ Fixed - Updated production settings to exclude development apps

### **Issue 2: Static files collection fails**
**Solution**: ✅ Fixed - Added whitenoise for static file handling

### **Issue 3: Database connection fails**
**Solution**: 
- Check database credentials in environment variables
- Ensure database is accessible from Render
- Use Render PostgreSQL service if needed

### **Issue 4: Import errors for missing dependencies**
**Solution**: ✅ Fixed - Updated requirements_production.txt

### **Issue 5: Gunicorn configuration issues**
**Solution**: ✅ Fixed - Simplified gunicorn.conf.py

## 🐛 **Troubleshooting Steps**

### **1. Check Build Logs**
In Render Dashboard → Your Service → Logs:
- Look for specific error messages
- Check if all dependencies are installed
- Verify environment variables are set

### **2. Test Locally First**
```bash
cd backend
pip install -r requirements_production.txt
python manage.py collectstatic --noinput --settings=digisol_ai.settings_render
python manage.py migrate --settings=digisol_ai.settings_render
gunicorn --config gunicorn.conf.py digisol_ai.wsgi:application
```

### **3. Check Environment Variables**
Make sure these are set in Render:
- `SECRET_KEY` (at least 50 characters)
- `DJANGO_SETTINGS_MODULE=digisol_ai.settings_render`
- Database credentials if using external database

### **4. Database Issues**
If using AWS RDS:
- Ensure security groups allow Render IPs
- Check SSL configuration
- Verify connection string format

### **5. Static Files Issues**
- Check if `whitenoise` is installed
- Verify `STATIC_ROOT` directory exists
- Ensure `collectstatic` runs successfully

## 📋 **Render-Specific Configuration**

### **Using Render PostgreSQL (Recommended)**
1. Create PostgreSQL service in Render
2. Get connection details from Render dashboard
3. Update environment variables with Render database URL

### **Using External Database (AWS RDS)**
1. Ensure database is accessible from Render
2. Set proper environment variables
3. Check SSL configuration

### **Static Files on Render**
- Uses whitenoise for static file serving
- No need for external storage initially
- Can be upgraded to S3 later

## 🚀 **Deployment Checklist**

### **Before Deploying**
- [ ] All tests pass locally
- [ ] Requirements file is complete
- [ ] Environment variables are ready
- [ ] Database is accessible
- [ ] Static files collect successfully

### **After Deploying**
- [ ] Service starts without errors
- [ ] Health check endpoint responds
- [ ] Database migrations run successfully
- [ ] Static files are served correctly
- [ ] API endpoints are accessible

### **Testing the Deployment**
```bash
# Test health check
curl https://your-render-url.onrender.com/health/

# Test API endpoint
curl https://your-render-url.onrender.com/api/accounts/me/

# Test login
curl -X POST https://your-render-url.onrender.com/api/accounts/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

## 🔄 **Update Netlify Configuration**

Once your backend is deployed on Render:

1. **Get your Render URL** (e.g., `https://digisol-backend.onrender.com`)

2. **Update Netlify Environment Variables**:
   ```
   BACKEND_URL=https://your-render-url.onrender.com
   ```

3. **Redeploy Netlify** (should happen automatically)

## 🆘 **Getting Help**

### **If Build Still Fails:**
1. Share the exact error message from Render logs
2. Check if all environment variables are set
3. Verify the build command is correct
4. Test the build process locally

### **Common Error Messages:**
- `ModuleNotFoundError`: Missing dependency in requirements
- `ImportError`: Development app in production settings
- `Database connection failed`: Check database credentials
- `Static files error`: Check whitenoise configuration

### **Render Support:**
- Check Render documentation: https://render.com/docs
- Render community: https://community.render.com/
- Render status: https://status.render.com/ 