"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Rows3, Columns3, Activity, Wand2, Boxes } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import { getDatasetPreview } from "@/lib/api/datasets";
import { DatasetPreview } from "@/types/dataset";
import PreviewPanel from "@/components/dataset/PreviewPanel";
import DataQualityPanel from "@/components/dataset/DataQualityPanel";
import CleaningPanel from "@/components/dataset/CleaningPanel";
import WarehousePanel from "@/components/dataset/WarehousePanel";
import { cn } from "@/utils/cn";

type Tab = "preview" | "quality" | "cleaning" | "warehouse";

export default function DatasetDetailPage() {
  const params = useParams<{ id: string }>();
  const datasetId = params.id;

  const [meta, setMeta] = useState<DatasetPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("preview");

  const tabs: { key: Tab; label: string; icon: typeof Activity }[] = [
    { key: "preview", label: "Preview", icon: Rows3 },
    { key: "quality", label: "Data Quality", icon: Activity },
    { key: "cleaning", label: "Data Cleaning", icon: Wand2 },
    { key: "warehouse", label: "Warehouse", icon: Boxes },
  ];

  const loadMeta = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await getDatasetPreview(datasetId, 1, 20);
      setMeta(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link
          href="/datasets"
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-signal mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to datasets
        </Link>

        {loading && !meta ? (
          <Skeleton className="h-8 w-64" />
        ) : meta ? (
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-xl font-semibold text-text-primary font-data">
              {meta.filename}
            </h1>
            <Badge variant="info">{meta.rows} rows</Badge>
            <Badge variant="signal">{meta.columns} columns</Badge>
          </div>
        ) : (
          <h1 className="font-display text-xl font-semibold text-text-primary">Dataset</h1>
        )}
      </div>

      {/* Stats */}
      {meta && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Rows</p>
                <p className="font-data text-2xl font-semibold text-text-primary mt-1">
                  {meta.rows.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-signal/10 p-2.5">
                <Rows3 className="h-5 w-5 text-signal" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Columns</p>
                <p className="font-data text-2xl font-semibold text-text-primary mt-1">
                  {meta.columns}
                </p>
              </div>
              <div className="rounded-full bg-positive/10 p-2.5">
                <Columns3 className="h-5 w-5 text-positive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">Source Type</p>
                <p className="font-data text-2xl font-semibold text-text-primary mt-1 capitalize">
                  {meta.filename.split(".").pop()}
                </p>
              </div>
              <div className="rounded-full bg-info/10 p-2.5">
                <Columns3 className="h-5 w-5 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <ErrorState message="Unable to load dataset." onRetry={loadMeta} />
      )}

      {!error && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors",
                  tab === key
                    ? "border-signal text-signal font-medium"
                    : "border-transparent text-text-muted hover:text-text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {tab === "preview" ? (
            <PreviewPanel datasetId={datasetId} />
          ) : tab === "quality" ? (
            <DataQualityPanel datasetId={datasetId} />
          ) : tab === "cleaning" ? (
            <CleaningPanel datasetId={datasetId} />
          ) : (
            <WarehousePanel datasetId={datasetId} />
          )}
        </>
      )}
    </div>
  );
}
