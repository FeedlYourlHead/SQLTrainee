from django.db import migrations


def seed_data(apps, schema_editor):
    Category = apps.get_model('task_checker', 'Category')
    Article = apps.get_model('theory', 'Article')

    cat_select = Category.objects.get(name='SELECT')
    cat_join = Category.objects.get(name='JOIN')
    cat_group = Category.objects.get(name='GROUP BY')
    cat_subq = Category.objects.get(name='Subqueries')
    cat_ddl = Category.objects.get(name='DDL')
    cat_dml = Category.objects.get(name='DML')

    Article.objects.get_or_create(title='Основы SELECT', defaults={
        'category': cat_select,
        'order': 1,
        'content': (
            '## SELECT — выбор данных\n\n'
            'Оператор `SELECT` используется для выборки данных из базы:\n\n'
            '```sql\n'
            'SELECT column1, column2 FROM table_name;\n'
            '```\n\n'
            '### Выбор всех колонок\n\n'
            'Символ `*` означает «все колонки»:\n\n'
            '```sql\n'
            'SELECT * FROM users;\n'
            '```\n\n'
            '### Выбор конкретных колонок\n\n'
            '```sql\n'
            'SELECT name, age FROM users;\n'
            '```\n\n'
            '### DISTINCT — уникальные значения\n\n'
            '```sql\n'
            'SELECT DISTINCT city FROM users;\n'
            '```\n\n'
            '### AS — псевдонимы\n\n'
            '```sql\n'
            'SELECT name AS username, age FROM users;\n'
            '```\n\n'
            '### Арифметика в SELECT\n\n'
            '```sql\n'
            'SELECT name, salary * 12 AS annual_salary FROM employees;\n'
            '```\n\n'
            '## Полный синтаксис\n\n'
            '```sql\n'
            'SELECT [DISTINCT] column1, column2\n'
            'FROM table_name\n'
            'WHERE condition\n'
            'ORDER BY column [ASC | DESC]\n'
            'LIMIT count OFFSET skip;\n'
            '```\n\n'
            'Порядок выполнения:\n'
            '1. `FROM` — источник данных\n'
            '2. `WHERE` — фильтрация\n'
            '3. `SELECT` — выбор колонок\n'
            '4. `ORDER BY` — сортировка\n'
            '5. `LIMIT` / `OFFSET` — пагинация'
        ),
    })

    Article.objects.get_or_create(title='JOIN — объединение таблиц', defaults={
        'category': cat_join,
        'order': 1,
        'content': (
            '## INNER JOIN\n\n'
            '`JOIN` (или `INNER JOIN`) объединяет строки из двух таблиц по условию:\n\n'
            '```sql\n'
            'SELECT customers.name, orders.total\n'
            'FROM customers\n'
            'INNER JOIN orders ON customers.id = orders.customer_id;\n'
            '```\n\n'
            'Результат — только те строки, где есть совпадение в обеих таблицах.\n\n'
            '## Синтаксис\n\n'
            '```sql\n'
            'SELECT table1.column, table2.column\n'
            'FROM table1\n'
            '[INNER] JOIN table2 ON table1.key = table2.key;\n'
            '```\n\n'
            '## Псевдонимы таблиц\n\n'
            '```sql\n'
            'SELECT c.name, o.total\n'
            'FROM customers c\n'
            'JOIN orders o ON c.id = o.customer_id;\n'
            '```\n\n'
            '## JOIN нескольких таблиц\n\n'
            '```sql\n'
            'SELECT o.id, c.name, p.name AS product\n'
            'FROM orders o\n'
            'JOIN customers c ON o.customer_id = c.id\n'
            'JOIN products p ON o.product_id = p.id;\n'
            '```\n\n'
            '## Важно\n\n'
            '- Всегда используйте псевдонимы или полные имена таблиц для колонок\n'
            '- Если имя колонки уникально, псевдоним не обязателен\n'
            '- `INNER JOIN` и `JOIN` — одно и то же'
        ),
    })

    Article.objects.get_or_create(title='GROUP BY и агрегатные функции', defaults={
        'category': cat_group,
        'order': 1,
        'content': (
            '## Агрегатные функции\n\n'
            'Агрегатные функции вычисляют одно значение из набора строк:\n\n'
            '| Функция | Описание |\n'
            '|---------|----------|\n'
            '| `COUNT()` | Количество строк |\n'
            '| `SUM()` | Сумма значений |\n'
            '| `AVG()` | Среднее значение |\n'
            '| `MIN()` | Минимальное значение |\n'
            '| `MAX()` | Максимальное значение |\n\n'
            '```sql\n'
            'SELECT COUNT(*) AS total_users FROM users;\n'
            'SELECT AVG(salary) AS avg_salary FROM employees;\n'
            'SELECT MAX(price) AS max_price FROM products;\n'
            '```\n\n'
            '## GROUP BY — группировка\n\n'
            '`GROUP BY` группирует строки с одинаковыми значениями в указанных колонках:\n\n'
            '```sql\n'
            'SELECT department, COUNT(*) AS emp_count\n'
            'FROM employees\n'
            'GROUP BY department;\n'
            '```\n\n'
            '## Правила\n\n'
            '- Все колонки в `SELECT` должны быть либо в `GROUP BY`, либо внутри агрегатной функции\n'
            '- В `GROUP BY` можно указывать несколько колонок\n\n'
            '```sql\n'
            'SELECT department, position, AVG(salary)\n'
            'FROM employees\n'
            'GROUP BY department, position;\n'
            '```\n\n'
            '## HAVING — фильтрация групп\n\n'
            '`WHERE` фильтрует строки ДО группировки, `HAVING` — ПОСЛЕ:\n\n'
            '```sql\n'
            'SELECT department, AVG(salary) AS avg_salary\n'
            'FROM employees\n'
            'WHERE salary > 0\n'
            'GROUP BY department\n'
            'HAVING AVG(salary) > 70000;\n'
            '```'
        ),
    })

    Article.objects.get_or_create(title='Подзапросы (Subqueries)', defaults={
        'category': cat_subq,
        'order': 1,
        'content': (
            '## Что такое подзапрос\n\n'
            'Подзапрос (subquery) — это `SELECT` внутри другого запроса.\n'
            'Он выполняется первым, и его результат используется во внешнем запросе.\n\n'
            '## Подзапрос в WHERE\n\n'
            'Самый частый вариант — сравнение с результатом подзапроса:\n\n'
            '```sql\n'
            'SELECT name, salary\n'
            'FROM employees\n'
            'WHERE salary > (SELECT AVG(salary) FROM employees);\n'
            '```\n\n'
            '### IN и NOT IN\n\n'
            '```sql\n'
            'SELECT name FROM customers\n'
            'WHERE id IN (SELECT customer_id FROM orders);\n'
            '```\n\n'
            '### EXISTS и NOT EXISTS\n\n'
            'Проверяет, есть ли хотя бы одна строка в подзапросе:\n\n'
            '```sql\n'
            'SELECT name FROM products p\n'
            'WHERE NOT EXISTS (\n'
            '    SELECT 1 FROM order_items oi WHERE oi.product_id = p.id\n'
            ');\n'
            '```\n\n'
            '## Подзапрос в FROM\n\n'
            'Подзапрос может выступать как виртуальная таблица:\n\n'
            '```sql\n'
            'SELECT dept_stats.department, dept_stats.avg_salary\n'
            'FROM (\n'
            '    SELECT department, AVG(salary) AS avg_salary\n'
            '    FROM employees\n'
            '    GROUP BY department\n'
            ') dept_stats\n'
            'WHERE dept_stats.avg_salary > 60000;\n'
            '```\n\n'
            '## Подзапрос в SELECT\n\n'
            '```sql\n'
            'SELECT name,\n'
            '    (SELECT AVG(salary) FROM employees) AS avg_all,\n'
            '    salary - (SELECT AVG(salary) FROM employees) AS diff\n'
            'FROM employees;\n'
            '```\n\n'
            '## Коррелированные подзапросы\n\n'
            'Подзапрос может ссылаться на колонки внешнего запроса.\n'
            'Такой подзапрос выполняется для КАЖДОЙ строки внешнего запроса:\n\n'
            '```sql\n'
            'SELECT e.name, e.salary\n'
            'FROM employees e\n'
            'WHERE e.salary > (\n'
            '    SELECT AVG(salary) FROM employees WHERE department = e.department\n'
            ');\n'
            '```\n\n'
            '## Важно\n\n'
            '- Подзапрос в `WHERE` должен возвращать одно значение (для сравнения)\n'
            '- `IN` и `EXISTS` могут работать с подзапросами, возвращающими несколько строк\n'
            '- Подзапрос в `FROM` обязательно требует псевдоним'
        ),
    })

    Article.objects.get_or_create(title='DDL — создание и изменение таблиц', defaults={
        'category': cat_ddl,
        'order': 1,
        'content': (
            '## Что такое DDL\n\n'
            'DDL (Data Definition Language) — команды для создания и изменения структуры БД:\n'
            '- `CREATE TABLE` — создание таблицы\n'
            '- `ALTER TABLE` — изменение таблицы\n'
            '- `DROP TABLE` — удаление таблицы\n\n'
            '## CREATE TABLE\n\n'
            '```sql\n'
            'CREATE TABLE students (\n'
            '    id SERIAL PRIMARY KEY,\n'
            '    first_name VARCHAR(100) NOT NULL,\n'
            '    last_name VARCHAR(100) NOT NULL,\n'
            '    birth_date DATE,\n'
            '    group_id INTEGER REFERENCES groups(id)\n'
            ');\n'
            '```\n\n'
            '### Типы данных\n\n'
            '| Тип | Описание |\n'
            '|-----|----------|\n'
            '| `INTEGER` / `INT` | Целое число |\n'
            '| `SERIAL` | Автоинкремент (INTEGER + последовательность) |\n'
            '| `VARCHAR(n)` | Строка до n символов |\n'
            '| `TEXT` | Длинный текст |\n'
            '| `NUMERIC(p,s)` | Число с фиксированной точностью |\n'
            '| `DATE` | Дата |\n'
            '| `BOOLEAN` | true/false |\n\n'
            '### Ограничения (constraints)\n\n'
            '- `PRIMARY KEY` — первичный ключ\n'
            '- `FOREIGN KEY` — внешний ключ (ссылка на другую таблицу)\n'
            '- `NOT NULL` — поле не может быть пустым\n'
            '- `UNIQUE` — уникальное значение\n'
            '- `CHECK` — проверка условия\n'
            '- `DEFAULT` — значение по умолчанию\n\n'
            '## ALTER TABLE\n\n'
            '```sql\n'
            '-- Добавить столбец\n'
            'ALTER TABLE students ADD COLUMN email VARCHAR(255);\n\n'
            '-- Удалить столбец\n'
            'ALTER TABLE students DROP COLUMN email;\n\n'
            '-- Добавить ограничение\n'
            'ALTER TABLE students\n'
            'ADD CONSTRAINT fk_group\n'
            'FOREIGN KEY (group_id) REFERENCES groups(id);\n'
            '```\n\n'
            '## DROP TABLE\n\n'
            '```sql\n'
            'DROP TABLE students;              -- удалить таблицу\n'
            'DROP TABLE IF EXISTS students;    -- без ошибки, если нет\n'
            '```\n\n'
            '## Важно\n\n'
            '- `DROP TABLE` удаляет таблицу полностью вместе с данными\n'
            '- Изменение структуры может быть заблокировано, если есть зависимости'
        ),
    })

    Article.objects.get_or_create(title='DML — манипуляция данными', defaults={
        'category': cat_dml,
        'order': 1,
        'content': (
            '## Что такое DML\n\n'
            'DML (Data Manipulation Language) — команды для работы с данными:\n'
            '- `INSERT` — добавление строк\n'
            '- `UPDATE` — изменение строк\n'
            '- `DELETE` — удаление строк\n\n'
            '## INSERT — добавление данных\n\n'
            '```sql\n'
            '-- Вставка одной строки\n'
            'INSERT INTO employees (name, position, salary)\n'
            "VALUES ('Елена', 'Менеджер', 75000);\n\n"
            '-- Вставка нескольких строк\n'
            'INSERT INTO employees (name, position, salary) VALUES\n'
            "    ('Иван', 'Разработчик', 80000),\n"
            "    ('Мария', 'Аналитик', 65000);\n\n"
            '-- Вставка с DEFAULT\n'
            'INSERT INTO products (name, price) VALUES\n'
            "    ('Новый товар', DEFAULT);\n"
            '```\n\n'
            '## UPDATE — обновление данных\n\n'
            '```sql\n'
            '-- Обновить одно поле\n'
            "UPDATE employees SET salary = 85000 WHERE name = 'Иван';\n\n"
            '-- Обновить несколько полей\n'
            "UPDATE employees\n"
            "SET position = 'Senior', salary = 95000\n"
            "WHERE name = 'Иван';\n\n"
            '-- Обновить все строки\n'
            'UPDATE employees SET salary = salary * 1.1;\n'
            '```\n\n'
            '## DELETE — удаление данных\n\n'
            '```sql\n'
            '-- Удалить по условию\n'
            "DELETE FROM products WHERE stock = 0;\n\n"
            '-- Удалить все строки (очистить таблицу)\n'
            'DELETE FROM products;\n'
            '```\n\n'
            '## Важные правила\n\n'
            '- **Всегда** используйте `WHERE` в `UPDATE` и `DELETE`, '
            'если не хотите изменить/удалить все строки\n'
            '- Используйте `TRUNCATE` вместо `DELETE` без `WHERE`, '
            'если нужно быстро очистить таблицу\n'
            '- После `INSERT` автоинкремент увеличивается, даже если транзакция откачена\n\n'
            '## RETURNING (PostgreSQL)\n\n'
            'PostgreSQL позволяет вернуть изменённые строки:\n\n'
            '```sql\n'
            'INSERT INTO employees (name, salary)\n'
            "VALUES ('Новый', 50000) RETURNING id;\n\n"
            'DELETE FROM employees WHERE id = 1 RETURNING *;\n'
            '```'
        ),
    })


def unseed_data(apps, schema_editor):
    Article = apps.get_model('theory', 'Article')
    Article.objects.filter(title__in=[
        'Основы SELECT',
        'JOIN — объединение таблиц',
        'GROUP BY и агрегатные функции',
        'Подзапросы (Subqueries)',
        'DDL — создание и изменение таблиц',
        'DML — манипуляция данными',
    ]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('theory', '0003_seed_articles'),
        ('task_checker', '0005_more_seed_data'),
    ]

    operations = [
        migrations.RunPython(seed_data, unseed_data),
    ]
