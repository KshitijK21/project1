export interface AuditLogEntry {
  user_email: string;
  action: string;
  endpoint: string;
  timestamp: string;
}

export interface AuditLogsResponse {
  count: number;
  logs: AuditLogEntry[];
}