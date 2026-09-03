import apiClient from "./client";
import {
  ForecastResponse,
  AnomalyResponse,
  RootCauseResponse,
} from "@/types/predictive";

export async function getForecast(
  datasetId: string,
  dateColumn: string,
  measure: string,
  periods = 7
): Promise<ForecastResponse> {
  const { data } = await apiClient.post<ForecastResponse>(
    `/predictive/${datasetId}/forecast`,
    null,
    { params: { date_column: dateColumn, measure, periods } }
  );
  return data;
}

export async function getAnomalies(
  datasetId: string,
  measure: string,
  threshold = 2.0
): Promise<AnomalyResponse> {
  const { data } = await apiClient.get<AnomalyResponse>(
    `/predictive/${datasetId}/anomalies`,
    { params: { measure, threshold } }
  );
  return data;
}

export async function getRootCause(
  datasetId: string,
  dimension: string,
  measure: string
): Promise<RootCauseResponse> {
  const { data } = await apiClient.get<RootCauseResponse>(
    `/predictive/${datasetId}/root-cause`,
    { params: { dimension, measure } }
  );
  return data;
}
