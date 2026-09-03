import apiClient from "./client";
import {
  DashboardSummary,
  DashboardKpis,
  ChartDataResponse,
  DrilldownResponse,
} from "@/types/dashboard";

export async function getDashboardSummary(datasetId: string): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>(`/dashboard/${datasetId}/summary`);
  return data;
}

export async function getDashboardKpis(datasetId: string): Promise<DashboardKpis> {
  const { data } = await apiClient.get<DashboardKpis>(`/dashboard/${datasetId}/kpis`);
  return data;
}

export async function getChartData(
  datasetId: string,
  dimension: string,
  measure: string,
  aggregation = "SUM"
): Promise<ChartDataResponse> {
  const { data } = await apiClient.get<ChartDataResponse>(
    `/dashboard/${datasetId}/chart`,
    { params: { dimension, measure, aggregation } }
  );
  return data;
}

export async function getDrilldown(
  datasetId: string,
  dimension: string,
  value: string
): Promise<DrilldownResponse> {
  const { data } = await apiClient.get<DrilldownResponse>(
    `/dashboard/${datasetId}/drilldown`,
    { params: { dimension, value } }
  );
  return data;
}
