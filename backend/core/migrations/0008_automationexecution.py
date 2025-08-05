# Generated manually for AutomationExecution model

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_enhance_campaign_model'),
    ]

    operations = [
        migrations.CreateModel(
            name='AutomationExecution',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ('current_step_index', models.IntegerField(default=0)),
                ('status', models.CharField(choices=[('active', 'Active'), ('paused', 'Paused'), ('completed', 'Completed'), ('failed', 'Failed')], default='active', max_length=50)),
                ('context_data', models.JSONField(default=dict, help_text='Dynamic data relevant to this execution')),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('last_executed_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('contact', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='core.contact')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.tenant')),
                ('workflow', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.automationworkflow')),
            ],
            options={
                'verbose_name': 'Automation Execution',
                'verbose_name_plural': 'Automation Executions',
                'db_table': 'automation_executions',
            },
        ),
        migrations.AddIndex(
            model_name='automationexecution',
            index=models.Index(fields=['tenant', 'workflow', 'status'], name='automation__tenant__workflo_idx'),
        ),
        migrations.AddIndex(
            model_name='automationexecution',
            index=models.Index(fields=['contact', 'status'], name='automation__contact_status_idx'),
        ),
        migrations.AddIndex(
            model_name='automationexecution',
            index=models.Index(fields=['last_executed_at'], name='automation__last_exe_idx'),
        ),
    ] 