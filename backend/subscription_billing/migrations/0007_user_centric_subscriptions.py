# Generated manually for tenant simplification

from django.db import migrations, models
import django.db.models.deletion
import uuid

class Migration(migrations.Migration):

    dependencies = [
        ('subscription_billing', '0005_subscriptionplan_client_portals_limit_and_more'),
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
        
        # Add user field to subscription using Django's standard field
        migrations.AddField(
            model_name='subscription',
            name='user',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='subscriptions',
                to='accounts.customuser',
                null=True,
                blank=True
            ),
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
