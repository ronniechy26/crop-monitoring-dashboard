import { listIngestionLogs } from "@/action/query/logs";
import { LogsTable } from "@/components/admin/logs-table";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const logs = await listIngestionLogs();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Admin / Logs</p>
        <h1 className="text-3xl font-semibold tracking-tight">Ingestion audit trail</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Review when operators uploaded shapefiles, how many features were inserted, and which crops were included.
        </p>
      </div>
      <LogsTable logs={logs} />
    </div>
  );
}
