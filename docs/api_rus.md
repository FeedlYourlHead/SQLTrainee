# Документация API SQL-Trainer

## Все эндпоинты

### Авторизация

| Метод | Путь | Назначение | Файл |
|-------|------|-----------|------|
| POST | `/api/auth/register/` | Регистрация | `task_checker/views.py:28` |
| POST | `/api/auth/login/` | Вход (JWT access + refresh) | SimpleJWT `TokenObtainPairView` |
| POST | `/api/auth/refresh/` | Обновить access token | SimpleJWT `TokenRefreshView` |

### Пользователи

| Метод | Путь | Назначение | Файл |
|-------|------|-----------|------|
| GET | `/api/users/` | Список пользователей | `task_checker/views.py:34` |
| GET | `/api/users/me/` | Текущий пользователь | `task_checker/views.py:38` |
| GET | `/api/users/{id}/` | Детали пользователя | `task_checker/views.py:34` |
| GET | `/api/users/{id}/stats/` | Статистика (всего/верно/решено) | `task_checker/views.py:44` |
| GET | `/api/users/{id}/solved/` | Список решённых задач | `task_checker/views.py:61` |

### Задачи

| Метод | Путь | Назначение | Файл |
|-------|------|-----------|------|
| GET | `/api/problems/` | Список задач (фильтры: difficulty, category_id, search) | `task_checker/views.py:74` |
| POST | `/api/problems/` | Создать задачу (админ) | `task_checker/views.py:74` |
| GET | `/api/problems/{id}/` | Детали задачи | `task_checker/views.py:74` |
| PUT | `/api/problems/{id}/` | Обновить задачу (админ) | `task_checker/views.py:74` |
| PATCH | `/api/problems/{id}/` | Частично обновить (админ) | `task_checker/views.py:74` |
| DELETE | `/api/problems/{id}/` | Удалить задачу (админ) | `task_checker/views.py:74` |
| POST | `/api/problems/{id}/run/` | **Запустить SQL** (песочница) | `task_checker/views.py:106` |
| POST | `/api/problems/{id}/submit/` | **Отправить на проверку** | `task_checker/views.py:117` |
| GET | `/api/problems/{id}/hints/` | Получить подсказки | `task_checker/views.py:174` |
| GET/POST | `/api/problems/{id}/comments/` | Комментарии (заглушка) | `task_checker/views.py:168` |

### Отправки

| Метод | Путь | Назначение | Файл |
|-------|------|-----------|------|
| GET | `/api/submissions/` | История отправок (только свои) | `task_checker/views.py:146` |
| GET | `/api/submissions/{id}/` | Детали отправки (своей) | `task_checker/views.py:146` |

### Категории

| Метод | Путь | Назначение | Файл |
|-------|------|-----------|------|
| GET | `/api/categories/` | Список категорий | `task_checker/views.py:140` |
| POST | `/api/categories/` | Создать категорию (админ) | `task_checker/views.py:140` |
| GET | `/api/categories/{id}/` | Детали категории | `task_checker/views.py:140` |
| PUT | `/api/categories/{id}/` | Обновить (админ) | `task_checker/views.py:140` |
| DELETE | `/api/categories/{id}/` | Удалить (админ) | `task_checker/views.py:140` |

### Лидерборд и прогресс

| Метод | Путь | Назначение | Файл |
|-------|------|-----------|------|
| GET | `/api/leaderboard/` | Таблица лидеров | `task_checker/views.py:154` |
| GET | `/api/progress/` | Прогресс (решено/всего/%) | `task_checker/views.py:182` |

### Статьи / Теория

| Метод | Путь | Назначение | Файл |
|-------|------|-----------|------|
| GET | `/api/articles/` | Список статей | `theory/views.py:10` |
| POST | `/api/articles/` | Создать статью (админ) | `theory/views.py:10` |
| GET | `/api/articles/{id}/` | Детали статьи | `theory/views.py:10` |
| PUT | `/api/articles/{id}/` | Обновить (админ) | `theory/views.py:10` |
| DELETE | `/api/articles/{id}/` | Удалить (админ) | `theory/views.py:10` |

### Загрузка изображений

| Метод | Путь | Назначение | Файл |
|-------|------|-----------|------|
| POST | `/api/upload-image/` | Загрузить изображение (админ) | `theory/views.py:17` |

### Админка Django

| Метод | Путь | Назначение |
|-------|------|-----------|
| * | `/admin/` | Django Admin (зарегистрированы Article, UploadedImage) |

---

## Стек бекенда

| Компонент | Технология | Версия |
|-----------|------------|--------|
| Язык | Python | 3.12 |
| Фреймворк | Django | 6.0.4 |
| REST API | Django REST Framework | 3.17.1 |
| Аутентификация | SimpleJWT (access 2ч, refresh 7д) | 5.5.1 |
| База данных | PostgreSQL (основная + песочница) | latest |
| CORS | django-cors-headers | 4.9.0 |
| SQL-драйвер | psycopg2-binary | 2.9.12 |
| Изображения | Pillow | 12.2.0 |
| Тестирование | pytest + selenium (заготовки) | 9.0.3 |

