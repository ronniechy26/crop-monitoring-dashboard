"use client";

import { CloudUpload, XCircle } from "lucide-react";
import { useActionState, useEffect, useRef, useState, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import type {
  DataPipelineProgressEvent,
  IngestionUploadState,
  UploadShapefileAction,
} from "@/types/ingestion";

const initialState: IngestionUploadState = {
  status: "idle",
  message: "",
  inserted: 0,
  skipped: 0,
};

type ShapefileUploadFormProps = {
  action: UploadShapefileAction;
  maxUploadMb?: number;
};

export function ShapefileUploadForm({ action, maxUploadMb }: ShapefileUploadFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [fileName, setFileName] = useState("");
  const [progressEvents, setProgressEvents] = useState<DataPipelineProgressEvent[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : "");
  }

  function handleRemoveFile() {
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  useEffect(() => {
    const runId = state.workflowRunId?.trim();
    if (!runId) {
      setProgressEvents([]);
      setStreamError(null);
      return undefined;
    }

    const controller = new AbortController();

    setProgressEvents([]);
    setStreamError(null);

    async function readStream(runIdParam: string) {
      try {
        const response = await fetch(`/api/workflows/${runIdParam}/stream`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          throw new Error("Unable to open workflow progress stream.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
              continue;
            }
            try {
              const event = JSON.parse(trimmed) as DataPipelineProgressEvent;
              setProgressEvents([event]);
            } catch {
              continue;
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        setStreamError(
          error instanceof Error ? error.message : "Failed to read workflow progress."
        );
      }
    }

    readStream(runId);

    return () => {
      controller.abort();
    };
  }, [state.workflowRunId]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="captureDate">
          Capture date
        </label>
        <input
          id="captureDate"
          name="captureDate"
          type="date"
          required
          className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="dataset">
          Dataset (.zip shapefile or GeoJSON)
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={fileInputRef}
            id="dataset"
            name="dataset"
            required
            type="file"
            accept=".zip,.geojson,.json"
            onChange={handleFileChange}
            className="w-full cursor-pointer rounded-lg border border-border/60 bg-background px-3 py-2 text-sm file:me-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:text-primary"
          />
          {fileName && (
            <button
              type="button"
              onClick={handleRemoveFile}
              className="inline-flex items-center justify-center rounded-lg border border-border/60 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted/60"
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Remove file
            </button>
          )}
        </div>
        {fileName && (
          <p className="text-xs text-foreground">
            Selected: <span className="font-medium">{fileName}</span>
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Upload zipped shapefile bundles (SHP/DBF/SHX) or GeoJSON exports{" "}
          {maxUploadMb ? `up to ${maxUploadMb} MB` : "within the configured size limit"}. Each feature must have a `dn` or
          `crop` property indicating the crop.
        </p>
      </div>

      <SubmitButton pending={isPending} />

      {state.status === "success" && (
        <div className="space-y-2 rounded-lg border border-emerald-400/50 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:text-emerald-200">
          <p>{state.message}</p>
          {state.datasetName && (
            <p className="text-xs text-emerald-900/80 dark:text-emerald-100/80">
              Dataset: <span className="font-semibold">{state.datasetName}</span>
            </p>
          )}
          {state.workflowRunId && (
            <p className="text-xs text-emerald-900/80 dark:text-emerald-100/80">
              Workflow run ID: <span className="font-mono text-xs">{state.workflowRunId}</span>
            </p>
          )}
          {state.workflowRunId && (progressEvents.length > 0 || streamError) && (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-100/50 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-400/50 dark:bg-emerald-500/20">
              <p className="mb-1 font-semibold uppercase tracking-wide text-emerald-900/80 dark:text-emerald-50">
                Workflow progress
              </p>
              {progressEvents.length === 0 ? (
                <p className="text-emerald-900/80 dark:text-emerald-50">
                  Listening for updates from the ingestion workflow…
                </p>
              ) : (
                <ul className="space-y-1 text-emerald-900/80 dark:text-emerald-50">
                  {progressEvents.map((event, index) => (
                    <li key={`${event.status}-${index}`}>
                      <span>
                        {event.message}
                        {typeof event.inserted === "number" && typeof event.totalFeatures === "number" && (
                          <> ({event.inserted}/{event.totalFeatures})</>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {streamError && (
                <p className="mt-2 text-[11px] font-medium text-red-900 dark:text-red-200">
                  {streamError}
                </p>
              )}
            </div>
          )}
        </div>
      )}
      {state.status === "error" && (
        <div className="rounded-lg border border-destructive/60 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </div>
      )}
    </form>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <CloudUpload className="mr-2 h-4 w-4" />
      {pending ? "Uploading…" : "Upload dataset"}
    </Button>
  );
}
