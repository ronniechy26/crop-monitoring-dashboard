import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import type { AdminUser, AdminUserListParams, AdminUserListResult } from "@/types/user";

const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 50;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_SEARCH_LENGTH = 3;

type ListUsersResponse = Awaited<ReturnType<typeof auth.api.listUsers>>;

function normalizeUser(user: ListUsersResponse["users"][number]): AdminUser {
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    image: user.image ?? null,
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
    role: Array.isArray(user.role) ? user.role.join(", ") : user.role ?? null,
    banned: Boolean(user.banned),
    banReason: user.banReason ?? null,
    banExpiresAt: user.banExpires ?? null,
  };
}

function buildSearchQuery(search?: string) {
  if (!search || search.length < MIN_SEARCH_LENGTH) {
    return {};
  }
  const searchField = search.includes("@") ? "email" : "name";
  return {
    searchValue: search,
    searchField,
    searchOperator: "contains" as const,
  };
}

export async function getUsers(params: AdminUserListParams = {}): Promise<AdminUserListResult> {
  const rawSearch = params.search?.trim() ?? "";
  const searchValue = rawSearch.length >= MIN_SEARCH_LENGTH ? rawSearch : undefined;
  const rawPage = Number(params.page ?? 1);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const rawPerPage = Number(params.perPage ?? DEFAULT_PER_PAGE);
  const perPageCandidate =
    Number.isFinite(rawPerPage) && rawPerPage > 0 ? rawPerPage : DEFAULT_PER_PAGE;
  const perPage = Math.min(Math.max(Math.floor(perPageCandidate), 1), MAX_PER_PAGE);
  const offset = (page - 1) * perPage;

  const searchQuery = buildSearchQuery(searchValue);

  const baseQuery = {
    limit: perPage,
    offset,
    sortBy: "createdAt",
    sortDirection: "desc" as const,
    ...searchQuery,
  };

  const recentSinceIso = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();

  const headerEntries = Array.from((await headers()).entries());
  const requestHeaders = Object.fromEntries(headerEntries);

  const listUsers = (query: Record<string, unknown>) =>
    auth.api.listUsers({
      query,
      headers: requestHeaders,
    });

  try {
    const [primary, verified, recent, lastUpdated] = await Promise.all([
      listUsers(baseQuery),
      listUsers({
        limit: 1,
        offset: 0,
        filterField: "emailVerified",
        filterOperator: "eq",
        filterValue: true,
        ...searchQuery,
      }),
      listUsers({
        limit: 1,
        offset: 0,
        filterField: "createdAt",
        filterOperator: "gte",
        filterValue: recentSinceIso,
        ...searchQuery,
      }),
      listUsers({
        limit: 1,
        offset: 0,
        sortBy: "updatedAt",
        sortDirection: "desc",
        ...searchQuery,
      }),
    ]);

    const users = (primary.users ?? []).map(normalizeUser);
    const total = primary.total ?? users.length;
    const verifiedTotal = verified.total ?? 0;
    const recentSignups = recent.total ?? 0;
    const lastUpdatedUser = lastUpdated.users?.[0]
      ? normalizeUser(lastUpdated.users[0])
      : null;

    return {
      users,
      total,
      verifiedTotal,
      recentSignups,
      lastUpdatedUser,
      page,
      perPage,
    };
  } catch (error) {
    if (isPermissionError(error)) {
      return {
        users: [],
        total: 0,
        verifiedTotal: 0,
        recentSignups: 0,
        lastUpdatedUser: null,
        page,
        perPage,
      };
    }
    throw error;
  }
}

function isPermissionError(error: unknown) {
  if (!error) return false;
  const status = (error as { status?: number }).status;
  if (status === 403) {
    return true;
  }
  const code = (error as { code?: string }).code?.toLowerCase();
  if (code === "forbidden") {
    return true;
  }
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : undefined;
  return typeof message === "string" && message.toLowerCase().includes("not allowed");
}
