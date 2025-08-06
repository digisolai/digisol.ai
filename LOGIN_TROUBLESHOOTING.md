# Login Troubleshooting Guide

## Issue: Cannot log in when accessing the actual website

### ✅ Backend Status: WORKING
The debug script confirmed that:
- Backend server is running on port 8000
- Authentication API is working correctly
- Test user credentials are valid
- JWT tokens are being generated properly
- Frontend proxy is working

### 🔍 Troubleshooting Steps

#### 1. Clear Browser Data
```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
// Then refresh the page
```

#### 2. Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try to log in
4. Look for any error messages or the debug logs we added

#### 3. Check Network Tab
1. Open browser developer tools (F12)
2. Go to Network tab
3. Try to log in
4. Look for failed requests to `/api/accounts/token/`

#### 4. Test Credentials
Use these test credentials:
- **Email**: `test@example.com`
- **Password**: `testpass123`

#### 5. Access URLs Directly
Try accessing these URLs directly:
- Frontend: `http://localhost:5173`
- Login page: `http://localhost:5173/login`
- Backend API: `http://localhost:8000/api/accounts/token/`

#### 6. Check Server Status
Both servers should be running:
- Frontend (Vite): `http://localhost:5173`
- Backend (Django): `http://localhost:8000`

### 🐛 Common Issues and Solutions

#### Issue: "No active account found with the given credentials"
**Solution**: The test user might not exist. Create it:
```bash
cd backend
python manage.py shell -c "from accounts.models import CustomUser; CustomUser.objects.create_user(email='test@example.com', password='testpass123', first_name='Test', last_name='User')"
```

#### Issue: CORS errors in console
**Solution**: The proxy should handle this, but if you see CORS errors, check that the Vite dev server is running.

#### Issue: "Network Error" or "Failed to fetch"
**Solution**: 
1. Check if both servers are running
2. Check firewall settings
3. Try accessing the backend directly: `http://localhost:8000/api/accounts/me/`

#### Issue: Login appears to work but redirects back to login
**Solution**: 
1. Check if `isAuthenticated` state is being set correctly
2. Check if tokens are being stored in localStorage
3. Check if the user profile is being fetched successfully

### 🔧 Debug Information Added

We've added console logs to help debug:
- LoginPage.tsx: Logs login attempts and errors
- AuthContext.tsx: Logs the entire authentication flow

### 📞 Next Steps

1. Try the troubleshooting steps above
2. Check the browser console for our debug logs
3. If the issue persists, share the console output and any error messages

### 🚀 Quick Fix

If you want to quickly test if everything is working:

1. Open browser console (F12)
2. Run this code:
```javascript
// Test login directly
fetch('/api/accounts/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'testpass123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Login response:', data);
  if (data.access) {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    console.log('Tokens stored, try refreshing the page');
  }
})
.catch(err => console.error('Login failed:', err));
```

This will help us identify exactly where the issue is occurring. 