# Generated manually to remove tenant field

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('campaigns', '0004_alter_campaignstep_options_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='marketingcampaign',
            name='tenant',
        ),
    ]
