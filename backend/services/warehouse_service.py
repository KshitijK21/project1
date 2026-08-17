import pandas as pd
from sqlalchemy import create_engine



def generate_star_schema(df: pd.DataFrame, dataset_name: str) -> dict:
    measures = []
    dimensions = []
    data_dictionary = []

    for col in df.columns:
        dtype = str(df[col].dtype)
        unique_count = df[col].nunique()
        null_count = int(df[col].isnull().sum())

        # Numeric columns with high cardinality → treated as measures
        if dtype in ["int64", "float64"] and unique_count > 10:
            measures.append({
                "column": col,
                "type": dtype,
                "aggregation": "SUM"
            })
            role = "measure"

        # Everything else (categorical, low-cardinality numeric, dates) → dimension
        else:
            dim_table_name = f"dim_{col.lower().replace(' ', '_')}"
            dimensions.append({
                "column": col,
                "dimension_table": dim_table_name,
                "distinct_values": int(unique_count)
            })
            role = "dimension"

        data_dictionary.append({
            "column": col,
            "data_type": dtype,
            "role": role,
            "null_count": null_count,
            "distinct_values": int(unique_count)
        })

    fact_table_name = f"fact_{dataset_name.lower().replace('.csv', '').replace(' ', '_')}"

    return {
        "fact_table_name": fact_table_name,
        "measures": measures,
        "dimensions": dimensions,
        "data_dictionary": data_dictionary
    }

def load_data_to_sql(df: pd.DataFrame, table_name: str, engine):
    df.to_sql(table_name, engine, if_exists="replace", index=False)