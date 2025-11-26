import { Suspense } from "react";

import { LogsContent } from "@/components/admin/logs-content";
import { LogsSkeleton } from "@/components/admin/logs-skeleton";

export const dynamic = "force-dynamic";

interface LogsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Admin / Logs</p>
        <h1 className="text-3xl font-semibold tracking-tight">Ingestion audit trail</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Review when operators uploaded shapefiles, how many features were inserted, and which crops were included.
        </p>
      </div>
      <Suspense fallback={<LogsSkeleton />}>
        <LogsContent searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
