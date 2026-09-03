import apiClient from "./client";
import { AiQueryResult } from "@/types/ai";

export async function queryDataset(
  datasetId: string,
  question: string
): Promise<AiQueryResult> {
  const { data } = await apiClient.post<AiQueryResult>(
    `/ai/${datasetId}/query`,
    null,
    { params: { question } }
  );
  return data;
}
