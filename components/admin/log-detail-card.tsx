import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IngestionLogEntry } from "@/types/ingestion";

interface LogDetailCardProps {
  log: IngestionLogEntry;
}

export function LogDetailCard({ log }: LogDetailCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/logs"
          className="inline-flex items-center rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-muted/60"
        >
          <ArrowLeft className="mr-1.5 h-3 w-3" />
          Back to logs
        </Link>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Log #{log.id}</p>
          <h1 className="text-2xl font-semibold">Shapefile ingestion detail</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Operator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="User ID" value={log.userId} />
            <InfoRow label="Name" value={log.userName ?? "Unknown"} />
            <InfoRow label="Email" value={log.userEmail ?? "—"} />
            <InfoRow label="Uploaded" value={formatDateTime(log.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dataset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow label="File name" value={log.fileName ?? "Manual ingestion"} />
            <InfoRow label="Capture date" value={formatDate(log.captureDate)} />
            <InfoRow label="Inserted features" value={log.insertedFeatures.toLocaleString()} />
            <InfoRow label="Skipped features" value={log.skippedFeatures.toLocaleString()} />
            <InfoRow label="Total features" value={log.totalFeatures.toLocaleString()} />
            <div>
              <p className="text-xs uppercase text-muted-foreground">Crops</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {log.crops.length > 0 ? (
                  log.crops.map((crop) => (
                    <Badge key={crop} variant="secondary" className="text-xs capitalize">
                      {crop}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No crop metadata</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}

function formatDateTime(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
