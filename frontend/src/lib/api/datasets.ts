import apiClient from "./client";
import { Dataset } from "@/types/dataset";

export async function listDatasets(): Promise<Dataset[]> {
  const { data } = await apiClient.get<Dataset[]>("/datasets");
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