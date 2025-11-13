import { Suspense } from "react";

import { LogsContent } from "@/components/admin/logs-content";
import { LogsSkeleton } from "@/components/admin/logs-skeleton";

export const dynamic = "force-dynamic";

export default function LogsPage() {
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
        <LogsContent />
      </Suspense>
    </div>
  );
}
