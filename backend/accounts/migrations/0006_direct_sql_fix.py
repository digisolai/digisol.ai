# Direct SQL fix for production schema
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_check_schema'),
    ]

    operations = [
        migrations.RunSQL(
            # Forward SQL - Add missing columns
            """
            ALTER TABLE custom_users 
            ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(100),
            ADD COLUMN IF NOT EXISTS bio TEXT,
            ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
            ADD COLUMN IF NOT EXISTS is_tenant_admin BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'viewer',
            ADD COLUMN IF NOT EXISTS department VARCHAR(100),
            ADD COLUMN IF NOT EXISTS is_hr_admin BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
            
            UPDATE custom_users SET created_at = NOW() WHERE created_at IS NULL;
            UPDATE custom_users SET updated_at = NOW() WHERE updated_at IS NULL;
            """,
            # Reverse SQL - Remove columns (if needed)
            """
            ALTER TABLE custom_users 
            DROP COLUMN IF EXISTS profile_picture,
            DROP COLUMN IF EXISTS bio,
            DROP COLUMN IF EXISTS phone_number,
            DROP COLUMN IF EXISTS created_at,
            DROP COLUMN IF EXISTS updated_at,
            DROP COLUMN IF EXISTS is_tenant_admin,
            DROP COLUMN IF EXISTS role,
            DROP COLUMN IF EXISTS department,
            DROP COLUMN IF EXISTS is_hr_admin,
            DROP COLUMN IF EXISTS job_title;
            """
        ),
    ] 