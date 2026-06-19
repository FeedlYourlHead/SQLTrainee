from django.db import migrations


def set_verification_queries(apps, schema_editor):
    Task = apps.get_model('task_checker', 'Task')

    updates = {
        # DDL tasks from migration 0005
        'Создать таблицу студентов': (
            "SELECT column_name, data_type, is_nullable "
            "FROM information_schema.columns "
            "WHERE table_name = 'students' "
            "ORDER BY ordinal_position"
        ),
        'Добавить столбец email': (
            "SELECT column_name, data_type "
            "FROM information_schema.columns "
            "WHERE table_name = 'employees' "
            "ORDER BY ordinal_position"
        ),
        # DML tasks from migration 0005
        'Добавить нового сотрудника': "SELECT * FROM employees ORDER BY id",
        'Повысить зарплату всем разработчикам': "SELECT * FROM employees ORDER BY id",
        'Удалить товары с нулевым остатком': "SELECT * FROM products ORDER BY id",
    }

    for name, vq in updates.items():
        Task.objects.filter(name=name).update(verification_query=vq)
        print(f'  Set verification_query for "{name}"')


def unset_verification_queries(apps, schema_editor):
    Task = apps.get_model('task_checker', 'Task')
    Task.objects.filter(name__in=[
        'Создать таблицу студентов',
        'Добавить столбец email',
        'Добавить нового сотрудника',
        'Повысить зарплату всем разработчикам',
        'Удалить товары с нулевым остатком',
    ]).update(verification_query='')


class Migration(migrations.Migration):
    dependencies = [
        ('task_checker', '0008_seed_extra_data'),
    ]

    operations = [
        migrations.RunPython(set_verification_queries, unset_verification_queries),
    ]
