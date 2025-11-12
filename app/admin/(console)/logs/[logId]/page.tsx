import { notFound } from "next/navigation";

import { getIngestionLogById } from "@/action/query/logs";
import { LogDetailCard } from "@/components/admin/log-detail-card";

export default async function LogDetailPage(props: { params: Promise<{ logId: string }> }) {
  const { logId } = await props.params;
  const id = Number(logId);
  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  let log;
  try {
    log = await getIngestionLogById(id);
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      notFound();
    }
    throw error;
  }

  return <LogDetailCard log={log} />;
}
