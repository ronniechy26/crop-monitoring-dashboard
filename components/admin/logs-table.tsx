import Link from "next/link";
import { FileText, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCropDefinitionById, getCropDefinitionBySlug } from "@/lib/crops";
import type { IngestionLogEntry } from "@/types/ingestion";

interface LogsTableProps {
  logs: IngestionLogEntry[];
}

export function LogsTable({ logs }: LogsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Ingestion activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing the {Math.min(logs.length, 50)} most recent shapefile uploads.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          Logs refresh when new datasets are ingested.
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Uploaded</TableHead>
              <TableHead className="min-w-[160px]">User</TableHead>
              <TableHead>File</TableHead>
              <TableHead className="text-right">Insert / Skip</TableHead>
              <TableHead className="min-w-[120px] text-right">Capture date</TableHead>
              <TableHead>Crops</TableHead>
              <TableHead className="w-24 text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDateTime(log.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{log.userName ?? "Unknown operator"}</span>
                    <span className="text-xs text-muted-foreground">{log.userEmail ?? "No email"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{log.fileName ?? "Manual ingestion"}</span>
                    <span className="text-xs text-muted-foreground">
                      Capture date {formatDate(log.captureDate)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm">
                  <span className="font-medium text-foreground">{log.insertedFeatures}</span>
                  <span className="text-muted-foreground"> / {log.skippedFeatures}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-sm text-muted-foreground">
                  {formatDate(log.captureDate)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {log.crops.map((crop) => {
                      const definition = resolveCropDefinition(crop);
                      return (
                        <Badge
                          key={`${log.id}-${crop}`}
                          variant="secondary"
                          className={`text-xs capitalize ${getCropBadgeClass(definition?.slug)}`}
                        >
                          {definition?.label ?? "Unknown crop"}
                        </Badge>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/logs/${log.id}`}
                    className="inline-flex items-center justify-end text-sm font-semibold text-primary hover:underline"
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No ingestion activity has been recorded yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function resolveCropDefinition(value: string | number | undefined | null) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = typeof value === "number" ? String(value) : value.trim();
  const numericId = Number.parseInt(normalized, 10);
  if (Number.isFinite(numericId)) {
    const definitionById = getCropDefinitionById(numericId);
    if (definitionById) {
      return definitionById;
    }
  }

  return getCropDefinitionBySlug(normalized.toLowerCase());
}

function getCropBadgeClass(slug: string | undefined) {
  switch (slug) {
    case "corn":
      return "bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-100";
    case "onion":
      return "bg-purple-100 text-purple-900 dark:bg-purple-500/20 dark:text-purple-100";
    case "rice":
      return "bg-green-100 text-green-900 dark:bg-green-500/20 dark:text-green-100";
    default:
      return "";
  }
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
