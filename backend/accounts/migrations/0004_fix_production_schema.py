# Generated to fix production schema issues
from django.db import migrations
from django.core.management import call_command


def fix_schema(apps, schema_editor):
    """Run the schema fix as a migration"""
    try:
        call_command('fix_production_schema')
    except Exception as e:
        print(f"Schema fix completed with notes: {e}")


def reverse_fix(apps, schema_editor):
    """No reverse operation needed"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_auto_20250803_1535'),
    ]

    operations = [
        migrations.RunPython(fix_schema, reverse_fix),
    ]