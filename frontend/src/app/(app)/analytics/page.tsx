"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { Send, Bot, User, Sparkles, Code2, MessageSquareText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Select from "@/components/ui/Select";
import { listDatasets } from "@/lib/api/datasets";
import { getWarehouse } from "@/lib/api/warehouse";
import { queryDataset } from "@/lib/api/ai";
import { AiQueryResult } from "@/types/ai";

interface Entry {
  id: string;
  question?: string;
  loading?: boolean;
  error?: string;
  result?: AiQueryResult;
}

const SUGGESTIONS = [
  "Show total by each dimension",
  "What is the average of the main measures?",
  "Which dimension value contributes the most?",
];

export default function AnalyticsPage() {
  const [datasets, setDatasets] = useState<{ dataset_id: string; filename: string }[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [columnsReady, setColumnsReady] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries]);

  async function selectDataset(id: string) {
    setSelectedId(id);
    setEntries([]);
    setColumnsReady(false);
    try {
      await getWarehouse(id);
      setColumnsReady(true);
    } catch {
      setColumnsReady(false);
    }
  }

  async function ask(question: string) {
    const q = question.trim();
    if (!q || !selectedId || busy) return;
    setBusy(true);
    setInput("");
    const userEntry: Entry = { id: crypto.randomUUID(), question: q };
    const loadEntry: Entry = { id: crypto.randomUUID(), loading: true };
    setEntries((prev) => [...prev, userEntry, loadEntry]);
    try {
      const result = await queryDataset(selectedId, q);
      setEntries((prev) => prev.map((e) => (e.id === loadEntry.id ? { ...e, loading: false, result } : e)));
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Query failed. Ensure the warehouse was generated first.";
      setEntries((prev) => prev.map((e) => (e.id === loadEntry.id ? { ...e, loading: false, error: detail } : e)));
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    ask(input);
  }

  if (loadingDatasets) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ErrorState message="Unable to load datasets." />
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <EmptyState
          icon={MessageSquareText}
          title="No datasets available"
          description="Upload a dataset and generate its warehouse to start asking questions."
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4 flex flex-col h-[calc(100vh-4rem)]">
      <div>
        <h1 className="font-display text-xl font-semibold text-text-primary">Analytics</h1>
        <p className="text-sm text-text-muted mt-1">Ask questions about your data in plain English.</p>
      </div>

      <div className="max-w-md">
        <Select
          label="Dataset"
          value={selectedId}
          onChange={(e) => selectDataset(e.target.value)}
          options={datasets.map((d) => ({ value: d.dataset_id, label: d.filename }))}
        />
      </div>

      <Card className="flex flex-col flex-1 min-h-0">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-xs text-text-muted flex items-center gap-1.5">
            <Bot className="h-4 w-4 text-signal" />
            AI Assistant
          </span>
          {selectedId && !columnsReady && (
            <Badge variant="signal">Generate warehouse to enable queries</Badge>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {entries.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 my-auto py-16 text-center">
              <div className="rounded-full bg-surface-raised p-4 border border-border">
                <Sparkles className="h-6 w-6 text-signal" />
              </div>
              <p className="text-sm text-text-muted max-w-xs">
                Select a dataset with a generated warehouse, then ask things like:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    disabled={!selectedId || !columnsReady}
                    onClick={() => ask(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface-raised text-text-secondary hover:text-signal hover:border-signal-dim disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {entries.map((entry) => (
            <div key={entry.id}>
              {entry.question && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-lg rounded-br-none bg-signal/15 border border-signal/25 px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-signal mb-1">
                      <User className="h-3 w-3" /> You
                    </div>
                    <p className="text-sm text-text-primary">{entry.question}</p>
                  </div>
                </div>
              )}

              {entry.loading && (
                <div className="flex justify-start mt-3">
                  <div className="max-w-[85%] rounded-lg rounded-bl-none bg-surface-raised border border-border px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted mb-2">
                      <Bot className="h-3 w-3" /> Thinking...
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-signal/50 animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-signal/50 animate-bounce [animation-delay:100ms]" />
                      <span className="h-2 w-2 rounded-full bg-signal/50 animate-bounce [animation-delay:200ms]" />
                    </div>
                  </div>
                </div>
              )}

              {entry.error && (
                <div className="flex justify-start mt-3">
                  <div className="max-w-[85%] rounded-lg rounded-bl-none bg-negative/10 border border-negative/30 px-4 py-3">
                    <p className="text-sm text-negative">{entry.error}</p>
                  </div>
                </div>
              )}

              {entry.result && (
                <div className="flex justify-start mt-3">
                  <div className="w-full max-w-[95%] rounded-lg rounded-bl-none overflow-hidden border border-border">
                    <div className="bg-surface-raised px-4 py-2 flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5 text-signal" />
                      <span className="text-[10px] text-text-muted">Assistant</span>
                    </div>
                    <div className="p-4 bg-surface space-y-4">
                      <p className="text-sm text-text-primary">{entry.result.explanation}</p>

                      <div className="rounded-md border border-border bg-bg overflow-hidden">
                        <div className="px-3 py-2 bg-surface-raised flex items-center gap-1.5 text-[10px] text-text-muted">
                          <Code2 className="h-3 w-3" /> Generated SQL
                        </div>
                        <pre className="px-3 py-2 text-xs font-data text-positive overflow-x-auto text-[11px]">
                          {entry.result.generated_sql}
                        </pre>
                      </div>

                      {entry.result.result.length > 0 ? (
                        <div className="overflow-x-auto rounded-md border border-border">
                          <table className="w-full text-xs font-data">
                            <thead className="bg-surface-raised">
                              <tr>
                                {Object.keys(entry.result.result[0]).map((k) => (
                                  <th key={k} className="px-3 py-2 text-left text-[10px] uppercase tracking-wide text-text-muted">
                                    {k}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {entry.result.result.slice(0, 50).map((row, i) => (
                                <tr key={i}>
                                  {Object.keys(row).map((k) => (
                                    <td key={k} className="px-3 py-2 text-text-primary">
                                      {String(row[k] ?? "—")}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-text-muted">No results returned.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t border-border flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedId && columnsReady
                ? "Ask a question about this dataset..."
                : "Select a dataset with a warehouse first"
            }
            disabled={!selectedId || !columnsReady || busy}
            className="flex-1 h-10 px-3 text-sm rounded-md bg-bg border border-border-strong focus:outline-none focus:border-signal disabled:opacity-50"
          />
          <Button type="submit" disabled={!input.trim() || !selectedId || !columnsReady || busy} loading={busy}>
            {!busy && <Send className="h-4 w-4" />}
            Ask
          </Button>
        </form>
      </Card>
    </div>
  );
}
