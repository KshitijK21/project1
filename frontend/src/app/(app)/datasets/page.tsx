"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Upload, CheckCircle2, Trash2 } from "lucide-react";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { listDatasets, deleteDataset } from "@/lib/api/datasets";
import { useToast } from "@/components/ui/Toast";
import { isAxiosError } from "axios";
import { Dataset } from "@/types/dataset";

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const data = await listDatasets();
      setDatasets(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string, filename: string) {
    if (!window.confirm(`Delete "${filename}"? This will permanently remove the dataset and all related analysis.`)) {
      return;
    }
    setDeleting(id);
    try {
      await deleteDataset(id);
      showToast(`"${filename}" deleted`, "success");
      await load();
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.detail) {
        showToast(err.response.data.detail, "error");
      } else {
        showToast("Failed to delete dataset.", "error");
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-text-primary">Datasets</h1>
          <p className="text-sm text-text-muted mt-1">
            All datasets uploaded to your workspace.
          </p>
        </div>
        <Link href="/datasets/upload">
          <Button>
            <Upload className="h-4 w-4" />
            Upload dataset
          </Button>
        </Link>
      </div>

      {error ? (
        <ErrorState message="Unable to load datasets." onRetry={load} />
      ) : loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : datasets.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No datasets found"
          description="Upload a CSV or Excel file to get started."
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
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Rows</TableHeaderCell>
              <TableHeaderCell>Columns</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datasets.map((d) => (
              <TableRow key={d.dataset_id}>
                <TableCell>
                  <Link href={`/datasets/${d.dataset_id}`} className="hover:text-signal">
                    {d.filename}
                  </Link>
                </TableCell>
                <TableCell className="font-data">{d.rows.toLocaleString()}</TableCell>
                <TableCell className="font-data">{d.columns}</TableCell>
                <TableCell>
                  <Badge variant="positive">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {d.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => handleDelete(d.dataset_id, d.filename)}
                    disabled={deleting === d.dataset_id}
                    className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-negative disabled:opacity-50"
                    title="Delete dataset"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting === d.dataset_id ? "Deleting..." : "Delete"}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}