---

## Структура проекта

```
SQLTrainer_backend/                  # Конфигурация Django-проекта
├── SQLTrainer_backend/
│   ├── settings.py                  # Настройки Django, DRF, JWT, БД
│   ├── urls.py                      # Корневой роутер (/admin/, /api/)
│   └── wsgi.py / asgi.py
├── task_checker/                    # Основное приложение (задачи, проверка)
│   ├── models.py                    # Category, Task, Submission
│   ├── views.py                     # 6 ViewSet'ов + 3 view-функции
│   ├── serializers.py               # 9 сериализаторов
│   ├── sql_checker.py               # SQL-песочница (psycopg2)
│   ├── urls.py                      # 22 роута
│   └── migrations/                  # 11 миграций
├── theory/                          # Приложение статей
│   ├── models.py                    # Article, UploadedImage
│   ├── views.py                     # ArticleViewSet + upload_image
│   ├── serializers.py               # 3 сериализатора
│   ├── urls.py                      # articles/, upload-image/
│   └── migrations/                  # 4 миграции
├── requirements.txt                 # Python-зависимости
├── Dockerfile                       # Python 3.12-slim
└── manage.py
```

---

## Схема БД (7 таблиц)

### `auth_user`

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| id | integer | PK |
| password | varchar(128) | |
| last_login | timestamp | |
| is_superuser | boolean | |
| username | varchar(150) | unique |
| first_name | varchar(150) | |
| last_name | varchar(150) | |
| email | varchar(254) | |
| is_staff | boolean | |
| is_active | boolean | |
| date_joined | timestamp | |

### `task_checker_category`

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| id | integer | PK |
| name | varchar(100) | |
| description | text | |

### `task_checker_task`

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| id | integer | PK |
| name | varchar(255) | |
| description | text | |
| expected_query | text | |
| schema_sql | text | |
| category_id | integer | FK → `task_checker_category.id` |
| difficulty | integer | default: 1 |
| is_published | boolean | default: true |
| hints | json | default: '[]' |
| verification_query | text | |
| created_at | timestamp | |

### `task_checker_submission`

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| id | integer | PK |
| user_id | integer | FK → `auth_user.id` |
| task_id | integer | FK → `task_checker_task.id` |
| user_query | text | |
| is_correct | boolean | default: false |
| error_message | text | |
| created_at | timestamp | |

### `theory_article`

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| id | integer | PK |
| title | varchar(255) | |
| content | text | |
| category_id | integer | FK → `task_checker_category.id` |
| order | integer | default: 0 |
| created_at | timestamp | |
| updated_at | timestamp | |

### `task_checker_task_related_articles` (M2M)

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| id | integer | PK |
| task_id | integer | FK → `task_checker_task.id` |
| article_id | integer | FK → `theory_article.id` |

### `theory_uploadedimage`

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| id | integer | PK |
| image | varchar(100) | |
| uploaded_by_id | integer | FK → `auth_user.id` |
| uploaded_at | timestamp | |

---

## Связи

```
auth_user
├── task_checker_submission.user_id
└── theory_uploadedimage.uploaded_by_id

task_checker_category
├── task_checker_task.category_id
└── theory_article.category_id

task_checker_task
├── task_checker_submission.task_id
└── task_checker_task_related_articles.task_id

theory_article ──→ task_checker_task_related_articles.article_id
```

---

## Засеянные данные

| Сущность | Количество |
|----------|-----------|
| Категории | 6 (SELECT, JOIN, GROUP BY, Subqueries, DDL, DML) |
| Задачи | 22 (3 + 7 + 9 + 3) |
| Статьи | 9 (3 + 6) |

---

## Ключевые файлы

| Файл | Содержание |
|------|-----------|
| `SQLTrainer_backend/SQLTrainer_backend/urls.py` | Корневой роутинг (`/admin/`, `/api/`) |
| `SQLTrainer_backend/task_checker/urls.py` | Все endpoint'ы задач, auth, пользователей, отправок, лидерборда |
| `SQLTrainer_backend/task_checker/views.py` | Все реализации view + классы разрешений |
| `SQLTrainer_backend/task_checker/serializers.py` | Схемы данных запросов/ответов |
| `SQLTrainer_backend/task_checker/sql_checker.py` | Движок SQL-песочницы |
| `SQLTrainer_backend/task_checker/models.py` | Модели БД (Category, Task, Submission) |
| `SQLTrainer_backend/theory/urls.py` | Endpoint'ы статей и загрузки |
| `SQLTrainer_backend/theory/views.py` | Реализация theory view |
| `SQLTrainer_backend/theory/models.py` | Модели БД (Article, UploadedImage) |
| `SQLTrainer_backend/SQLTrainer_backend/settings.py` | Вся конфигурация Django/DRF/JWT/БД |
