from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('task_checker', '0003_task_is_published'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='hints',
            field=models.JSONField(default=list, blank=True),
        ),
    ]
