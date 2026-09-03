export interface Kpi {
  measure: string;
  total: number | null;
  average: number | null;
  minimum: number | null;
  maximum: number | null;
  count: number | null;
}

export interface ChartDatum {
  label: string;
  value: number;
}

export interface SummaryChart {
  dimension: string;
  measure: string;
  data: ChartDatum[];
}

export interface DashboardSummary {
  dataset_id: string;
  kpis: Kpi[];
  charts: SummaryChart[];
}

export interface DashboardKpis {
  dataset_id: string;
  kpis: Kpi[];
}

export interface ChartDataResponse {
  dataset_id: string;
  dimension: string;
  measure: string;
  aggregation: string;
  data: ChartDatum[];
}

export interface DrilldownRow {
  [key: string]: unknown;
}

export interface DrilldownResponse {
  dataset_id: string;
  dimension: string;
  filtered_value: string;
  row_count: number;
  rows: DrilldownRow[];
}
