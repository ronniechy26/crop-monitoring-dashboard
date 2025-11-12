import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ingestionLogs } from "@/lib/db/schema";
import { requirePermission } from "@/lib/permissions";
import type { IngestionLogEntry } from "@/types/ingestion";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

type LogRecord = typeof ingestionLogs.$inferSelect;

function normalizeLog(record: LogRecord): IngestionLogEntry {
  const captureDate =
    record.captureDate instanceof Date ? record.captureDate : new Date(record.captureDate ?? "");
  const createdAt =
    record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt ?? "");

  return {
    id: record.id,
    userId: record.userId,
    userEmail: record.userEmail,
    userName: record.userName,
    fileName: record.fileName,
    captureDate: Number.isNaN(captureDate.getTime()) ? "" : captureDate.toISOString(),
    totalFeatures: record.totalFeatures,
    insertedFeatures: record.insertedFeatures,
    skippedFeatures: record.skippedFeatures,
    crops: record.crops ?? [],
    createdAt: Number.isNaN(createdAt.getTime()) ? "" : createdAt.toISOString(),
  };
}

async function withSession() {
  const headerEntries = Array.from((await headers()).entries());
  const requestHeaders = Object.fromEntries(headerEntries);
  return auth.api.getSession({ headers: requestHeaders });
}

export async function listIngestionLogs(limitInput?: number) {
  const session = await withSession();
  requirePermission(session?.user?.role ?? null, "logs", "list");

  const rawLimit = limitInput ?? DEFAULT_LIMIT;
  const safeLimit = Math.min(Math.max(Math.floor(rawLimit), 1), MAX_LIMIT);

  const rows = await db
    .select()
    .from(ingestionLogs)
    .orderBy(desc(ingestionLogs.createdAt))
    .limit(safeLimit);

  return rows.map(normalizeLog);
}

export async function getIngestionLogById(idInput: number) {
  const session = await withSession();
  requirePermission(session?.user?.role ?? null, "logs", "read");

  const id = Math.floor(idInput);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Invalid log identifier.");
  }

  const [record] = await db.select().from(ingestionLogs).where(eq(ingestionLogs.id, id)).limit(1);
  if (!record) {
    const error = new Error("Log entry not found.");
    (error as Error & { status?: number }).status = 404;
    throw error;
  }

  return normalizeLog(record);
}
