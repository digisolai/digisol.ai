# 🚀 Deployment Guide - DigiSol AI

## 🔍 **Step 1: GitHub Repository Verification**

### Verify Repository Status
Run these commands in a terminal where Git is available:

```bash
# Check current status
git status

# Verify remote repository
git remote -v
# Should show: origin  https://github.com/digisolai/digisol.ai.git

# Check recent commits
git log --oneline -5

# Verify .env is ignored
git check-ignore backend/.env
# Should return: backend/.env

# Check if .gitignore is working
git check-ignore backend/.env.example
# Should return nothing (not ignored)
```

### GitHub Repository Checklist
- [ ] Repository is public/private as intended
- [ ] No `.env` files visible in repository
- [ ] `.gitignore` file is present and working
- [ ] `README.md` is visible and complete
- [ ] All source code is properly committed

## 🚀 **Step 2: Netlify Deployment Setup**

### Option A: Deploy via Netlify UI (Recommended)

1. **Go to Netlify**: https://app.netlify.com/
2. **Click "Add new site"** → "Import an existing project"
3. **Connect to GitHub** and select your repository
4. **Configure build settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. **Click "Deploy site"**

### Option B: Deploy via Git Integration

1. **Connect GitHub repository** to Netlify
2. **Netlify will automatically detect** the `netlify.toml` configuration
3. **Build settings are already configured** in `frontend/netlify.toml`

## ⚙️ **Step 3: Environment Variables for Netlify**

### Frontend Environment Variables
Add these in Netlify Dashboard → Site settings → Environment variables:

```env
# API Endpoints
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Analytics
VITE_GOOGLE_ANALYTICS_ID=your-ga-id

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ANALYTICS=true
```

### Backend Environment Variables (Separate Deployment)
For your Django backend, you'll need to deploy it separately (Heroku, Railway, etc.) with:

```env
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=your-production-database-url
# ... other backend environment variables
```

## 🔧 **Step 4: Build Verification**

### Test Local Build
```bash
cd frontend
npm install
npm run build
```

### Check Build Output
- Verify `dist/` folder is created
- Check that all assets are properly built
- Ensure no TypeScript errors

## 🌐 **Step 5: Domain Configuration**

### Custom Domain (Optional)
1. **Add custom domain** in Netlify Dashboard
2. **Configure DNS** settings
3. **Enable HTTPS** (automatic with Netlify)

### Subdomain Setup
- **Frontend**: `app.yourdomain.com` or `digisol.yourdomain.com`
- **Backend**: `api.yourdomain.com` or `backend.yourdomain.com`

## 🔒 **Step 6: Security Verification**

### Frontend Security
- [ ] Environment variables are set in Netlify (not in code)
- [ ] API keys are not exposed in frontend code
- [ ] HTTPS is enabled
- [ ] Security headers are configured (already in netlify.toml)

### Backend Security
- [ ] `.env` file is not in Git repository
- [ ] Production environment variables are set
- [ ] Database is properly secured
- [ ] CORS is configured for frontend domain

## 📊 **Step 7: Post-Deployment Testing**

### Frontend Testing
- [ ] All pages load correctly
- [ ] Navigation works properly
- [ ] Forms submit successfully
- [ ] API calls work with backend
- [ ] Responsive design works on mobile

### Backend Testing
- [ ] API endpoints respond correctly
- [ ] Database connections work
- [ ] Authentication flows work
- [ ] File uploads work (if applicable)

## 🔄 **Step 8: Continuous Deployment**

### Automatic Deployments
- [ ] Netlify auto-deploys on Git push
- [ ] Branch deployments work for testing
- [ ] Preview deployments for pull requests

### Manual Deployments
```bash
# Trigger manual deployment
git push origin main
```

## 🚨 **Troubleshooting**

### Common Issues

1. **Build Fails**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables Not Working**
   - Verify variables are set in Netlify Dashboard
   - Check variable names (must start with `VITE_`)
   - Restart build after adding variables

3. **API Calls Fail**
   - Check CORS configuration on backend
   - Verify API base URL is correct
   - Check backend is deployed and accessible

4. **Assets Not Loading**
   - Check build output in `dist/` folder
   - Verify asset paths in code
   - Check Netlify redirects configuration

## 📈 **Step 9: Monitoring & Analytics**

### Performance Monitoring
- [ ] Set up Netlify Analytics
- [ ] Configure Google Analytics
- [ ] Monitor build times
- [ ] Track user interactions

### Error Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Monitor API response times
- [ ] Track failed builds
- [ ] Set up alerts for downtime

---

**Next Steps**: 
1. Verify GitHub repository ✅
2. Deploy to Netlify 🚀
3. Configure environment variables ⚙️
4. Test all functionality 🧪
5. Set up monitoring 📊 