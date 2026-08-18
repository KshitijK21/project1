import pandas as pd


def root_cause_analysis(df: pd.DataFrame, dimension_col: str, measure_col: str) -> dict:
    grouped = df.groupby(dimension_col)[measure_col].agg(["sum", "mean", "count"]).reset_index()
    grouped = grouped.sort_values("sum", ascending=False)

    total = grouped["sum"].sum()
    grouped["contribution_pct"] = round((grouped["sum"] / total) * 100, 2) if total != 0 else 0

    top_contributor = grouped.iloc[0]

    breakdown = [
        {
            "dimension_value": row[dimension_col],
            "total": round(float(row["sum"]), 2),
            "average": round(float(row["mean"]), 2),
            "count": int(row["count"]),
            "contribution_pct": float(row["contribution_pct"])
        }
        for _, row in grouped.iterrows()
    ]

    return {
        "dimension": dimension_col,
        "measure": measure_col,
        "top_contributor": {
            "value": top_contributor[dimension_col],
            "contribution_pct": float(top_contributor["contribution_pct"])
        },
        "breakdown": breakdown
    }