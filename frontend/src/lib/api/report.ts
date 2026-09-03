import apiClient from "./client";
import { RecommendationsResponse, ExecutiveSummaryResponse } from "@/types/report";

export async function getRecommendations(datasetId: string): Promise<RecommendationsResponse> {
  const { data } = await apiClient.get<RecommendationsResponse>(`/reports/${datasetId}/recommendations`);
  return data;
}

export async function getExecutiveSummary(datasetId: string): Promise<ExecutiveSummaryResponse> {
  const { data } = await apiClient.get<ExecutiveSummaryResponse>(`/reports/${datasetId}/executive-summary`);
  return data;
}

export async function downloadPdf(datasetId: string): Promise<Blob> {
  const { data } = await apiClient.get(`/reports/${datasetId}/pdf`, { responseType: "blob" });
  return data;
}

export async function downloadPpt(datasetId: string): Promise<Blob> {
  const { data } = await apiClient.get(`/reports/${datasetId}/ppt`, { responseType: "blob" });
  return data;
}