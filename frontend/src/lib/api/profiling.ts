import apiClient from "./client";
import { HealthSummary } from "@/types/profile";

export async function getDatasetHealth(datasetId: string): Promise<HealthSummary | null> {
  try {
    const { data } = await apiClient.get<HealthSummary>(`/profiling/${datasetId}/health`);
    return data;
  } catch {
    // Profiling may not have been run yet for this dataset — that's a valid state, not an error
    return null;
  }
}
