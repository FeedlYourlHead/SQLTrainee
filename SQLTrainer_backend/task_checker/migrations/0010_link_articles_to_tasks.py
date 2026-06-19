from django.db import migrations


def link_articles_to_tasks(apps, schema_editor):
    Category = apps.get_model('task_checker', 'Category')
    Task = apps.get_model('task_checker', 'Task')
    Article = apps.get_model('theory', 'Article')

    for cat in Category.objects.all():
        tasks = Task.objects.filter(category=cat)
        articles = Article.objects.filter(category=cat)
        if not tasks or not articles:
            continue
        for task in tasks:
            task.related_articles.add(*articles)
        names = [a.title for a in articles]
        count = tasks.count()
        print(f'  Category "{cat.name}": {count} tasks <- {names}')


def unlink_articles_from_tasks(apps, schema_editor):
    Task = apps.get_model('task_checker', 'Task')
    Task.objects.all().update(related_articles=[])


class Migration(migrations.Migration):
    dependencies = [
        ('task_checker', '0009_set_verification_queries'),
    ]

    operations = [
        migrations.RunPython(link_articles_to_tasks, unlink_articles_from_tasks),
    ]
