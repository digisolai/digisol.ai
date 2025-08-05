# Generated manually for subscription system update

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_brandasset'),
        ('subscription_billing', '0002_subscriptionplan_annual_cost_and_more'),
    ]

    operations = [
        # Add new subscription-related fields
        migrations.AddField(
            model_name='tenant',
            name='active_subscription',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tenant_current_subscription', to='subscription_billing.subscription'),
        ),
        migrations.AddField(
            model_name='tenant',
            name='contacts_used_current_period',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='tenant',
            name='emails_sent_current_period',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='tenant',
            name='ai_text_credits_used_current_period',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='tenant',
            name='ai_image_credits_used_current_period',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='tenant',
            name='ai_planning_requests_used_current_period',
            field=models.IntegerField(default=0),
        ),
    ] 