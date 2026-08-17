from sqlalchemy import text

def get_kpis(table_name: str, measures: list, engine) -> list:
    kpis = []
    with engine.connect() as conn:
        for m in measures:
            col = m["column"]
            query = text(f'''
                SELECT
                    SUM("{col}") AS total,
                    AVG("{col}") AS average,
                    MIN("{col}") AS minimum,
                    MAX("{col}") AS maximum,
                    COUNT("{col}") AS count
                FROM {table_name}
            ''')
            row = conn.execute(query).mappings().first()
            kpis.append({
                "measure": col,
                "total": float(row["total"]) if row["total"] is not None else None,
                "average": round(float(row["average"]), 2) if row["average"] is not None else None,
                "minimum": float(row["minimum"]) if row["minimum"] is not None else None,
                "maximum": float(row["maximum"]) if row["maximum"] is not None else None,
                "count": row["count"]
            })
    return kpis


def get_chart_data(table_name: str, dimension: str, measure: str, aggregation: str, engine) -> list:
    aggregation = aggregation.upper()
    if aggregation not in ["SUM", "AVG", "COUNT", "MIN", "MAX"]:
        aggregation = "SUM"

    query = text(f'''
        SELECT "{dimension}" AS label, {aggregation}("{measure}") AS value
        FROM {table_name}
        GROUP BY "{dimension}"
        ORDER BY value DESC
    ''')
    with engine.connect() as conn:
        rows = conn.execute(query).mappings().all()
    return [{"label": r["label"], "value": float(r["value"]) if r["value"] is not None else 0} for r in rows]


def get_drilldown(table_name: str, dimension: str, value: str, engine) -> list:
    query = text(f'SELECT * FROM {table_name} WHERE "{dimension}" = :value')
    with engine.connect() as conn:
        rows = conn.execute(query, {"value": value}).mappings().all()
    return [dict(r) for r in rows]