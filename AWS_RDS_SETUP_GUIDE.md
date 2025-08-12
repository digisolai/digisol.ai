# AWS RDS Setup Guide for Render

## 🚨 **Current Issue**
Render is using its own SQLite database instead of your AWS RDS PostgreSQL database. This is why:
- Login fails (wrong database)
- Database reset doesn't work (wrong database)
- Users exist but can't login (wrong database)

## 🔧 **Solution: Configure AWS RDS Environment Variables**

### Step 1: Get Your AWS RDS Connection Details
You need these details from your AWS RDS instance:
- **Database Name** (e.g., `digisol_ai_production`)
- **Username** (e.g., `digisol_ai_user`)
- **Password** (your database password)
- **Host** (RDS endpoint, e.g., `digisol-ai-prod.c123456.us-east-1.rds.amazonaws.com`)
- **Port** (usually `5432`)

### Step 2: Set Environment Variables in Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your `digisol-backend` service
3. Click on the service
4. Go to "Environment" tab
5. Add these environment variables:

```
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_rds_endpoint
DB_PORT=5432
```

### Step 3: Example Configuration
Based on typical AWS RDS setup, your variables might look like:

```
DB_NAME=digisol_ai_production
DB_USER=digisol_ai_user
DB_PASSWORD=your_secure_password_here
DB_HOST=digisol-ai-prod.c123456.us-east-1.rds.amazonaws.com
DB_PORT=5432
```

### Step 4: Deploy the Changes
1. After setting the environment variables, click "Save Changes"
2. Render will automatically redeploy your service
3. The deployment will now use your AWS RDS database

### Step 5: Verify the Connection
After deployment, test the connection:

```bash
# Test the production login
curl -X POST https://digisol-backend.onrender.com/api/accounts/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digisolai.ca","password":"admin123456"}'
```

## 🔍 **How to Find Your AWS RDS Details**

### Option 1: AWS Console
1. Go to [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. Find your database instance
3. Click on it to see details
4. Look for:
   - **Endpoint** (this is your DB_HOST)
   - **Port** (usually 5432)
   - **Database name** (DB_NAME)
   - **Master username** (DB_USER)

### Option 2: AWS CLI
```bash
aws rds describe-db-instances --db-instance-identifier your-instance-name
```

### Option 3: Check Your Local Configuration
If you have a local `.env` file or configuration, check for:
- `DATABASE_URL` (parse this to get individual components)
- Individual database variables

## 🚀 **Expected Results**
After setting the environment variables:

1. **Deployment will use AWS RDS** instead of SQLite
2. **Database reset will work** (it will reset the correct database)
3. **Login will work** with the correct credentials
4. **All data will persist** in your AWS RDS instance

## ⚠️ **Important Notes**

1. **Security**: Make sure your AWS RDS security group allows connections from Render's IP addresses
2. **SSL**: The connection uses SSL (`sslmode=require`)
3. **Backup**: Your data will now be stored in AWS RDS, not Render's ephemeral storage
4. **Cost**: AWS RDS has ongoing costs, but your data is safe and persistent

## 🔧 **Troubleshooting**

### If Connection Fails
1. Check that your RDS instance is running
2. Verify security group allows connections from Render
3. Confirm the endpoint, username, and password are correct
4. Check that the database exists

### If Deployment Fails
1. Check Render logs for connection errors
2. Verify all environment variables are set correctly
3. Make sure the database user has proper permissions

## 📞 **Next Steps**
1. Set the AWS RDS environment variables in Render
2. Deploy the changes
3. Test the login functionality
4. If it works, the issue is resolved!

The key fix is that **Render will now use your AWS RDS database instead of its own SQLite database**.
