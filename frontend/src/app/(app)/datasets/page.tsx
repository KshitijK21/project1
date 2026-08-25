"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Upload, CheckCircle2 } from "lucide-react";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { listDatasets } from "@/lib/api/datasets";
import { Dataset } from "@/types/dataset";

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
            </TableRow>
          </TableHead>
          <TableBody>
            {datasets.map((d) => (
              <TableRow key={d.dataset_id} className="cursor-pointer">
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}