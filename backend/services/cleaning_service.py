import pandas as pd

def generate_cleaning_suggestions(df: pd.DataFrame) -> list:
    suggestions = []

    # Missing values → suggest imputation
    missing = df.isnull().sum()
    for col, count in missing.items():
        if count > 0:
            if df[col].dtype in ["float64", "int64"]:
                method = "fill with mean/median"
            else:
                method = "fill with mode or 'Unknown'"
            suggestions.append({
                "column": col,
                "issue": "missing_values",
                "affected_rows": int(count),
                "suggestion": method
            })

    # Duplicates → suggest removal
    duplicate_count = int(df.duplicated().sum())
    if duplicate_count > 0:
        suggestions.append({
            "column": None,
            "issue": "duplicate_rows",
            "affected_rows": duplicate_count,
            "suggestion": "remove duplicate rows"
        })

    # Outliers → suggest review (using IQR, same method as profiling)
    numeric_df = df.select_dtypes(include="number")
    for col in numeric_df.columns:
        Q1 = numeric_df[col].quantile(0.25)
        Q3 = numeric_df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        outlier_count = int(((numeric_df[col] < lower) | (numeric_df[col] > upper)).sum())
        if outlier_count > 0:
            suggestions.append({
                "column": col,
                "issue": "outliers",
                "affected_rows": outlier_count,
                "suggestion": "review values manually or cap using IQR bounds"
            })

    # Invalid/mixed data types → suggest conversion
    for col in df.columns:
        if df[col].dtype == "object":
            numeric_convertible = pd.to_numeric(df[col], errors="coerce").notnull().sum()
            if numeric_convertible > 0 and numeric_convertible < len(df):
                suggestions.append({
                    "column": col,
                    "issue": "mixed_data_types",
                    "affected_rows": int(len(df) - numeric_convertible),
                    "suggestion": "standardize column to a single data type"
                })

    return suggestions