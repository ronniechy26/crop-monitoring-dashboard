import { listIngestionLogs } from "@/action/query/logs";
import { LogsTable } from "@/components/admin/logs-table";

export async function LogsContent() {
  const logs = await listIngestionLogs();
  return <LogsTable logs={logs} />;
}
