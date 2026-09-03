import apiClient from "./client";
import { AuditLogsResponse } from "@/types/audit";

export async function getAuditLogs(): Promise<AuditLogsResponse> {
  const { data } = await apiClient.get<AuditLogsResponse>("/audit/logs");
  return data;
}