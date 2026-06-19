from django.db import migrations


def seed_tasks(apps, schema_editor):
    Category = apps.get_model('task_checker', 'Category')
    Task = apps.get_model('task_checker', 'Task')

    cat_select = Category.objects.get(name='SELECT')
    cat_join = Category.objects.get(name='JOIN')
    cat_group = Category.objects.get(name='GROUP BY')

    Task.objects.get_or_create(name='Поиск пользователей по имени', defaults={
        'description': (
            'В таблице **users** есть столбцы:\n'
            '- `id` — уникальный идентификатор\n'
            '- `name` — имя пользователя\n'
            '- `email` — email пользователя\n\n'
            'Напиши запрос, который выведет **имя и email** всех пользователей, '
            'чьё имя **начинается на букву "А"**.\n\n'
            'Подсказка: используй `LIKE` с шаблоном.'
        ),
        'schema_sql': (
            'CREATE TABLE users (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    email VARCHAR(255)\n'
            ');\n'
            "INSERT INTO users (name, email) VALUES\n"
            "    ('Анна', 'anna@example.com'),\n"
            "    ('Борис', 'boris@example.com'),\n"
            "    ('Аркадий', 'arkady@example.com'),\n"
            "    ('Виктор', 'viktor@example.com');"
        ),
        'expected_query': (
            "SELECT name, email FROM users WHERE name LIKE 'А%';"
        ),
        'category': cat_select,
        'difficulty': 1,
    })

    Task.objects.get_or_create(name='Заказы с информацией о клиентах', defaults={
        'description': (
            'Даны две таблицы:\n'
            '- **customers** (`id`, `name`)\n'
            '- **orders** (`id`, `customer_id`, `total`, `order_date`)\n\n'
            'Напиши запрос, который выведет **имя клиента**, **сумму заказа** и **дату заказа**.\n'
            'Включи **всех** клиентов, даже если у них нет заказов.\n'
            'Отсортируй по дате заказа (сначала новые).\n\n'
            'Подсказка: используй `LEFT JOIN`.'
        ),
        'schema_sql': (
            'CREATE TABLE customers (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100)\n'
            ');\n'
            'CREATE TABLE orders (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    customer_id INTEGER REFERENCES customers(id),\n'
            '    total NUMERIC(10,2),\n'
            '    order_date DATE\n'
            ');\n'
            "INSERT INTO customers (name) VALUES\n"
            "    ('Иван'),\n"
            "    ('Мария'),\n"
            "    ('Петр');\n"
            "INSERT INTO orders (customer_id, total, order_date) VALUES\n"
            "    (1, 150.00, '2024-01-15'),\n"
            "    (2, 200.00, '2024-02-20'),\n"
            "    (1, 99.99, '2024-03-10');"
        ),
        'expected_query': (
            'SELECT customers.name, orders.total, orders.order_date\n'
            'FROM customers\n'
            'LEFT JOIN orders ON customers.id = orders.customer_id\n'
            'ORDER BY orders.order_date DESC;'
        ),
        'category': cat_join,
        'difficulty': 2,
    })

    Task.objects.get_or_create(name='Максимальная зарплата по отделам', defaults={
        'description': (
            'В таблице **employees** есть столбцы:\n'
            '- `id`, `name`, `salary`, `department`\n\n'
            'Напиши запрос, который выведет **название отдела** и **максимальную зарплату** в нём.\n'
            'Результат отсортируй по максимальной зарплате по убыванию.\n\n'
            'Подсказка: используй `GROUP BY` и `MAX()`.'
        ),
        'schema_sql': (
            'CREATE TABLE employees (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    salary NUMERIC(10,2),\n'
            '    department VARCHAR(100)\n'
            ');\n'
            "INSERT INTO employees (name, salary, department) VALUES\n"
            "    ('Иван', 80000, 'ИТ'),\n"
            "    ('Мария', 65000, 'Бухгалтерия'),\n"
            "    ('Петр', 95000, 'ИТ'),\n"
            "    ('Елена', 55000, 'Маркетинг'),\n"
            "    ('Анна', 70000, 'Бухгалтерия');"
        ),
        'expected_query': (
            'SELECT department, MAX(salary) AS max_salary\n'
            'FROM employees\n'
            'GROUP BY department\n'
            'ORDER BY max_salary DESC;'
        ),
        'category': cat_group,
        'difficulty': 2,
    })


def unseed_tasks(apps, schema_editor):
    Task = apps.get_model('task_checker', 'Task')
    Task.objects.filter(name__in=[
        'Поиск пользователей по имени',
        'Заказы с информацией о клиентах',
        'Максимальная зарплата по отделам',
    ]).delete()


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
            task.related_articles.clear()
            task.related_articles.add(*articles)
        names = [a.title for a in articles]
        count = tasks.count()
        print(f'  Category "{cat.name}": {count} tasks <- {names}')


def unlink_articles_from_tasks(apps, schema_editor):
    Task = apps.get_model('task_checker', 'Task')
    for task in Task.objects.all():
        task.related_articles.clear()


class Migration(migrations.Migration):
    dependencies = [
        ('task_checker', '0010_link_articles_to_tasks'),
        ('theory', '0004_seed_missing_articles'),
    ]

    operations = [
        migrations.RunPython(seed_tasks, unseed_tasks),
        migrations.RunPython(link_articles_to_tasks, unlink_articles_from_tasks),
    ]
