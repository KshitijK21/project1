"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Activity, Upload, MessageSquareText, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { listDatasets } from "@/lib/api/datasets";
import { getDatasetHealth } from "@/lib/api/profiling";
import { useAuth } from "@/hooks/useAuth";
import { Dataset } from "@/types/dataset";

interface DatasetWithHealth extends Dataset {
  health_score: number | null;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { email } = useAuth();
  const [datasets, setDatasets] = useState<DatasetWithHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(false);
    try {
      const list = await listDatasets();
      const withHealth = await Promise.all(
        list.map(async (d) => {
          const health = await getDatasetHealth(d.dataset_id);
          return { ...d, health_score: health?.health_score ?? null };
        })
      );
      setDatasets(withHealth);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const totalDatasets = datasets.length;
  const scoredDatasets = datasets.filter((d) => d.health_score !== null);
  const avgHealth =
    scoredDatasets.length > 0
      ? Math.round(
          scoredDatasets.reduce((sum, d) => sum + (d.health_score ?? 0), 0) /
            scoredDatasets.length
        )
      : null;
  const totalRows = datasets.reduce((sum, d) => sum + d.rows, 0);
  const recentDatasets = datasets.slice(0, 5);

  const quickActions = [
    { label: "Upload dataset", href: "/datasets/upload", icon: Upload },
    { label: "Ask a question", href: "/analytics", icon: MessageSquareText },
    { label: "View reports", href: "/reports", icon: FileText },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-text-primary">
          {getGreeting()}{email ? `, ${email.split("@")[0]}` : ""}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Here&apos;s what&apos;s happening across your data.
        </p>
      </div>

      {error ? (
        <ErrorState message="Unable to load dashboard data." onRetry={loadData} />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">Datasets</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="font-data text-2xl font-semibold text-text-primary mt-1">
                      {totalDatasets}
                    </p>
                  )}
                </div>
                <div className="rounded-full bg-signal/10 p-2.5">
                  <Database className="h-5 w-5 text-signal" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">Avg. Data Health</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="font-data text-2xl font-semibold text-text-primary mt-1">
                      {avgHealth !== null ? `${avgHealth}` : "—"}
                    </p>
                  )}
                </div>
                <div className="rounded-full bg-positive/10 p-2.5">
                  <Activity className="h-5 w-5 text-positive" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">Total Rows Analyzed</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="font-data text-2xl font-semibold text-text-primary mt-1">
                      {totalRows.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="rounded-full bg-info/10 p-2.5">
                  <FileText className="h-5 w-5 text-info" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button variant="secondary" size="sm">
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Recent Datasets */}
          <Card>
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm text-text-primary">
                Recent Datasets
              </h3>
              <Link
                href="/datasets"
                className="text-xs text-signal hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-5 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : recentDatasets.length === 0 ? (
                <EmptyState
                  icon={Database}
                  title="No datasets yet"
                  description="Upload your first dataset to get started."
                  action={
                    <Link href="/datasets/upload">
                      <Button size="sm">
                        <Upload className="h-4 w-4" />
                        Upload dataset
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="divide-y divide-border">
                  {recentDatasets.map((d) => (
                    <Link
                      key={d.dataset_id}
                      href={`/datasets/${d.dataset_id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-surface-raised transition-colors"
                    >
                      <div>
                        <p className="text-sm text-text-primary font-medium">{d.filename}</p>
                        <p className="text-xs text-text-muted font-data mt-0.5">
                          {d.rows.toLocaleString()} rows · {d.columns} columns
                        </p>
                      </div>
                      {d.health_score !== null ? (
                        <Badge
                          variant={
                            d.health_score >= 80
                              ? "positive"
                              : d.health_score >= 60
                              ? "signal"
                              : "negative"
                          }
                        >
                          Health {Math.round(d.health_score)}
                        </Badge>
                      ) : (
                        <Badge variant="default">Not profiled</Badge>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}