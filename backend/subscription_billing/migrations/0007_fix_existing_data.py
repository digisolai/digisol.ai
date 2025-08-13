# Generated manually for data cleanup

from django.db import migrations

def fix_customer_data(apps, schema_editor):
    """
    Fix existing Customer records that don't have a user field.
    Either link them to existing users or remove invalid records.
    """
    Customer = apps.get_model('subscription_billing', 'Customer')
    CustomUser = apps.get_model('accounts', 'CustomUser')
    
    # Get all customers without a user
    customers_without_user = Customer.objects.filter(user__isnull=True)
    
    for customer in customers_without_user:
        # Try to find a user by email if customer has tenant info
        if hasattr(customer, 'tenant') and customer.tenant:
            # Find users in this tenant
            tenant_users = CustomUser.objects.filter(tenant=customer.tenant)
            if tenant_users.exists():
                # Link to the first user in the tenant
                customer.user = tenant_users.first()
                customer.save()
            else:
                # No users in tenant, delete the customer
                customer.delete()
        else:
            # No tenant info, delete the customer
            customer.delete()

def reverse_fix_customer_data(apps, schema_editor):
    """
    Reverse operation - not needed for data cleanup
    """
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('subscription_billing', '0006_merge_20250813_1607'),
        ('accounts', '0007_remove_tenant_fields'),
    ]

    operations = [
        migrations.RunPython(fix_customer_data, reverse_fix_customer_data),
    ]
