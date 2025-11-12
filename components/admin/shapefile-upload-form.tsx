"use client";

import { CloudUpload, XCircle } from "lucide-react";
import { useActionState, useRef, useState, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import type { IngestionUploadState, UploadShapefileAction } from "@/types/ingestion";

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
        <div className="rounded-lg border border-emerald-400/50 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:text-emerald-200">
          {state.message}
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
