export interface Measure {
  column: string;
  type: string;
  aggregation: string;
}

export interface Dimension {
  column: string;
  dimension_table: string;
  distinct_values: number;
}

export interface DataDictionaryEntry {
  column: string;
  data_type: string;
  role: string;
  null_count: number;
  distinct_values: number;
}

export interface Warehouse {
  dataset_id: string;
  fact_table_name: string;
  measures: Measure[];
  dimensions: Dimension[];
  data_dictionary: DataDictionaryEntry[];
}

export interface WarehouseGenerateResponse extends Warehouse {
  warehouse_id: string;
}

export interface WarehouseData extends Warehouse {
  warehouse_id: string;
  measures: Measure[];
  dimensions: Dimension[];
}
