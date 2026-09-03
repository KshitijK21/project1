export interface HealthSummary {
  health_score: number;
  missing_percentage: number;
  duplicate_percentage: number;
  outliers: number;
  status: string;
}

export interface FullProfile {
  rows: number;
  columns: number;
  missing_values: Record<string, number>;
  duplicate_rows: number;
  outlier_count: number;
  missing_pct: number;
  duplicate_pct: number;
  health_score: number;
  correlation: Record<string, Record<string, number>>;
}
