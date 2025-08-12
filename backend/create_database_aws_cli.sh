#!/bin/bash

# Create database using AWS CLI and psql
# Make sure you have AWS CLI configured and psql installed

echo "🔧 Creating database digisol_ai_prod..."

# Get the RDS endpoint
ENDPOINT="digisol-ai-production.cfgcmkkkw211.us-west-2.rds.amazonaws.com"
USERNAME="digisol_user"
DATABASE="postgres"

echo "📡 Connecting to RDS endpoint: $ENDPOINT"

# Create the database
psql "postgresql://$USERNAME:YOUR_PASSWORD@$ENDPOINT:5432/$DATABASE?sslmode=require" << EOF
CREATE DATABASE digisol_ai_prod;
GRANT ALL PRIVILEGES ON DATABASE digisol_ai_prod TO digisol_user;
\q
EOF

echo "✅ Database creation completed!"
echo "🔍 Testing connection to new database..."

# Test the connection
psql "postgresql://$USERNAME:YOUR_PASSWORD@$ENDPOINT:5432/digisol_ai_prod?sslmode=require" << EOF
SELECT current_database();
\q
EOF

echo "🎉 Database setup complete!"
