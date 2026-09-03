"use client";

import { useEffect, useState } from "react";
import { FileText, Presentation, Sparkles, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { listDatasets } from "@/lib/api/datasets";
import { getRecommendations, getExecutiveSummary, downloadPdf, downloadPpt } from "@/lib/api/report";

export default function ReportsPage() {
  const [datasets, setDatasets] = useState<{ dataset_id: string; filename: string }[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [error, setError] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pptBusy, setPptBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await listDatasets();
        setDatasets(list);
      } catch {
        setError(true);
      } finally {
        setLoadingDatasets(false);
      }
    })();
  }, []);

  async function selectDataset(id: string) {
    setSelectedId(id);
    setLoading(true);
    setRecommendations([]);
    setExecutiveSummary("");
    try {
      const [recs, summary] = await Promise.all([
        getRecommendations(id),
        getExecutiveSummary(id),
      ]);
      setRecommendations(recs.recommendations);
      setExecutiveSummary(summary.executive_summary);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(fmt: "pdf" | "ppt") {
    if (!selectedId) return;
    const setBusy = fmt === "pdf" ? setPdfBusy : setPptBusy;
    setBusy(true);
    try {
      const blob = fmt === "pdf" ? await downloadPdf(selectedId) : await downloadPpt(selectedId);
      const ext = fmt === "pdf" ? "pdf" : "pptx";
      const filename = `report.${ext}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail — user will see no download
    } finally {
      setBusy(false);
    }
  }

  if (loadingDatasets) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <ErrorState message="Unable to load report data." />
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <EmptyState
          icon={FileText}
          title="No datasets available"
          description="Upload a dataset and run profiling + warehouse to generate reports."
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-text-primary">Report</h1>
          <p className="text-sm text-text-muted mt-1">Executive summary, recommendations, and exportable reports.</p>
        </div>
        {selectedId && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => handleDownload("pdf")} loading={pdfBusy} disabled={loading || pdfBusy}>
              {!pdfBusy && <FileText className="h-4 w-4" />}
              PDF
            </Button>
            <Button variant="secondary" onClick={() => handleDownload("ppt")} loading={pptBusy} disabled={loading || pptBusy}>
              {!pptBusy && <Presentation className="h-4 w-4" />}
              PPT
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-md">
        <Select
          label="Dataset"
          value={selectedId}
          onChange={(e) => selectDataset(e.target.value)}
          options={datasets.map((d) => ({ value: d.dataset_id, label: d.filename }))}
        />
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!loading && selectedId && (
        <>
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-signal" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {executiveSummary ? (
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
                  {executiveSummary}
                </p>
              ) : (
                <p className="text-sm text-text-muted italic">No summary generated.</p>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-signal" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-signal flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-muted italic">No recommendations generated.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!loading && !selectedId && (
        <EmptyState
          icon={FileText}
          title="Select a dataset"
          description="Choose a dataset above to view its report."
        />
      )}
    </div>
  );
}