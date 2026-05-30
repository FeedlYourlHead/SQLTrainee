from django.core.management.base import BaseCommand
from task_checker.models import Category, Task

CATEGORIES = [
    {'name': 'SELECT', 'description': 'Базовые SELECT запросы'},
    {'name': 'JOIN', 'description': 'Запросы с объединением таблиц'},
    {'name': 'GROUP BY', 'description': 'Агрегация и группировка данных'},
]

TASKS = [
    {
        'name': 'Выбрать всех пользователей',
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
        'category_name': 'SELECT',
        'difficulty': 1,
    },
    {
        'name': 'Объединение заказов и клиентов',
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
        'category_name': 'JOIN',
        'difficulty': 2,
    },
    {
        'name': 'Количество заказов по клиентам',
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
        'category_name': 'GROUP BY',
        'difficulty': 3,
    },
]


class Command(BaseCommand):
    help = 'Заполняет БД тестовыми категориями и задачами'

    def handle(self, *args, **options):
        for cat_data in CATEGORIES:
            Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
        self.stdout.write(self.style.SUCCESS(f'Создано {len(CATEGORIES)} категорий'))

        created = 0
        for task_data in TASKS:
            category = Category.objects.get(name=task_data['category_name'])
            _, was_created = Task.objects.get_or_create(
                name=task_data['name'],
                defaults={
                    'description': task_data['description'],
                    'schema_sql': task_data['schema_sql'],
                    'expected_query': task_data['expected_query'],
                    'category': category,
                    'difficulty': task_data['difficulty'],
                }
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Создано {created} задач'))
