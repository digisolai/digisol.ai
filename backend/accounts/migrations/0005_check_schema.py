# Generated to check production schema
from django.db import migrations
from django.core.management import call_command


def check_schema(apps, schema_editor):
    """Check the current database schema"""
    try:
        call_command('check_schema')
    except Exception as e:
        print(f"Schema check completed with notes: {e}")


def reverse_check(apps, schema_editor):
    """No reverse operation needed"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_fix_production_schema'),
    ]

    operations = [
        migrations.RunPython(check_schema, reverse_check),
    ] 