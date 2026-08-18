import pandas as pd
import numpy as np


def detect_anomalies(df: pd.DataFrame, measure_col: str, threshold: float = 2.0) -> list:
    values = df[measure_col].dropna()
    mean = values.mean()
    std = values.std()

    if std == 0:
        return []

    anomalies = []
    for idx, val in values.items():
        z_score = (val - mean) / std
        if abs(z_score) > threshold:
            row = df.loc[idx].to_dict()
            row["z_score"] = round(float(z_score), 2)
            row["value"] = float(val)
            anomalies.append(row)

    return anomalies