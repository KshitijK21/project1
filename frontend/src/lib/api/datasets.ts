import apiClient from "./client";
import { Dataset, DatasetPreview } from "@/types/dataset";

export async function listDatasets(): Promise<Dataset[]> {
  const { data } = await apiClient.get<Dataset[]>("/datasets");
  return data;
}

export async function getDatasetPreview(
  datasetId: string,
  page = 1,
  perPage = 20
): Promise<DatasetPreview> {
  const { data } = await apiClient.get<DatasetPreview>(
    `/datasets/${datasetId}/preview`,
    { params: { page, per_page: perPage } }
  );
  return data;
}

export async function uploadDataset(
  file: File,
  onProgress?: (percent: number) => void
): Promise<Dataset> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<Dataset>("/datasets/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data;
}