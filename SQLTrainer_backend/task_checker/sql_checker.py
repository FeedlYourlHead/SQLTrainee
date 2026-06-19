import uuid

import psycopg2
from django.conf import settings


def _get_connection_params():
    return getattr(settings, 'SANDBOX_DATABASE', None) or {
        'dbname': settings.DATABASES['default']['NAME'],
        'user': settings.DATABASES['default']['USER'],
        'password': settings.DATABASES['default']['PASSWORD'],
        'host': settings.DATABASES['default']['HOST'],
        'port': settings.DATABASES['default'].get('PORT', '5432'),
    }


def _fetch_results(cur):
    if cur.description is None:
        return [], []
    columns = [desc[0] for desc in cur.description]
    try:
        rows = [list(row) for row in cur.fetchall()]
    except psycopg2.ProgrammingError:
        rows = []
    return columns, rows


def execute_query(schema_sql, query, verification_query=None, timeout=5000):
    conn = psycopg2.connect(**_get_connection_params())
    conn.autocommit = True
    cur = conn.cursor()
    schema_name = f"tmp_{uuid.uuid4().hex[:12]}"
    try:
        cur.execute(f'CREATE SCHEMA "{schema_name}"')
        cur.execute(f'SET search_path TO "{schema_name}"')
        cur.execute(f"SET statement_timeout = {timeout}")

        cur.execute(schema_sql)
        cur.execute(query)
        if verification_query:
            cur.execute(verification_query)
        columns, rows = _fetch_results(cur)
        return columns, rows
    except Exception:
        raise
    finally:
        cur.execute(f'DROP SCHEMA IF EXISTS "{schema_name}" CASCADE')
        cur.close()
        conn.close()


def check_query(schema_sql, user_query, expected_query, verification_query=None, timeout=5000):
    try:
        user_cols, user_rows = execute_query(schema_sql, user_query, verification_query, timeout)
    except Exception as e:
        return False, None, None, str(e)

    try:
        exp_cols, exp_rows = execute_query(schema_sql, expected_query, verification_query, timeout)
    except Exception as e:
        return False, None, None, f"Error in expected query: {e}"

    if user_cols != exp_cols:
        return (
            False,
            {'columns': user_cols, 'rows': user_rows[:100]},
            {'columns': exp_cols, 'rows': exp_rows},
            "Columns don't match",
        )

    if user_rows != exp_rows:
        return (
            False,
            {'columns': user_cols, 'rows': user_rows[:100]},
            {'columns': exp_cols, 'rows': exp_rows},
            "Rows don't match",
        )

    return (
        True,
        {'columns': user_cols, 'rows': user_rows[:100]},
        {'columns': exp_cols, 'rows': exp_rows},
        None,
    )
