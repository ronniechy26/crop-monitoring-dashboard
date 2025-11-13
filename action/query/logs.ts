import { headers } from "next/headers";
import { count, desc, eq, ilike, or, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ingestionLogs } from "@/lib/db/schema";
import { requirePermission } from "@/lib/permissions";
import type { IngestionLogEntry, IngestionLogsQueryResult } from "@/types/ingestion";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;
const MIN_SEARCH_LENGTH = 3;

type LogRecord = typeof ingestionLogs.$inferSelect;

function normalizeLog(record: LogRecord): IngestionLogEntry {
  const captureDate = record.captureDate ? new Date(record.captureDate) : null;
  const createdAt = record.createdAt ? new Date(record.createdAt) : null;

  return {
    id: record.id,
    userId: record.userId,
    userEmail: record.userEmail,
    userName: record.userName,
    fileName: record.fileName,
    captureDate: !captureDate || Number.isNaN(captureDate.getTime()) ? "" : captureDate.toISOString(),
    totalFeatures: record.totalFeatures,
    insertedFeatures: record.insertedFeatures,
    skippedFeatures: record.skippedFeatures,
    crops: record.crops ?? [],
    createdAt: !createdAt || Number.isNaN(createdAt.getTime()) ? "" : createdAt.toISOString(),
  };
}

async function withSession() {
  const headerEntries = Array.from((await headers()).entries());
  const requestHeaders = Object.fromEntries(headerEntries);
  return auth.api.getSession({ headers: requestHeaders });
}

export async function listIngestionLogs(limitInput?: number) {
  const safeLimit = Math.min(Math.max(Math.floor(limitInput ?? DEFAULT_LIMIT), 1), MAX_LIMIT);
  const result = await searchIngestionLogs({
    perPage: safeLimit,
    page: 1,
  });
  return result.logs;
}

interface LogsSearchOptions {
  search?: string;
  page?: number;
  perPage?: number;
}

export async function searchIngestionLogs(
  options: LogsSearchOptions = {}
): Promise<IngestionLogsQueryResult> {
  const session = await withSession();
  requirePermission(session?.user?.role ?? null, "logs", "list");

  const rawSearch = options.search?.trim() ?? "";
  const searchTerm = rawSearch.length >= MIN_SEARCH_LENGTH ? rawSearch : "";

  const requestedPage = Number.isFinite(options.page) ? Math.max(Math.floor(options.page!), 1) : 1;
  const requestedPerPage = Number.isFinite(options.perPage)
    ? Math.min(Math.max(Math.floor(options.perPage!), 5), MAX_PER_PAGE)
    : DEFAULT_PER_PAGE;

  let whereClause;
  if (searchTerm) {
    const pattern = `%${searchTerm}%`;
    const cropsMatch = sql`EXISTS (SELECT 1 FROM unnest(${ingestionLogs.crops}) AS crop WHERE crop ILIKE ${pattern})`;
    whereClause = or(
      ilike(ingestionLogs.userName, pattern),
      ilike(ingestionLogs.userEmail, pattern),
      ilike(ingestionLogs.fileName, pattern),
      cropsMatch
    );
  }

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(ingestionLogs)
    .where(whereClause ?? undefined);
  const total = Number(totalCount ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / requestedPerPage));
  const page = Math.min(requestedPage, totalPages);
  const offset = total === 0 ? 0 : (page - 1) * requestedPerPage;

  const rows = await db
    .select()
    .from(ingestionLogs)
    .where(whereClause ?? undefined)
    .orderBy(desc(ingestionLogs.createdAt))
    .limit(requestedPerPage)
    .offset(offset);

  return {
    logs: rows.map(normalizeLog),
    total,
    page,
    perPage: requestedPerPage,
  };
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
