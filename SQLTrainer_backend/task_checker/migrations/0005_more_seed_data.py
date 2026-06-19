from django.db import migrations


def seed_data(apps, schema_editor):
    Category = apps.get_model('task_checker', 'Category')
    Task = apps.get_model('task_checker', 'Task')

    cat_subq, _ = Category.objects.get_or_create(
        name='Subqueries', defaults={'description': 'Подзапросы и вложенные SELECT'}
    )
    cat_ddl, _ = Category.objects.get_or_create(
        name='DDL', defaults={'description': 'Создание и изменение таблиц'}
    )
    cat_dml, _ = Category.objects.get_or_create(
        name='DML', defaults={'description': 'Манипуляция данными (INSERT, UPDATE, DELETE)'}
    )

    Task.objects.get_or_create(name='Клиенты с заказами дороже среднего', defaults={
        'description': (
            'Даны таблицы **customers** и **orders**:\n\n'
            '- **customers** (`id`, `name`)\n'
            '- **orders** (`id`, `customer_id`, `total`)\n\n'
            'Напиши запрос, который выведет **имена клиентов**, '
            'у которых сумма заказа **выше средней** суммы всех заказов.\n\n'
            'Подсказка: используй подзапрос с `AVG()` в `WHERE`.'
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
            "    (1, 100.00),\n"
            "    (2, 500.00),\n"
            "    (3, 50.00);"
        ),
        'expected_query': (
            'SELECT DISTINCT customers.name\n'
            'FROM customers\n'
            'INNER JOIN orders ON customers.id = orders.customer_id\n'
            'WHERE orders.total > (SELECT AVG(total) FROM orders);'
        ),
        'category': cat_subq,
        'difficulty': 3,
    })

    Task.objects.get_or_create(name='Товары, которые никто не заказывал', defaults={
        'description': (
            'Даны таблицы:\n\n'
            '- **products** (`id`, `name`, `price`)\n'
            '- **order_items** (`id`, `product_id`, `quantity`)\n\n'
            'Напиши запрос, который выведет название товаров, '
            'которые **ни разу** не были заказаны.\n\n'
            'Подсказка: используй `NOT EXISTS` или `LEFT JOIN`.'
        ),
        'schema_sql': (
            'CREATE TABLE products (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    price NUMERIC(10,2)\n'
            ');\n'
            'CREATE TABLE order_items (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    product_id INTEGER REFERENCES products(id),\n'
            '    quantity INTEGER\n'
            ');\n'
            "INSERT INTO products (name, price) VALUES\n"
            "    ('Ноутбук', 75000.00),\n"
            "    ('Мышь', 1500.00),\n"
            "    ('Клавиатура', 3500.00);\n"
            "INSERT INTO order_items (product_id, quantity) VALUES\n"
            "    (1, 2),\n"
            "    (1, 1);"
        ),
        'expected_query': (
            'SELECT p.name\n'
            'FROM products p\n'
            'WHERE NOT EXISTS (\n'
            '    SELECT 1 FROM order_items oi WHERE oi.product_id = p.id\n'
            ');'
        ),
        'category': cat_subq,
        'difficulty': 3,
    })

    Task.objects.get_or_create(name='Создать таблицу студентов', defaults={
        'description': (
            'Создай таблицу **students** со следующими полями:\n\n'
            '- `id` — целое число, автоинкремент, первичный ключ\n'
            '- `first_name` — строка до 100 символов, NOT NULL\n'
            '- `last_name` — строка до 100 символов, NOT NULL\n'
            '- `birth_date` — дата\n'
            '- `group_id` — целое число\n\n'
            'Используй `CREATE TABLE`.'
        ),
        'schema_sql': (
            'CREATE TABLE groups (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100)\n'
            ');\n'
            "INSERT INTO groups (name) VALUES ('Группа А'), ('Группа Б');"
        ),
        'expected_query': (
            'CREATE TABLE students (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    first_name VARCHAR(100) NOT NULL,\n'
            '    last_name VARCHAR(100) NOT NULL,\n'
            '    birth_date DATE,\n'
            '    group_id INTEGER\n'
            ');'
        ),
        'category': cat_ddl,
        'difficulty': 2,
        'verification_query': (
            "SELECT column_name, data_type, is_nullable "
            "FROM information_schema.columns "
            "WHERE table_name = 'students' "
            "ORDER BY ordinal_position"
        ),
    })

    Task.objects.get_or_create(name='Добавить столбец email', defaults={
        'description': (
            'В таблице **employees** уже есть столбцы `id`, `name`, `salary`.\n\n'
            'Напиши запрос, который **добавит** столбец:\n'
            '- `email` — строка до 255 символов\n\n'
            'Используй `ALTER TABLE ... ADD COLUMN`.'
        ),
        'schema_sql': (
            'CREATE TABLE employees (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    salary NUMERIC(10,2)\n'
            ');\n'
            "INSERT INTO employees (name, salary) VALUES\n"
            "    ('Анна', 50000),\n"
            "    ('Борис', 60000);"
        ),
        'expected_query': (
            'ALTER TABLE employees\n'
            'ADD COLUMN email VARCHAR(255);'
        ),
        'category': cat_ddl,
        'difficulty': 1,
        'verification_query': (
            "SELECT column_name, data_type "
            "FROM information_schema.columns "
            "WHERE table_name = 'employees' "
            "ORDER BY ordinal_position"
        ),
    })

    Task.objects.get_or_create(name='Добавить нового сотрудника', defaults={
        'description': (
            'В таблице **employees** есть столбцы:\n'
            '`id` (автоинкремент), `name`, `position`, `salary`.\n\n'
            'Добавь нового сотрудника:\n'
            '- name: **Елена**\n'
            '- position: **Менеджер**\n'
            '- salary: **75000**\n\n'
            'Используй `INSERT INTO`.'
        ),
        'schema_sql': (
            'CREATE TABLE employees (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    position VARCHAR(100),\n'
            '    salary NUMERIC(10,2)\n'
            ');\n'
            "INSERT INTO employees (name, position, salary) VALUES\n"
            "    ('Иван', 'Разработчик', 80000),\n"
            "    ('Мария', 'Аналитик', 65000);"
        ),
        'expected_query': (
            "INSERT INTO employees (name, position, salary) VALUES\n"
            "    ('Елена', 'Менеджер', 75000);"
        ),
        'category': cat_dml,
        'difficulty': 1,
        'verification_query': "SELECT * FROM employees ORDER BY id",
    })

    Task.objects.get_or_create(name='Повысить зарплату всем разработчикам', defaults={
        'description': (
            'В таблице **employees** есть столбцы:\n'
            '`id`, `name`, `position`, `salary`.\n\n'
            'Увеличь зарплату **всем разработчикам** (position = \'Разработчик\') '
            'на **15%**.\n\n'
            'Используй `UPDATE`.'
        ),
        'schema_sql': (
            'CREATE TABLE employees (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    position VARCHAR(100),\n'
            '    salary NUMERIC(10,2)\n'
            ');\n'
            "INSERT INTO employees (name, position, salary) VALUES\n"
            "    ('Иван', 'Разработчик', 80000),\n"
            "    ('Мария', 'Аналитик', 65000),\n"
            "    ('Петр', 'Разработчик', 90000);"
        ),
        'expected_query': (
            "UPDATE employees\n"
            "SET salary = salary * 1.15\n"
            "WHERE position = 'Разработчик';"
        ),
        'category': cat_dml,
        'difficulty': 2,
        'verification_query': "SELECT * FROM employees ORDER BY id",
    })

    Task.objects.get_or_create(name='Удалить товары с нулевым остатком', defaults={
        'description': (
            'В таблице **products** есть столбцы:\n'
            '`id`, `name`, `stock` (количество на складе).\n\n'
            'Удали все товары, у которых **stock = 0**.\n\n'
            'Используй `DELETE`.'
        ),
        'schema_sql': (
            'CREATE TABLE products (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    stock INTEGER\n'
            ');\n'
            "INSERT INTO products (name, stock) VALUES\n"
            "    ('Ноутбук', 5),\n"
            "    ('Мышь', 0),\n"
            "    ('Клавиатура', 12),\n"
            "    ('Монитор', 0);"
        ),
        'expected_query': (
            "DELETE FROM products WHERE stock = 0;"
        ),
        'category': cat_dml,
        'difficulty': 1,
        'verification_query': "SELECT * FROM products ORDER BY id",
    })

    Task.objects.get_or_create(name='Сотрудники с зарплатой выше средней', defaults={
        'description': (
            'В таблице **employees** есть столбцы:\n'
            '`id`, `name`, `salary`.\n\n'
            'Напиши запрос, который выведет **имена и зарплаты** сотрудников, '
            'чья зарплата **выше средней** зарплаты по всем сотрудникам.\n\n'
            'Результат отсортируй по зарплате по убыванию.\n\n'
            'Подсказка: используй подзапрос с `AVG()` в `WHERE`.'
        ),
        'schema_sql': (
            'CREATE TABLE employees (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    salary NUMERIC(10,2)\n'
            ');\n'
            "INSERT INTO employees (name, salary) VALUES\n"
            "    ('Анна', 50000),\n"
            "    ('Борис', 80000),\n"
            "    ('Виктор', 60000),\n"
            "    ('Галина', 45000);"
        ),
        'expected_query': (
            "SELECT name, salary\n"
            "FROM employees\n"
            "WHERE salary > (SELECT AVG(salary) FROM employees)\n"
            "ORDER BY salary DESC;"
        ),
        'category': cat_subq,
        'difficulty': 3,
    })


def unseed_data(apps, schema_editor):
    Task = apps.get_model('task_checker', 'Task')
    Category = apps.get_model('task_checker', 'Category')
    Task.objects.filter(
        category__name__in=['Subqueries', 'DDL', 'DML']
    ).delete()
    Category.objects.filter(name__in=['Subqueries', 'DDL', 'DML']).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('task_checker', '0004_task_hints'),
    ]

    operations = [
        migrations.RunPython(seed_data, unseed_data),
    ]
