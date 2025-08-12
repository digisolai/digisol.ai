# Redis and Celery Deployment Guide

## 🎯 Overview

This guide will help you deploy Redis and Celery to your Render production environment for proper background task processing.

## 📋 What We're Adding

1. **Redis Service** - For task queuing and caching
2. **Celery Worker** - For background task processing
3. **Health Checks** - To monitor service status

## 🚀 Deployment Steps

### Step 1: Push Changes to GitHub

```bash
git add .
git commit -m "Add Redis and Celery services to Render deployment"
git push origin main
```

### Step 2: Monitor Render Deployment

1. Go to your Render dashboard
2. You should see **3 new services** being created:
   - `digisol-backend` (existing, will be updated)
   - `digisol-redis` (new Redis service)
   - `digisol-celery-worker` (new Celery worker)

### Step 3: Verify Services

1. **Check Web Service**: Should show "Live" status
2. **Check Redis Service**: Should show "Live" status  
3. **Check Celery Worker**: Should show "Live" status

### Step 4: Test Health Endpoint

Visit: `https://digisol-backend.onrender.com/health/`

You should see:
```json
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "cache": "healthy"
  }
}
```

## 🔧 Configuration Details

### Redis Service
- **Plan**: Free tier (25MB storage)
- **Memory Policy**: `allkeys-lru` (least recently used)
- **Connection**: Automatically linked to web service

### Celery Worker
- **Plan**: Free tier
- **Command**: `celery -A digisol_ai worker --loglevel=info`
- **Environment**: Same as web service
- **Redis**: Automatically connected

### Environment Variables
- `REDIS_URL`: Automatically set by Render
- `CELERY_BROKER_URL`: Uses Redis URL
- `CELERY_RESULT_BACKEND`: Uses Redis URL

## 🧪 Testing

### Test Redis Connection
```bash
python test_redis_connection.py
```

### Test Health Endpoint
```bash
curl https://digisol-backend.onrender.com/health/
```

### Test Celery Task
```python
# In Django shell or management command
from digisol_ai.celery import app

@app.task
def test_task():
    return "Hello from Celery!"

result = test_task.delay()
print(result.get())  # Should print: "Hello from Celery!"
```

## 📊 Monitoring

### Render Dashboard
- Monitor service health
- Check logs for errors
- View resource usage

### Health Endpoint
- Database connectivity
- Redis connectivity  
- Cache functionality
- Environment status

### Celery Monitoring
- Task queue status
- Worker status
- Task completion rates

## 🔍 Troubleshooting

### Redis Connection Issues
1. Check `REDIS_URL` environment variable
2. Verify Redis service is "Live"
3. Check firewall/network settings

### Celery Worker Issues
1. Check worker logs in Render dashboard
2. Verify Redis connection
3. Check task queue status

### Health Check Failures
1. Check individual service status
2. Review error messages
3. Verify environment variables

## 💡 Benefits

### Before (Memory Broker)
- ❌ No persistent task queue
- ❌ Tasks lost on restart
- ❌ No background processing
- ❌ Limited scalability

### After (Redis + Celery)
- ✅ Persistent task queue
- ✅ Tasks survive restarts
- ✅ Proper background processing
- ✅ Scalable architecture
- ✅ Better performance

## 🎉 Success Criteria

Your deployment is successful when:
1. All 3 services show "Live" status
2. Health endpoint returns "healthy" for all services
3. Redis connection test passes
4. Celery tasks can be executed and completed

## 📞 Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test Redis connection locally
4. Review this guide for common issues
