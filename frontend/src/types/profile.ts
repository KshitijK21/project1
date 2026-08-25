export interface HealthSummary {
  health_score: number;
  missing_percentage: number;
  duplicate_percentage: number;
  outliers: number;
  status: string;
}
