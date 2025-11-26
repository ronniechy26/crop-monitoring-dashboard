"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

interface LogsSearchFormProps {
  initialSearch: string;
  perPage: number;
  clearHref: string;
  hasActiveSearch: boolean;
}

export function LogsSearchForm({
  initialSearch,
  perPage,
  clearHref,
  hasActiveSearch,
}: LogsSearchFormProps) {
  const [value, setValue] = useState(initialSearch);
  const trimmedLength = value.trim().length;
  const canSubmit = trimmedLength >= 3;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!canSubmit) {
      event.preventDefault();
    }
  }

  return (
    <form
      action="/admin/logs"
      method="get"
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 md:flex-row md:items-center"
    >
      <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border/60 bg-background px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          name="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search by operator, email, file name, or crop"
          className="flex-1 bg-transparent text-sm outline-none"
          minLength={3}
        />
      </div>
      <input type="hidden" name="perPage" value={String(perPage)} />
      <input type="hidden" name="page" value="1" />
      <div className="flex gap-2 md:justify-end">
        {hasActiveSearch ? (
          <Button type="button" variant="ghost" asChild>
            <Link href={clearHref}>Clear</Link>
          </Button>
        ) : null}
        <Button type="submit" className="md:w-auto" disabled={!canSubmit}>
          Search
        </Button>
      </div>
    </form>
  );
}
