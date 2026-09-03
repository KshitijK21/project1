export interface ForecastPoint {
  date: string;
  predicted_value?: number;
}

export interface HistoricalPoint {
  date: string;
  value: number;
}

export interface ForecastResponse {
  measure: string;
  trend: string;
  historical: HistoricalPoint[];
  forecast: ForecastPoint[];
}

export interface AnomalyRow {
  z_score: number;
  value: number;
  [key: string]: unknown;
}

export interface AnomalyResponse {
  measure: string;
  threshold: number;
  anomaly_count: number;
  anomalies: AnomalyRow[];
}

export interface ContributionItem {
  dimension_value: string;
  total: number;
  average: number;
  count: number;
  contribution_pct: number;
}

export interface RootCauseResponse {
  dimension: string;
  measure: string;
  top_contributor: {
    value: string;
    contribution_pct: number;
  };
  breakdown: ContributionItem[];
}
