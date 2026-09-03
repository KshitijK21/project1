import apiClient from "./client";
import { CleaningSuggestion, ApplyCleaningResponse } from "@/types/cleaning";

export async function getCleaningSuggestions(datasetId: string): Promise<{
  dataset_id: string;
  total_suggestions: number;
  suggestions: CleaningSuggestion[];
}> {
  const { data } = await apiClient.post(`/cleaning/${datasetId}/suggestions`);
  return data;
}

export async function applyCleaning(
  datasetId: string,
  suggestionIds: string[]
): Promise<ApplyCleaningResponse> {
  const { data } = await apiClient.post<ApplyCleaningResponse>(`/cleaning/${datasetId}/apply`, {
    suggestion_ids: suggestionIds,
  });
  return data;
}
