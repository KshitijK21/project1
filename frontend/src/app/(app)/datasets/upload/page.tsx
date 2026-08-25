"use client";

import { useCallback, useState, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { uploadDataset } from "@/lib/api/datasets";
import { useToast } from "@/components/ui/Toast";
import { isAxiosError } from "axios";
import { cn } from "@/utils/cn";

const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

export default function UploadDatasetPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function validateAndSetFile(selected: File | undefined) {
    if (!selected) return;
    const ext = "." + selected.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError("Only CSV and Excel files (.csv, .xlsx, .xls) are supported.");
      return;
    }
    setError("");
    setFile(selected);
  }

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  }, []);

  function onFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    validateAndSetFile(e.target.files?.[0]);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const dataset = await uploadDataset(file, setProgress);
      showToast(`"${dataset.filename}" uploaded successfully`, "success");
      router.push(`/datasets/${dataset.dataset_id}`);
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Upload failed. Please try again.");
      }
      setUploading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-text-primary">Upload Dataset</h1>
        <p className="text-sm text-text-muted mt-1">
          Upload a CSV or Excel file to begin analysis.
        </p>
      </div>

      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "border-2 border-dashed rounded-lg py-16 flex flex-col items-center justify-center gap-3 transition-colors",
            dragOver ? "border-signal bg-signal-soft" : "border-border bg-surface"
          )}
        >
          <UploadCloud className={cn("h-8 w-8", dragOver ? "text-signal" : "text-text-muted")} />
          <div className="text-center">
            <p className="text-sm text-text-primary">
              Drag & drop your file here, or{" "}
              <label className="text-signal hover:underline cursor-pointer">
                browse
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={onFileInputChange}
                />
              </label>
            </p>
            <p className="text-xs text-text-muted mt-1">CSV, XLSX, or XLS — up to a reasonable size</p>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-lg bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-signal/10 p-2">
                <FileSpreadsheet className="h-5 w-5 text-signal" />
              </div>
              <div>
                <p className="text-sm text-text-primary font-medium">{file.name}</p>
                <p className="text-xs text-text-muted font-data">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            {!uploading && (
              <button
                onClick={() => setFile(null)}
                className="text-text-muted hover:text-negative"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {uploading && (
            <div>
              <div className="h-1.5 w-full rounded-full bg-surface-raised overflow-hidden">
                <div
                  className="h-full bg-signal transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-text-muted font-data mt-1.5">{progress}% uploaded</p>
            </div>
          )}

          {!uploading && (
            <Button onClick={handleUpload} className="w-full">
              <CheckCircle2 className="h-4 w-4" />
              Confirm & Upload
            </Button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-negative bg-negative/10 border border-negative/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}