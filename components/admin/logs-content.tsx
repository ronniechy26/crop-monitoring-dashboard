import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { searchIngestionLogs } from "@/action/query/logs";
import { LogsSearchForm } from "@/components/admin/logs-search-form";
import { LogsTable } from "@/components/admin/logs-table";
import { Button } from "@/components/ui/button";

interface LogsContentProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const DEFAULT_LOGS_PER_PAGE = 20;
const PER_PAGE_OPTIONS = [10, 20, 30, 50];

export async function LogsContent({ searchParams = {} }: LogsContentProps) {
  const rawSearch =
    typeof searchParams.search === "string" ? searchParams.search : "";
  const trimmedSearch = rawSearch.trim();
  const activeSearch = trimmedSearch.length >= 3 ? trimmedSearch : "";

  const requestedPage =
    typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  const requestedPerPage =
    typeof searchParams.perPage === "string"
      ? Number(searchParams.perPage)
      : DEFAULT_LOGS_PER_PAGE;

  const { logs, total, page, perPage } = await searchIngestionLogs({
    search: activeSearch || undefined,
    page: requestedPage,
    perPage: requestedPerPage,
  });

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = total === 0 ? 0 : Math.min(total, page * perPage);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const hasActiveSearch = Boolean(activeSearch);

  const buildBaseParams = () => {
    const params = new URLSearchParams();
    if (hasActiveSearch) {
      params.set("search", activeSearch);
    }
    if (perPage !== DEFAULT_LOGS_PER_PAGE) {
      params.set("perPage", String(perPage));
    }
    return params;
  };

  const clearHref = (() => {
    const params = new URLSearchParams();
    if (perPage !== DEFAULT_LOGS_PER_PAGE) {
      params.set("perPage", String(perPage));
    }
    const query = params.toString();
    return query ? `/admin/logs?${query}` : "/admin/logs";
  })();

  const buildPageHref = (targetPage: number) => {
    const params = buildBaseParams();
    params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `/admin/logs?${query}` : "/admin/logs";
  };

  const prevHref = buildPageHref(Math.max(page - 1, 1));
  const nextHref = buildPageHref(page + 1);

  const perPageOptions = PER_PAGE_OPTIONS.includes(perPage)
    ? PER_PAGE_OPTIONS
    : [...PER_PAGE_OPTIONS, perPage].sort((a, b) => a - b);

  const footer = (
    <div className="flex flex-col gap-4 text-xs text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <p>
          Page {page} of {totalPages}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {hasPrev ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={prevHref} className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          )}
          {hasNext ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={nextHref} className="flex items-center gap-1">
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <form
        action="/admin/logs"
        method="get"
        className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground lg:justify-end"
      >
        <span className="font-semibold uppercase tracking-wide">Rows per page</span>
        <select
          name="perPage"
          defaultValue={String(perPage)}
          className="rounded-xl border border-border/60 bg-background px-2 py-1 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/40"
        >
          {perPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {hasActiveSearch ? (
          <input type="hidden" name="search" value={activeSearch} />
        ) : null}
        <input type="hidden" name="page" value="1" />
        <Button type="submit" size="sm" variant="ghost">
          Apply
        </Button>
      </form>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/70 bg-card/40 p-4">
        <LogsSearchForm
          initialSearch={rawSearch}
          perPage={perPage}
          clearHref={clearHref}
          hasActiveSearch={hasActiveSearch}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Showing {start}-{end} of {total} log{total === 1 ? "" : "s"}
        </p>
        {trimmedSearch && !hasActiveSearch ? (
          <p className="text-xs text-destructive">
            Enter at least 3 characters to run a search.
          </p>
        ) : null}
      </div>

      <LogsTable logs={logs} footer={footer} />
    </div>
  );
}
