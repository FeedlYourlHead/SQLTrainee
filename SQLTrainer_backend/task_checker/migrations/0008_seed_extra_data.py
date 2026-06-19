from django.db import migrations


def seed_data(apps, schema_editor):
    Category = apps.get_model('task_checker', 'Category')
    Task = apps.get_model('task_checker', 'Task')

    cat_select = Category.objects.get(name='SELECT')
    cat_join = Category.objects.get(name='JOIN')
    cat_group = Category.objects.get(name='GROUP BY')
    cat_subq = Category.objects.get(name='Subqueries')
    cat_ddl = Category.objects.get(name='DDL')
    cat_dml = Category.objects.get(name='DML')

    Task.objects.get_or_create(name='Выбрать пользователей по возрасту', defaults={
        'description': (
            'В таблице **users** есть столбцы:\n'
            '- `id` — уникальный идентификатор\n'
            '- `name` — имя пользователя\n'
            '- `age` — возраст\n\n'
            'Напиши запрос, который выведет **имена и возраст** всех пользователей, '
            'отсортированных по возрасту по возрастанию.'
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
            "    ('Виктор', 22),\n"
            "    ('Галина', 28);"
        ),
        'expected_query': 'SELECT name, age FROM users ORDER BY age;',
        'category': cat_select,
        'difficulty': 1,
    })

    Task.objects.get_or_create(name='Пользователи старше 25', defaults={
        'description': (
            'В таблице **users** есть столбцы:\n'
            '- `id` — уникальный идентификатор\n'
            '- `name` — имя пользователя\n'
            '- `age` — возраст\n\n'
            'Напиши запрос, который выведет **имена и возраст** пользователей, '
            'которые **старше 25 лет**, отсортированных по возрасту по возрастанию.'
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
            "    ('Виктор', 22),\n"
            "    ('Галина', 28);"
        ),
        'expected_query': 'SELECT name, age FROM users WHERE age > 25 ORDER BY age;',
        'category': cat_select,
        'difficulty': 1,
    })

    Task.objects.get_or_create(name='Сотрудники и их отделы', defaults={
        'description': (
            'Даны две таблицы:\n'
            '- **employees** (`id`, `name`, `dept_id`)\n'
            '- **departments** (`id`, `name`)\n\n'
            'Напиши запрос, который выведет **имя сотрудника** и **название его отдела**.\n'
            'Используй `INNER JOIN`.'
        ),
        'schema_sql': (
            'CREATE TABLE departments (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100)\n'
            ');\n'
            'CREATE TABLE employees (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    dept_id INTEGER REFERENCES departments(id)\n'
            ');\n'
            "INSERT INTO departments (name) VALUES\n"
            "    ('ИТ'),\n"
            "    ('Бухгалтерия'),\n"
            "    ('Маркетинг');\n"
            "INSERT INTO employees (name, dept_id) VALUES\n"
            "    ('Иван', 1),\n"
            "    ('Мария', 2),\n"
            "    ('Петр', 1),\n"
            "    ('Елена', 3);"
        ),
        'expected_query': (
            'SELECT employees.name, departments.name\n'
            'FROM employees\n'
            'INNER JOIN departments ON employees.dept_id = departments.id;'
        ),
        'category': cat_join,
        'difficulty': 2,
    })

    Task.objects.get_or_create(name='Товары и категории', defaults={
        'description': (
            'Даны две таблицы:\n'
            '- **products** (`id`, `name`, `price`, `cat_id`)\n'
            '- **categories** (`id`, `name`)\n\n'
            'Напиши запрос, который выведет **название товара** и **название его категории**, '
            'отсортированных по названию товара.'
        ),
        'schema_sql': (
            'CREATE TABLE categories (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100)\n'
            ');\n'
            'CREATE TABLE products (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    price NUMERIC(10,2),\n'
            '    cat_id INTEGER REFERENCES categories(id)\n'
            ');\n'
            "INSERT INTO categories (name) VALUES\n"
            "    ('Электроника'),\n"
            "    ('Канцелярия');\n"
            "INSERT INTO products (name, price, cat_id) VALUES\n"
            "    ('Ноутбук', 75000.00, 1),\n"
            "    ('Мышь', 1500.00, 1),\n"
            "    ('Блокнот', 250.00, 2);"
        ),
        'expected_query': (
            'SELECT products.name, categories.name\n'
            'FROM products\n'
            'INNER JOIN categories ON products.cat_id = categories.id\n'
            'ORDER BY products.name;'
        ),
        'category': cat_join,
        'difficulty': 2,
    })

    Task.objects.get_or_create(name='Средняя зарплата по отделам', defaults={
        'description': (
            'В таблице **employees** есть столбцы:\n'
            '- `id`, `name`, `salary`, `department`\n\n'
            'Напиши запрос, который выведет **название отдела** и **среднюю зарплату** в нём.\n'
            'Отсортируй по средней зарплате по убыванию.\n\n'
            'Подсказка: используй `GROUP BY` и `AVG()`.'
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
            "    ('Петр', 90000, 'ИТ'),\n"
            "    ('Елена', 55000, 'Маркетинг'),\n"
            "    ('Анна', 70000, 'Бухгалтерия');"
        ),
        'expected_query': (
            'SELECT department, AVG(salary) AS avg_salary\n'
            'FROM employees\n'
            'GROUP BY department\n'
            'ORDER BY avg_salary DESC;'
        ),
        'category': cat_group,
        'difficulty': 2,
    })

    Task.objects.get_or_create(name='Количество сотрудников в каждом отделе', defaults={
        'description': (
            'В таблице **employees** есть столбцы:\n'
            '- `id`, `name`, `department`\n\n'
            'Напиши запрос, который выведет **название отдела** и **количество сотрудников** в нём.\n'
            'Отсортируй по количеству сотрудников по убыванию.'
        ),
        'schema_sql': (
            'CREATE TABLE employees (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    department VARCHAR(100)\n'
            ');\n'
            "INSERT INTO employees (name, department) VALUES\n"
            "    ('Иван', 'ИТ'),\n"
            "    ('Мария', 'Бухгалтерия'),\n"
            "    ('Петр', 'ИТ'),\n"
            "    ('Елена', 'Маркетинг'),\n"
            "    ('Анна', 'Бухгалтерия');"
        ),
        'expected_query': (
            'SELECT department, COUNT(*) AS emp_count\n'
            'FROM employees\n'
            'GROUP BY department\n'
            'ORDER BY emp_count DESC;'
        ),
        'category': cat_group,
        'difficulty': 2,
    })

    Task.objects.get_or_create(name='Товары дороже среднего', defaults={
        'description': (
            'В таблице **products** есть столбцы:\n'
            '- `id`, `name`, `price`\n\n'
            'Напиши запрос, который выведет **названия и цены** товаров, '
            'чьи цены **выше средней** цены всех товаров.\n'
            'Отсортируй по цене по возрастанию.\n\n'
            'Подсказка: используй подзапрос с `AVG()` в `WHERE`.'
        ),
        'schema_sql': (
            'CREATE TABLE products (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    price NUMERIC(10,2)\n'
            ');\n'
            "INSERT INTO products (name, price) VALUES\n"
            "    ('Ноутбук', 75000.00),\n"
            "    ('Мышь', 1500.00),\n"
            "    ('Клавиатура', 3500.00),\n"
            "    ('Монитор', 25000.00);"
        ),
        'expected_query': (
            'SELECT name, price\n'
            'FROM products\n'
            'WHERE price > (SELECT AVG(price) FROM products)\n'
            'ORDER BY price;'
        ),
        'category': cat_subq,
        'difficulty': 2,
        'hints': [
            'Сначала найди среднюю цену через SELECT AVG(price) FROM products',
            'Используй WHERE price > (подзапрос)',
        ],
    })

    Task.objects.get_or_create(name='Добавить внешний ключ', defaults={
        'description': (
            'Даны таблицы:\n'
            '- **departments** (`id`, `name`) — уже создана\n'
            '- **employees** (`id`, `name`, `dept_id`) — уже создана, но **без внешнего ключа**\n\n'
            'Напиши запрос, который **добавит внешний ключ** к таблице employees,\n'
            'чтобы `dept_id` ссылался на `id` таблицы departments.\n\n'
            'Назови ограничение `fk_dept`.'
        ),
        'schema_sql': (
            'CREATE TABLE departments (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100)\n'
            ');\n'
            'CREATE TABLE employees (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    name VARCHAR(100),\n'
            '    dept_id INTEGER\n'
            ');\n'
            "INSERT INTO departments (name) VALUES\n"
            "    ('ИТ'), ('Бухгалтерия');\n"
            "INSERT INTO employees (name, dept_id) VALUES\n"
            "    ('Иван', 1),\n"
            "    ('Мария', 2);"
        ),
        'expected_query': (
            'ALTER TABLE employees\n'
            'ADD CONSTRAINT fk_dept\n'
            'FOREIGN KEY (dept_id) REFERENCES departments(id);'
        ),
        'category': cat_ddl,
        'difficulty': 2,
        'verification_query': (
            "SELECT tc.constraint_name, tc.constraint_type "
            "FROM information_schema.table_constraints tc "
            "WHERE tc.table_name = 'employees' "
            "AND tc.constraint_type = 'FOREIGN KEY'"
        ),
    })

    Task.objects.get_or_create(name='Обновить несколько полей', defaults={
        'description': (
            'В таблице **employees** есть столбцы:\n'
            '- `id`, `name`, `position`, `salary`\n\n'
            'Измени должность сотрудника **Иван** на **Senior Developer**\n'
            'и увеличь его зарплату до **95000**.\n\n'
            'Используй `UPDATE` с несколькими полями.'
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
            "UPDATE employees\n"
            "SET position = 'Senior Developer', salary = 95000\n"
            "WHERE name = 'Иван';"
        ),
        'category': cat_dml,
        'difficulty': 2,
        'verification_query': "SELECT * FROM employees ORDER BY id",
    })


def unseed_data(apps, schema_editor):
    Task = apps.get_model('task_checker', 'Task')
    Task.objects.filter(name__in=[
        'Выбрать пользователей по возрасту',
        'Пользователи старше 25',
        'Сотрудники и их отделы',
        'Товары и категории',
        'Средняя зарплата по отделам',
        'Количество сотрудников в каждом отделе',
        'Товары дороже среднего',
        'Добавить внешний ключ',
        'Обновить несколько полей',
    ]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('task_checker', '0007_task_verification_query'),
    ]

    operations = [
        migrations.RunPython(seed_data, unseed_data),
    ]
