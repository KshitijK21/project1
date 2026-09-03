export interface CleaningSuggestion {
  id: string;
  column: string | null;
  issue: string;
  affected_rows: number;
  suggestion: string;
}

export interface ApplyCleaningResponse {
  dataset_id: string;
  operations_applied: string[];
  rows_before: number;
  rows_after: number;
  rows_removed: number;
}

export interface CleaningIssuesResponse {
  dataset_id: string;
  total_suggestions: number;
  suggestions: CleaningSuggestion[];
}
