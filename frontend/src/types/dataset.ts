export interface Dataset {
  dataset_id: string;
  filename: string;
  rows: number;
  columns: number;
  status: string;
}

export interface ColumnInfo {
  name: string;
  dtype: string;
  nulls: number;
  uniques: number;
}

export interface DatasetPreview {
  dataset_id: string;
  filename: string;
  rows: number;
  columns: number;
  column_info: ColumnInfo[];
  preview: Record<string, unknown>[];
  page: number;
  per_page: number;
  total_rows: number;
  total_pages: number;
}