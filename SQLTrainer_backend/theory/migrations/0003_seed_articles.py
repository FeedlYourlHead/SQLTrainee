from django.db import migrations


def seed_data(apps, schema_editor):
    Category = apps.get_model('task_checker', 'Category')
    Article = apps.get_model('theory', 'Article')

    cat_select = Category.objects.get(name='SELECT')
    cat_join = Category.objects.get(name='JOIN')
    cat_group = Category.objects.get(name='GROUP BY')

    Article.objects.get_or_create(title='Фильтрация и сортировка (WHERE, ORDER BY, LIMIT)', defaults={
        'category': cat_select,
        'order': 2,
        'content': (
            '## WHERE — фильтрация строк\n\n'
            'Оператор `WHERE` позволяет отфильтровать строки по условию:\n\n'
            '```sql\n'
            'SELECT * FROM users WHERE age > 18;\n'
            '```\n\n'
            '### Операторы сравнения\n\n'
            '| Оператор | Описание |\n'
            '|----------|----------|\n'
            '| `=` | Равно |\n'
            '| `<>` или `!=` | Не равно |\n'
            '| `>` | Больше |\n'
            '| `<` | Меньше |\n'
            '| `>=` | Больше или равно |\n'
            '| `<=` | Меньше или равно |\n\n'
            '### Логические операторы\n\n'
            '- `AND` — все условия должны быть истинны\n'
            '- `OR` — хотя бы одно условие истинно\n'
            '- `NOT` — отрицание условия\n\n'
            '```sql\n'
            'SELECT * FROM products\n'
            'WHERE price > 100 AND price < 500;\n'
            '```\n\n'
            '### BETWEEN и IN\n\n'
            '```sql\n'
            'SELECT * FROM products WHERE price BETWEEN 100 AND 500;\n'
            'SELECT * FROM users WHERE name IN (\'Иван\', \'Мария\');\n'
            '```\n\n'
            '### LIKE — поиск по шаблону\n\n'
            '- `%` — любая последовательность символов\n'
            '- `_` — один любой символ\n\n'
            '```sql\n'
            'SELECT * FROM users WHERE name LIKE \'А%\';\n'
            '```\n\n'
            '## ORDER BY — сортировка\n\n'
            'Сортирует результат по одному или нескольким полям:\n\n'
            '```sql\n'
            'SELECT name, age FROM users ORDER BY age DESC;\n'
            'SELECT name, salary FROM employees ORDER BY salary DESC, name ASC;\n'
            '```\n\n'
            '- `ASC` — по возрастанию (по умолчанию)\n'
            '- `DESC` — по убыванию\n\n'
            '## LIMIT и OFFSET\n\n'
            'Ограничивают количество строк в результате:\n\n'
            '```sql\n'
            'SELECT * FROM users LIMIT 10;\n'
            'SELECT * FROM users LIMIT 10 OFFSET 20;  -- страница 3\n'
            '```\n\n'
            '## Порядок выполнения\n\n'
            '1. `FROM` / `JOIN` — источник данных\n'
            '2. `WHERE` — фильтрация строк\n'
            '3. `GROUP BY` — группировка\n'
            '4. `HAVING` — фильтрация групп\n'
            '5. `SELECT` — выбор колонок\n'
            '6. `ORDER BY` — сортировка\n'
            '7. `LIMIT` / `OFFSET` — пагинация'
        ),
    })

    Article.objects.get_or_create(title='LEFT, RIGHT, FULL JOIN — различия', defaults={
        'category': cat_join,
        'order': 2,
        'content': (
            '## Виды JOIN\n\n'
            'Кроме `INNER JOIN`, существуют **внешние соединения**, которые сохраняют строки '
            'из одной или обеих таблиц, даже если нет совпадения.\n\n'
            '## LEFT JOIN\n\n'
            'Сохраняет **все строки из левой таблицы**. Если нет совпадения в правой — '
            'поля правой таблицы будут `NULL`:\n\n'
            '```sql\n'
            'SELECT customers.name, orders.total\n'
            'FROM customers\n'
            'LEFT JOIN orders ON customers.id = orders.customer_id;\n'
            '```\n\n'
            'Результат: все клиенты, даже те, у кого нет заказов. '
            'Для клиентов без заказов `total` будет `NULL`.\n\n'
            '## RIGHT JOIN\n\n'
            'То же самое, но сохраняет **все строки из правой таблицы**:\n\n'
            '```sql\n'
            'SELECT customers.name, orders.total\n'
            'FROM customers\n'
            'RIGHT JOIN orders ON customers.id = orders.customer_id;\n'
            '```\n\n'
            'На практике `RIGHT JOIN` используется редко — его можно заменить на '
            '`LEFT JOIN`, поменяв таблицы местами.\n\n'
            '## FULL JOIN\n\n'
            'Сохраняет **все строки из обеих таблиц**. Если нет совпадения — '
            'недостающие поля будут `NULL`:\n\n'
            '```sql\n'
            'SELECT customers.name, orders.total\n'
            'FROM customers\n'
            'FULL JOIN orders ON customers.id = orders.customer_id;\n'
            '```\n\n'
            '## Сравнение\n\n'
            '| Тип JOIN | Левая таблица | Правая таблица |\n'
            '|----------|---------------|----------------|\n'
            '| INNER JOIN | Только совпадения | Только совпадения |\n'
            '| LEFT JOIN | **Все строки** | Только совпадения |\n'
            '| RIGHT JOIN | Только совпадения | **Все строки** |\n'
            '| FULL JOIN | **Все строки** | **Все строки** |\n\n'
            '## Когда что использовать\n\n'
            '- **INNER JOIN** — когда нужны только связанные данные\n'
            '- **LEFT JOIN** — когда нужны все записи из главной таблицы, '
            'даже без связанных (например, «все клиенты и их заказы»)\n'
            '- **FULL JOIN** — когда нужно увидеть полную картину, '
            'включая «сиротские» записи в обеих таблицах'
        ),
    })

    Article.objects.get_or_create(title='HAVING — фильтрация после группировки', defaults={
        'category': cat_group,
        'order': 2,
        'content': (
            '## WHERE vs HAVING\n\n'
            'Главное отличие:\n'
            '- `WHERE` фильтрует строки **до** группировки\n'
            '- `HAVING` фильтрует группы **после** группировки\n\n'
            '## Синтаксис\n\n'
            '```sql\n'
            'SELECT department, AVG(salary) AS avg_salary\n'
            'FROM employees\n'
            'GROUP BY department\n'
            'HAVING AVG(salary) > 70000;\n'
            '```\n\n'
            'Этот запрос выведет только те отделы, где средняя зарплата выше 70000.\n\n'
            '## Пример: WHERE + GROUP BY + HAVING\n\n'
            '```sql\n'
            'SELECT department, AVG(salary) AS avg_salary\n'
            'FROM employees\n'
            'WHERE salary > 30000  -- сначала убираем низкие зарплаты\n'
            'GROUP BY department\n'
            'HAVING AVG(salary) > 70000;  -- потом фильтруем отделы\n'
            '```\n\n'
            '## Что можно использовать в HAVING\n\n'
            'В `HAVING` можно использовать:\n'
            '- Агрегатные функции: `COUNT()`, `SUM()`, `AVG()`, `MIN()`, `MAX()`\n'
            '- Поля из `GROUP BY`\n\n'
            'Нельзя использовать столбцы, которые не входят в `GROUP BY` '
            'и не являются агрегатными.\n\n'
            '## Ошибка новичков\n\n'
            '```sql\n'
            '-- НЕПРАВИЛЬНО: WHERE не работает с агрегатами\n'
            'SELECT department, AVG(salary)\n'
            'FROM employees\n'
            'WHERE AVG(salary) > 70000   -- ОШИБКА!\n'
            'GROUP BY department;\n'
            '```\n\n'
            '```sql\n'
            '-- ПРАВИЛЬНО: используем HAVING\n'
            'SELECT department, AVG(salary)\n'
            'FROM employees\n'
            'GROUP BY department\n'
            'HAVING AVG(salary) > 70000;\n'
            '```\n\n'
            '## Полный пример с реальными данными\n\n'
            '```sql\n'
            'SELECT\n'
            '    position,\n'
            '    COUNT(*) AS employees_count,\n'
            '    AVG(salary) AS avg_salary\n'
            'FROM employees\n'
            'WHERE salary > 0\n'
            'GROUP BY position\n'
            'HAVING COUNT(*) >= 2\n'
            'ORDER BY avg_salary DESC;\n'
            '```\n\n'
            'Этот запрос выведет должности, где работает хотя бы 2 сотрудника, '
            'со средней зарплатой по каждой должности.'
        ),
    })


def unseed_data(apps, schema_editor):
    Article = apps.get_model('theory', 'Article')
    Article.objects.filter(title__in=[
        'Фильтрация и сортировка (WHERE, ORDER BY, LIMIT)',
        'LEFT, RIGHT, FULL JOIN — различия',
        'HAVING — фильтрация после группировки',
    ]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('theory', '0002_uploadedimage'),
    ]

    operations = [
        migrations.RunPython(seed_data, unseed_data),
    ]
