import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";

import { getSession } from "@/action/query/auth";
import { hasPermission } from "@/action/query/permissions";
import { getUsers } from "@/action/query/users";
import { createUserMutation } from "@/action/mutation/users";
import { AddUserButton } from "@/components/admin/add-user-button";
import { UsersSearchForm } from "@/components/admin/users-search-form";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeTime } from "@/lib/format";

const dateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const DEFAULT_USERS_PER_PAGE = 10;
const PER_PAGE_OPTIONS = [10, 20, 30, 50];

interface UsersContentProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export async function UsersContent({ searchParams = {} }: UsersContentProps) {
  const searchValueRaw =
    typeof searchParams.search === "string" ? searchParams.search.trim() : "";
  const searchValue = searchValueRaw.length >= 3 ? searchValueRaw : "";
  const requestedPage =
    typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  const requestedPerPage =
    typeof searchParams.perPage === "string" ? Number(searchParams.perPage) : DEFAULT_USERS_PER_PAGE;

  const [session, canListUsers, canCreateUsers] = await Promise.all([
    getSession(),
    hasPermission({ user: ["list"] }),
    hasPermission({ user: ["create"] }),
  ]);
  if (!session) {
    redirect("/admin/login");
  }

  const baseHeader = (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">Admin / Users</p>
      <h1 className="text-3xl font-semibold tracking-tight">User Management</h1>
      <p className="text-sm text-muted-foreground">
        Manage PhilSA and DA collaborators, resend invites, and review field agent status.
      </p>
    </div>
  );

  if (!canListUsers) {
    return (
      <div className="space-y-8">
        {baseHeader}
        <Card className="border-dashed border-border/70 bg-card/40">
          <CardHeader>
            <CardTitle className="text-lg">Insufficient permissions</CardTitle>
            <p className="text-sm text-muted-foreground">
              This view requires the `user:list` permission from your Better Auth session. Ask an administrator to update your access control configuration, then refresh this page.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const userResult = await getUsers({
    search: searchValue,
    page: requestedPage,
    perPage: requestedPerPage,
  });

  const { users, total, verifiedTotal, recentSignups, lastUpdatedUser, page, perPage } = userResult;
  const pendingVerification = total - verifiedTotal;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = total === 0 ? 0 : Math.min(total, page * perPage);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (searchValue) {
      params.set("search", searchValue);
    }
    params.set("page", String(targetPage));
    if (perPage && perPage !== DEFAULT_USERS_PER_PAGE) {
      params.set("perPage", String(perPage));
    }
    const query = params.toString();
    return query ? `/admin/users?${query}` : "/admin/users";
  };
  const prevHref = buildPageHref(Math.max(page - 1, 1));
  const nextHref = buildPageHref(page + 1);
  const lastUpdatedLabel = lastUpdatedUser?.updatedAt
    ? formatRelativeTime(new Date(lastUpdatedUser.updatedAt))
    : "—";
  const lastUpdatedSubtext =
    lastUpdatedUser?.name ?? lastUpdatedUser?.email ?? "No activity yet";

  const perPageOptions = PER_PAGE_OPTIONS.includes(perPage)
    ? PER_PAGE_OPTIONS
    : [...PER_PAGE_OPTIONS, perPage].sort((a, b) => a - b);

  const cards = [
    {
      label: "Total users",
      value: total,
      subtext: "Synced from Better Auth",
      icon: UsersRound,
    },
    {
      label: "Verified accounts",
      value: verifiedTotal,
      subtext: `${pendingVerification} pending verification`,
      icon: ShieldCheck,
    },
    {
      label: "New this week",
      value: recentSignups,
      subtext: "Joined in the last 7 days",
      icon: Mail,
    },
    {
      label: "Last update",
      value: lastUpdatedLabel,
      subtext: lastUpdatedSubtext,
      icon: UserPlus,
    },
  ] as const;

  const emptyStateMessage = searchValue
    ? "No users match your search. Update your filters or invite someone new."
    : "No users found. Use the Better Auth flow to add collaborators.";

  const buildBaseParams = () => {
    const params = new URLSearchParams();
    if (searchValue) {
      params.set("search", searchValue);
    }
    if (perPage && perPage !== DEFAULT_USERS_PER_PAGE) {
      params.set("perPage", String(perPage));
    }
    return params;
  };

  const clearHref = (() => {
    const params = buildBaseParams();
    params.delete("search");
    params.delete("page");
    const query = params.toString();
    return query ? `/admin/users?${query}` : "/admin/users";
  })();

  const header = (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {baseHeader}
      {canCreateUsers ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <AddUserButton action={createUserMutation} />
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite user
          </Button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-8">
      {header}

      <div className="rounded-3xl border border-border/70 bg-card/40 p-4">
        <UsersSearchForm
          initialSearch={searchValueRaw}
          perPage={perPage}
          clearHref={clearHref}
          hasActiveSearch={Boolean(searchValue)}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Showing {start}-{end} of {total} users
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <span className="rounded-full bg-muted p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-foreground">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.subtext}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team directory</CardTitle>
            <p className="text-sm text-muted-foreground">
              Live view of users stored in Better Auth (PostgreSQL).
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Last update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar initials={(member.name ?? member.email).slice(0, 2).toUpperCase()} src={member.image ?? undefined} />
                      <div>
                        <p className="font-medium text-foreground">{member.name ?? member.email}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.emailVerified ? "success" : "warning"}>
                        {member.emailVerified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">
                      {member.role ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.createdAt
                        ? dateTimeFormatter.format(new Date(member.createdAt))
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {member.updatedAt
                        ? formatRelativeTime(new Date(member.updatedAt))
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      {emptyStateMessage}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
          <div className="flex flex-col gap-4 border-t border-border/60 px-6 py-4 text-sm">
            <div className="flex flex-col gap-3 text-xs text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
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
                action="/admin/users"
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
                {searchValue ? (
                  <input type="hidden" name="search" value={searchValue} />
                ) : null}
                <input type="hidden" name="page" value="1" />
                <Button type="submit" size="sm" variant="ghost">
                  Apply
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
