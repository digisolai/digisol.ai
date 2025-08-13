# Generated manually for tenant simplification

from django.db import migrations, models
import django.db.models.deletion
import uuid

def safe_remove_tenant_fields(apps, schema_editor):
    """
    Safely remove tenant fields only if they exist.
    """
    db_alias = schema_editor.connection.alias
    with schema_editor.connection.cursor() as cursor:
        # Check and remove tenant field from customer table
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'subscription_billing_customer' 
            AND column_name = 'tenant_id'
        """)
        if cursor.fetchone():
            cursor.execute("""
                ALTER TABLE subscription_billing_customer 
                DROP COLUMN tenant_id
            """)
        
        # Check and remove tenant field from subscription table
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'subscription_billing_subscription' 
            AND column_name = 'tenant_id'
        """)
        if cursor.fetchone():
            cursor.execute("""
                ALTER TABLE subscription_billing_subscription 
                DROP COLUMN tenant_id
            """)
        
        # Check and remove tenant field from paymenttransaction table
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'subscription_billing_paymenttransaction' 
            AND column_name = 'tenant_id'
        """)
        if cursor.fetchone():
            cursor.execute("""
                ALTER TABLE subscription_billing_paymenttransaction 
                DROP COLUMN tenant_id
            """)
        
        # Check and remove customer field from paymenttransaction table
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'subscription_billing_paymenttransaction' 
            AND column_name = 'customer_id'
        """)
        if cursor.fetchone():
            cursor.execute("""
                ALTER TABLE subscription_billing_paymenttransaction 
                DROP COLUMN customer_id
            """)

def reverse_safe_remove_tenant_fields(apps, schema_editor):
    """
    Reverse operation - not needed for safe removal
    """
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('subscription_billing', '0003_remove_subscriptionplan_includes_corporate_suite_and_more'),
        ('accounts', '0007_remove_tenant_fields'),
    ]

    operations = [
        # Update Customer model - make user field required
        migrations.AlterField(
            model_name='customer',
            name='user',
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='subscription_customer',
                to='accounts.customuser'
            ),
        ),
        
        # Safely remove tenant fields
        migrations.RunPython(
            safe_remove_tenant_fields,
            reverse_safe_remove_tenant_fields
        ),
        
        # Update Subscription model - add user field
        migrations.AddField(
            model_name='subscription',
            name='user',
            field=models.OneToOneField(
                default=uuid.uuid4,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='subscription',
                to='accounts.customuser'
            ),
            preserve_default=False,
        ),
        
        # Update PaymentTransaction model - update subscription field
        migrations.AlterField(
            model_name='paymenttransaction',
            name='subscription',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='transactions',
                to='subscription_billing.subscription'
            ),
        ),
        
        # Add UsageTracking model
        migrations.CreateModel(
            name='UsageTracking',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('contacts_used_current_period', models.IntegerField(default=0)),
                ('emails_sent_current_period', models.IntegerField(default=0)),
                ('tokens_used_current_period', models.IntegerField(default=0)),
                ('ai_text_credits_used_current_period', models.IntegerField(default=0)),
                ('ai_image_credits_used_current_period', models.IntegerField(default=0)),
                ('ai_planning_requests_used_current_period', models.IntegerField(default=0)),
                ('current_period_start', models.DateTimeField(auto_now_add=True)),
                ('current_period_end', models.DateTimeField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='usage_tracking', to='accounts.customuser')),
            ],
            options={
                'unique_together': {('user', 'current_period_start')},
            },
        ),
    ]
