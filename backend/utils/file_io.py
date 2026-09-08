import pandas as pd
import os


def save_dataframe(df: pd.DataFrame, file_path: str, ext: str):
    """Persist a DataFrame to disk based on the original file extension (.csv/.xlsx/.xls)."""
    ext = ext.lower()
    if ext == ".csv":
        df.to_csv(file_path, index=False)
    elif ext in [".xlsx", ".xls"]:
        df.to_excel(file_path, index=False)
    else:
        raise ValueError(f"Unsupported file extension: {ext}")


def load_dataframe(file_path: str) -> pd.DataFrame:
    """Load a DataFrame from a CSV or Excel file, handling mixed encodings."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".csv":
        try:
            return pd.read_csv(file_path)
        except UnicodeDecodeError:
            return pd.read_csv(file_path, encoding="latin-1")
    return pd.read_excel(file_path)
