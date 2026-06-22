import sqlite3

DB_NAME = "craylife.db"

def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_name TEXT NOT NULL,
        value REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()


def insert_reading(sensor_name, value):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO sensor_readings (sensor_name, value)
        VALUES (?, ?)
        """,
        (sensor_name, value)
    )

    conn.commit()
    conn.close()


def get_latest_reading(sensor_name):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM sensor_readings
        WHERE sensor_name = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (sensor_name,)
    )

    row = cursor.fetchone()
    conn.close()

    return dict(row) if row else None


def get_all_latest():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT sensor_name, value, timestamp
    FROM sensor_readings
    WHERE id IN (
        SELECT MAX(id)
        FROM sensor_readings
        GROUP BY sensor_name
    )
    """)

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_sensor_history(sensor_name, limit=100):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM sensor_readings
        WHERE sensor_name = ?
        ORDER BY id DESC
        LIMIT ?
        """,
        (sensor_name, limit)
    )

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_sensor_history_paginated(sensor="all", limit=25, offset=0, search=""):
    """
    Paginated history for the History dashboard page.
    Returns (rows, total) where rows is a list of dicts.

    value is stored as REAL in the DB; cast to string for the search
    comparison so partial matches work (e.g. searching "103" finds 1032.3).
    """
    conn = get_connection()
    cursor = conn.cursor()

    clauses, params = [], []

    if sensor != "all":
        clauses.append("sensor_name = ?")
        params.append(sensor)

    if search:
        # CAST value AS TEXT lets us do partial string matching on numerics
        clauses.append(
            "(sensor_name LIKE ? OR CAST(value AS TEXT) LIKE ?)"
        )
        like = f"%{search}%"
        params.extend([like, like])

    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""

    total = cursor.execute(
        f"SELECT COUNT(*) FROM sensor_readings {where}", params
    ).fetchone()[0]

    rows = cursor.execute(
        f"""
        SELECT id, sensor_name, value, timestamp
        FROM sensor_readings
        {where}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        """,
        params + [limit, offset],
    ).fetchall()

    conn.close()

    return [dict(row) for row in rows], total