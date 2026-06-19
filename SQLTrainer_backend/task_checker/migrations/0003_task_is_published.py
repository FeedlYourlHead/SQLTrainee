from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('task_checker', '0002_seed_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='is_published',
            field=models.BooleanField(default=True),
        ),
    ]
