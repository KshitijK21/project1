"use client";

import { useEffect, useState } from "react";
import { Shield, User, Clock, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { getAuditLogs } from "@/lib/api/audit";
import { AuditLogEntry } from "@/types/audit";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAuditLogs();
        setLogs(res.logs);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <ErrorState message="Unable to load audit logs. Admin access required." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-signal" />
        <div>
          <h1 className="font-display text-xl font-semibold text-text-primary">Audit Log</h1>
          <p className="text-sm text-text-muted mt-1">Admin only. Recent activity across the platform.</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No audit logs"
          description="No activity has been recorded yet."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity ({logs.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-data">
                <thead className="bg-surface-raised">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wide text-text-muted">User</th>
                    <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wide text-text-muted">Action</th>
                    <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wide text-text-muted">Endpoint</th>
                    <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wide text-text-muted">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log, i) => (
                    <tr key={i} className="hover:bg-surface-raised/50 transition-colors">
                      <td className="px-4 py-2.5 text-text-primary">
                        <span className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-text-muted" />
                          {log.user_email}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="info">{log.action}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary font-data text-[11px]">{log.endpoint}</td>
                      <td className="px-4 py-2.5 text-text-muted flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {formatDate(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}