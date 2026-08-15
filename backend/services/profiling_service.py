import pandas as pd

def profile_dataset(df: pd.DataFrame) -> dict:
    numeric_df = df.select_dtypes(include="number")
    missing = df.isnull().sum().to_dict()
    duplicates = int(df.duplicated().sum())

    outlier_count = 0
    for col in numeric_df.columns:
        Q1, Q3 = numeric_df[col].quantile(0.25), numeric_df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR
        outlier_count += int(((numeric_df[col] < lower) | (numeric_df[col] > upper)).sum())

    total_cells = df.shape[0] * df.shape[1]
    missing_pct = round((sum(missing.values()) / total_cells) * 100, 2)
    duplicate_pct = round((duplicates / df.shape[0]) * 100, 2)
    health_score = max(0, min(100, round(100 - missing_pct - duplicate_pct - (outlier_count / df.shape[0] * 100), 2)))

    return {
        "rows": df.shape[0], "columns": df.shape[1],
        "missing_values": missing, "duplicate_rows": duplicates,
        "outlier_count": outlier_count, "missing_pct": missing_pct,
        "duplicate_pct": duplicate_pct, "health_score": health_score,
        "correlation": numeric_df.corr().round(2).to_dict()
    }