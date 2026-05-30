from django.db import migrations

def seed_data(apps, schema_editor):
    Category = apps.get_model('task_checker', 'Category')
    Task = apps.get_model('task_checker', 'Task')

    cat_select, _ = Category.objects.get_or_create(
        name='SELECT', defaults={'description': 'Базовые SELECT запросы'}
    )
    cat_join, _ = Category.objects.get_or_create(
        name='JOIN', defaults={'description': 'Запросы с объединением таблиц'}
    )
    cat_group, _ = Category.objects.get_or_create(
        name='GROUP BY', defaults={'description': 'Агрегация и группировка данных'}
    )

    Task.objects.get_or_create(name='Выбрать всех пользователей', defaults={
        'description': (
            'В таблице **users** хранятся пользователи с полями:\n'
            '- `id` — уникальный идентификатор\n'
            '- `name` — имя пользователя\n'
            '- `age` — возраст\n\n'
            'Напиши запрос, который выведет **все** строки из таблицы users.'
        ),
        'schema_sql': (
            'CREATE TABLE users (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    age INTEGER\n'
            ');\n'
            "INSERT INTO users (name, age) VALUES\n"
            "    ('Анна', 25),\n"
            "    ('Борис', 30),\n"
            "    ('Виктор', 22);"
        ),
        'expected_query': 'SELECT * FROM users;',
        'category': cat_select,
        'difficulty': 1,
    })

    Task.objects.get_or_create(name='Объединение заказов и клиентов', defaults={
        'description': (
            'Даны две таблицы:\n'
            '- **customers** (`id`, `name`)\n'
            '- **orders** (`id`, `customer_id`, `total`)\n\n'
            'Напиши запрос, который выведет имя клиента и сумму его заказа.\n'
            'Используй `INNER JOIN`.'
        ),
        'schema_sql': (
            'CREATE TABLE customers (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100)\n'
            ');\n'
            'CREATE TABLE orders (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    customer_id INTEGER REFERENCES customers(id),\n'
            '    total NUMERIC(10,2)\n'
            ');\n'
            "INSERT INTO customers (name) VALUES\n"
            "    ('Иван'),\n"
            "    ('Мария');\n"
            "INSERT INTO orders (customer_id, total) VALUES\n"
            "    (1, 150.00),\n"
            "    (2, 200.00),\n"
            "    (1, 99.99);"
        ),
        'expected_query': (
            'SELECT customers.name, orders.total\n'
            'FROM customers\n'
            'INNER JOIN orders ON customers.id = orders.customer_id;'
        ),
        'category': cat_join,
        'difficulty': 2,
    })

    Task.objects.get_or_create(name='Количество заказов по клиентам', defaults={
        'description': (
            'Используя таблицы **customers** и **orders** из предыдущей задачи,\n'
            'напиши запрос, который выведет имя клиента и **количество** его заказов.\n'
            'Клиенты без заказов тоже должны быть включены (выведи 0).\n\n'
            'Подсказка: используй `LEFT JOIN`, `GROUP BY` и `COUNT`.'
        ),
        'schema_sql': (
            'CREATE TABLE customers (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100)\n'
            ');\n'
            'CREATE TABLE orders (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    customer_id INTEGER REFERENCES customers(id),\n'
            '    total NUMERIC(10,2)\n'
            ');\n'
            "INSERT INTO customers (name) VALUES\n"
            "    ('Иван'),\n"
            "    ('Мария'),\n"
            "    ('Петр');\n"
            "INSERT INTO orders (customer_id, total) VALUES\n"
            "    (1, 150.00),\n"
            "    (2, 200.00),\n"
            "    (1, 99.99);"
        ),
        'expected_query': (
            'SELECT customers.name, COUNT(orders.id) AS order_count\n'
            'FROM customers\n'
            'LEFT JOIN orders ON customers.id = orders.customer_id\n'
            'GROUP BY customers.id, customers.name;'
        ),
        'category': cat_group,
        'difficulty': 3,
    })


def unseed_data(apps, schema_editor):
    Task = apps.get_model('task_checker', 'Task')
    Category = apps.get_model('task_checker', 'Category')
    Task.objects.all().delete()
    Category.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ('task_checker', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_data, unseed_data),
    ]
