import requests, json

BASE = 'http://backend:8000/api'

# Login
r = requests.post(f'{BASE}/auth/login/', json={'username': 'admin', 'password': 'admin123'})
token = r.json()['access']
headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# Get categories
cats = requests.get(f'{BASE}/categories/', headers=headers).json()
cat_map = {c['name']: c['id'] for c in cats}

articles = [
    {
        'title': 'Основы SELECT',
        'category_id': cat_map.get('SELECT'),
        'order': 1,
        'content': '''## Что такое SELECT?

`SELECT` — это основной оператор SQL для выборки данных из таблиц.

### Базовая структура

```sql
SELECT столбец1, столбец2, ...
FROM название_таблицы;
```

### Пример

Таблица **users**:

| id | name  | age |
|----|-------|-----|
| 1  | Анна  | 25  |
| 2  | Борис | 30  |

Запрос для получения всех данных:

```sql
SELECT * FROM users;
```

### SELECT с условием WHERE

```sql
SELECT * FROM users WHERE age > 25;
```

### Полезные советы
- `*` означает "все столбцы"
- Можно указать конкретные столбцы: `SELECT name, age FROM users;`
- Для переименования столбца используй `AS`: `SELECT name AS имя FROM users;`'''
    },
    {
        'title': 'JOIN — объединение таблиц',
        'category_id': cat_map.get('JOIN'),
        'order': 2,
        'content': '''## JOIN в SQL

`JOIN` позволяет объединять данные из нескольких таблиц по связанным столбцам.

### Виды JOIN

| Тип | Описание |
|-----|----------|
| `INNER JOIN` | Только совпадающие строки из обеих таблиц |
| `LEFT JOIN` | Все строки из левой таблицы + совпадающие из правой |
| `RIGHT JOIN` | Все строки из правой таблицы + совпадающие из левой |
| `FULL JOIN` | Все строки из обеих таблиц |

### Пример INNER JOIN

```sql
SELECT customers.name, orders.total
FROM customers
INNER JOIN orders ON customers.id = orders.customer_id;
```

### Пример LEFT JOIN

```sql
SELECT customers.name, COUNT(orders.id) AS order_count
FROM customers
LEFT JOIN orders ON customers.id = orders.customer_id
GROUP BY customers.id, customers.name;
```

### Важно
- Всегда указывай условие соединения после `ON`
- Используй псевдонимы таблиц для краткости: `FROM customers c JOIN orders o ON c.id = o.customer_id`'''
    },
    {
        'title': 'GROUP BY и агрегатные функции',
        'category_id': cat_map.get('GROUP BY'),
        'order': 3,
        'content': '''## GROUP BY и агрегация

`GROUP BY` группирует строки по одному или нескольким столбцам, позволяя применять агрегатные функции к каждой группе.

### Агрегатные функции

| Функция | Описание |
|---------|----------|
| `COUNT()` | Количество строк |
| `SUM()` | Сумма значений |
| `AVG()` | Среднее значение |
| `MIN()` | Минимальное значение |
| `MAX()` | Максимальное значение |

### Пример

```sql
SELECT customer_id, COUNT(*) AS order_count, SUM(total) AS total_spent
FROM orders
GROUP BY customer_id;
```

### HAVING

`HAVING` — аналог `WHERE`, но для сгруппированных данных:

```sql
SELECT customer_id, COUNT(*) AS order_count
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 2;
```

### Порядок выполнения

1. `FROM` / `JOIN`
2. `WHERE`
3. `GROUP BY`
4. `HAVING`
5. `SELECT`
6. `ORDER BY`'''
    },
    {
        'title': 'Подзапросы (Subqueries)',
        'category_id': cat_map.get('Subqueries'),
        'order': 4,
        'content': '''## Подзапросы

Подзапрос — это `SELECT`, вложенный в другой запрос. Он заключается в круглые скобки.

### WHERE с подзапросом

```sql
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
```

### Подзапрос с IN

```sql
SELECT name
FROM customers
WHERE id IN (
    SELECT customer_id FROM orders WHERE total > 100
);
```

### Подзапрос с EXISTS

```sql
SELECT p.name
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.product_id = p.id
);
```

### Виды подзапросов

| Тип | Возвращает | Где используется |
|-----|-----------|-----------------|
| Скалярный | Одно значение | `WHERE`, `SELECT`, `HAVING` |
| Столбец | Много значений | `WHERE IN` |
| Строка | Одна строка | `WHERE (col1, col2) IN` |
| Таблица | Много строк | `FROM` (производная таблица) |'''
    },
    {
        'title': 'DDL — создание и изменение таблиц',
        'category_id': cat_map.get('DDL'),
        'order': 5,
        'content': '''## DDL (Data Definition Language)

DDL — операторы для создания и изменения структуры базы данных.

### CREATE TABLE

```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    group_id INTEGER REFERENCES groups(id)
);
```

### ALTER TABLE

**Добавить столбец:**
```sql
ALTER TABLE employees ADD COLUMN email VARCHAR(255);
```

**Изменить тип столбца:**
```sql
ALTER TABLE employees ALTER COLUMN salary TYPE NUMERIC(12,2);
```

**Удалить столбец:**
```sql
ALTER TABLE employees DROP COLUMN email;
```

### DROP TABLE

```sql
DROP TABLE IF EXISTS students;
```

### Типы данных PostgreSQL

| Тип | Описание |
|-----|----------|
| `SERIAL` | Автоинкремент |
| `INTEGER` | Целое число |
| `VARCHAR(n)` | Строка до n символов |
| `NUMERIC(p,s)` | Число с точностью |
| `DATE` | Дата |
| `BOOLEAN` | true/false |'''
    },
    {
        'title': 'DML — манипуляция данными',
        'category_id': cat_map.get('DML'),
        'order': 6,
        'content': '''## DML (Data Manipulation Language)

DML — операторы для работы с данными внутри таблиц.

### INSERT — добавление строк

```sql
INSERT INTO employees (name, position, salary)
VALUES ('Елена', 'Менеджер', 75000);
```

Добавление нескольких строк:
```sql
INSERT INTO products (name, price) VALUES
    ('Ноутбук', 75000),
    ('Мышь', 1500);
```

### UPDATE — обновление данных

```sql
UPDATE employees
SET salary = salary * 1.15
WHERE position = 'Разработчик';
```

**Важно:** не забывай `WHERE`, иначе обновятся **все** строки!

### DELETE — удаление данных

```sql
DELETE FROM products WHERE stock = 0;
```

**Важно:** без `WHERE` удалятся **все** строки из таблицы.

### RETURNING (PostgreSQL)

PostgreSQL позволяет вернуть изменённые данные:

```sql
DELETE FROM products WHERE stock = 0 RETURNING *;
INSERT INTO employees (name, salary) VALUES ('Иван', 50000) RETURNING id;
```'''
    },
]

for a in articles:
    r = requests.post(f'{BASE}/articles/', headers=headers, json=a)
    if r.status_code == 201:
        print(f'  ✓ {a["title"]}')
    else:
        print(f'  ✗ {a["title"]}: {r.text}')
