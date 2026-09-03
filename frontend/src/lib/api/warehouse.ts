import apiClient from "./client";
import {
  Warehouse,
  WarehouseGenerateResponse,
  WarehouseData,
} from "@/types/warehouse";

export async function generateWarehouse(datasetId: string): Promise<WarehouseGenerateResponse> {
  const { data } = await apiClient.post<WarehouseGenerateResponse>(
    `/warehouse/${datasetId}/generate`
  );
  return data;
}

export async function getWarehouse(datasetId: string): Promise<WarehouseData> {
  const { data } = await apiClient.get<WarehouseData>(`/warehouse/${datasetId}`);
  return data;
}

export type { Warehouse };
