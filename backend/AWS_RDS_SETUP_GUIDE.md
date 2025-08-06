# AWS RDS Setup Guide for DigiSol.AI

## 1. AWS RDS Database Creation

### Step 1: Create RDS Instance
1. Go to AWS Console → RDS → Create database
2. Choose **PostgreSQL** as the engine
3. Select **Free tier** (for development) or **Production** template
4. Configure:
   - **DB instance identifier**: `digisol-ai-production`
   - **Master username**: `digisol_ai_user`
   - **Master password**: Generate a strong password (save this!)
   - **DB instance class**: `db.t3.micro` (free tier) or `db.t3.small`
   - **Storage**: 20 GB General Purpose SSD (gp2)
   - **Multi-AZ deployment**: No (initially)

### Step 2: Network & Security
1. **VPC**: Default VPC
2. **Public access**: Yes (for external connections)
3. **VPC security group**: Create new or use existing
4. **Availability Zone**: Choose closest to your region
5. **Database port**: 5432 (default)

### Step 3: Database Authentication
- **Database authentication options**: Password authentication
- **Initial database name**: `digisol_ai_production`

### Step 4: Backup & Maintenance
- **Backup retention period**: 7 days
- **Backup window**: Choose low-traffic time
- **Maintenance window**: Choose low-traffic time

## 2. Security Group Configuration

### Create/Update Security Group
1. Go to EC2 → Security Groups
2. Create new security group or update existing
3. **Inbound rules**:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Your IP address (for development) or 0.0.0.0/0 (for production)

## 3. Environment Configuration

### Update .env.production
Replace the database section with your actual RDS endpoint:

```bash
# Database (PostgreSQL - AWS RDS)
DB_NAME=digisol_ai_production
DB_USER=digisol_ai_user
DB_PASSWORD=your-actual-rds-password
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_SSL_MODE=require
DB_SSL_CA=/path/to/rds-ca-2019-root.pem
```

### Get Your RDS Endpoint
1. Go to RDS → Databases
2. Click on your database instance
3. Copy the **Endpoint** (looks like: `digisol-ai-production.abc123.region.rds.amazonaws.com`)

## 4. SSL Certificate Setup

### Download AWS RDS SSL Certificate
```bash
# Download the RDS CA certificate
wget https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem
```

### For Windows (PowerShell):
```powershell
# Download the certificate
Invoke-WebRequest -Uri "https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem" -OutFile "rds-ca-2019-root.pem"
```

### Update Environment Variables
Add the SSL certificate path to your `.env.production`:
```bash
DB_SSL_CA=./rds-ca-2019-root.pem
```

## 5. Database Migration

### Run Migrations
```bash
cd backend
python manage.py migrate --settings=digisol_ai.settings_production
```

### Create Superuser
```bash
python manage.py createsuperuser --settings=digisol_ai.settings_production
```

## 6. Test Connection

### Test Database Connection
```bash
python manage.py dbshell --settings=digisol_ai.settings_production
```

If successful, you should see the PostgreSQL prompt.

## 7. Production Deployment

### Environment Variables Checklist
Ensure these are set in your production environment:
- ✅ `SECRET_KEY` - Your generated secret key
- ✅ `DEBUG=False`
- ✅ `ALLOWED_HOSTS=www.digisolai.com,digisolai.com`
- ✅ `DB_NAME=digisol_ai_production`
- ✅ `DB_USER=digisol_ai_user`
- ✅ `DB_PASSWORD=your-actual-password`
- ✅ `DB_HOST=your-rds-endpoint`
- ✅ `DB_PORT=5432`
- ✅ `DB_SSL_CA=path/to/rds-ca-2019-root.pem`

## 8. Security Best Practices

### Database Security
- ✅ SSL/TLS encryption enabled
- ✅ Strong password for database user
- ✅ Security group restricts access
- ✅ Regular backups enabled
- ✅ Database in private subnet (recommended for production)

### Monitoring
- Set up CloudWatch alarms for:
  - CPU utilization
  - Database connections
  - Storage space
  - Read/Write latency

## 9. Cost Optimization

### Free Tier (12 months)
- `db.t3.micro` instance
- 20 GB storage
- 20 GB backup storage

### Production Scaling
- Start with `db.t3.small` for production
- Monitor usage and scale as needed
- Consider Reserved Instances for cost savings

## 10. Troubleshooting

### Common Issues
1. **Connection timeout**: Check security group rules
2. **SSL errors**: Verify certificate path and permissions
3. **Authentication failed**: Check username/password
4. **Database not found**: Verify database name

### Useful Commands
```bash
# Test SSL connection
psql "host=your-endpoint port=5432 dbname=digisol_ai_production user=digisol_ai_user sslmode=require sslrootcert=rds-ca-2019-root.pem"

# Check database status
aws rds describe-db-instances --db-instance-identifier digisol-ai-production
```

---

**Next Steps:**
1. Create the RDS instance in AWS Console
2. Update your `.env.production` with the actual endpoint
3. Download the SSL certificate
4. Test the connection
5. Run migrations

Your database SSL configuration will be complete once you follow these steps! 