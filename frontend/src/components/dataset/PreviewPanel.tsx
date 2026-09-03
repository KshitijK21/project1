"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import { getDatasetPreview } from "@/lib/api/datasets";
import { DatasetPreview, ColumnInfo } from "@/types/dataset";

const PER_PAGE = 20;

export default function PreviewPanel({ datasetId }: { datasetId: string }) {
  const [data, setData] = useState<DatasetPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(false);
      try {
        const result = await getDatasetPreview(datasetId, targetPage, PER_PAGE);
        setData(result);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [datasetId]
  );

  useEffect(() => {
    load(page);
  }, [page, load]);

  if (error) {
    return <ErrorState message="Unable to load dataset preview." onRetry={() => load(page)} />;
  }

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!data) return null;

  const rowKeys = data.preview.length > 0 ? Object.keys(data.preview[0]) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sample Rows</CardTitle>
          <p className="text-xs text-text-muted font-data">
            Page {data.page} of {data.total_pages}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-5 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : data.preview.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">No rows to display.</div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="w-14">#</TableHeaderCell>
                  {rowKeys.map((key) => (
                    <TableHeaderCell key={key} className="max-w-[200px] truncate">
                      {key}
                    </TableHeaderCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.preview.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-text-muted font-data">
                      {(data.page - 1) * PER_PAGE + idx + 1}
                    </TableCell>
                    {rowKeys.map((key) => (
                      <TableCell key={key} className="max-w-[200px] truncate font-data text-xs">
                        {String(row[key] ?? "—")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {data.total_pages > 1 && !loading && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted font-data">
            Showing {(data.page - 1) * PER_PAGE + 1}–
            {Math.min(data.page * PER_PAGE, data.total_rows)} of {data.total_rows}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-xs text-text-muted font-data">Page {data.page}</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={data.page >= data.total_pages}
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Column Information</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Column</TableHeaderCell>
                <TableHeaderCell>Data Type</TableHeaderCell>
                <TableHeaderCell>Missing Values</TableHeaderCell>
                <TableHeaderCell>Unique Values</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.column_info.map((col: ColumnInfo) => (
                <TableRow key={col.name}>
                  <TableCell className="font-medium">{col.name}</TableCell>
                  <TableCell>
                    <Badge variant="info">{col.dtype}</Badge>
                  </TableCell>
                  <TableCell className={col.nulls > 0 ? "text-negative" : "text-positive"}>
                    {col.nulls.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-data">{col.uniques.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
