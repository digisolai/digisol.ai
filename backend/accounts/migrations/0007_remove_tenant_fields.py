# Generated manually for tenant simplification

from django.db import migrations, models

def add_department_if_not_exists(apps, schema_editor):
    """
    Add department field only if it doesn't already exist.
    This handles the case where the production database might already have this field.
    """
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        # Check if department column already exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'custom_users' 
            AND column_name = 'department'
        """)
        exists = cursor.fetchone()
        
        if not exists:
            # Add the department column if it doesn't exist
            cursor.execute("""
                ALTER TABLE custom_users 
                ADD COLUMN department VARCHAR(255) NULL
            """)

def reverse_add_department(apps, schema_editor):
    """
    Remove department field if it exists.
    """
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        # Check if department column exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'custom_users' 
            AND column_name = 'department'
        """)
        exists = cursor.fetchone()
        
        if exists:
            # Remove the department column if it exists
            cursor.execute("""
                ALTER TABLE custom_users 
                DROP COLUMN department
            """)

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_direct_sql_fix'),
    ]

    operations = [
        # Remove tenant field
        migrations.RemoveField(
            model_name='customuser',
            name='tenant',
        ),
        
        # Remove tenant admin field
        migrations.RemoveField(
            model_name='customuser',
            name='is_tenant_admin',
        ),
        
        # Remove HR admin field
        migrations.RemoveField(
            model_name='customuser',
            name='is_hr_admin',
        ),
        
        # Add department field conditionally
        migrations.RunPython(
            add_department_if_not_exists,
            reverse_add_department
        ),
        
        # Update role choices
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(
                choices=[
                    ('admin', 'Admin'),
                    ('manager', 'Manager'),
                    ('user', 'User'),
                ],
                default='user',
                max_length=50
            ),
        ),
    ]
