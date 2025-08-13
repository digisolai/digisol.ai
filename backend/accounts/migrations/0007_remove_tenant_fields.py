# Generated manually for tenant simplification

from django.db import migrations, models


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
        
        # Add department field
        migrations.AddField(
            model_name='customuser',
            name='department',
            field=models.CharField(blank=True, max_length=255, null=True),
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
