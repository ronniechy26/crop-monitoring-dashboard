import { redirect } from "next/navigation";
import { Mail, ShieldCheck, UserPlus, UsersRound } from "lucide-react";

import { getSession } from "@/action/query/auth";
import { getUsers } from "@/action/query/users";
import { createUserMutation } from "@/action/mutation/users";
import { AddUserButton } from "@/components/admin/add-user-button";
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
import type { AdminUser } from "@/types/user";

const dateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function formatRelative(date?: Date | null) {
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (Math.abs(diffMinutes) < 60) {
    return `${Math.max(diffMinutes, 0)}m ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return `${Math.max(diffHours, 0)}h ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `${Math.max(diffDays, 0)}d ago`;
}

export async function UsersContent() {
  const [session, users] = await Promise.all([getSession(), getUsers()]);
  if (!session) {
    redirect("/admin/login");
  }

  const totalUsers = users.length;
  const verifiedCount = users.filter((user) => user.emailVerified).length;
  const pendingVerification = totalUsers - verifiedCount;

  const now = new Date();
  const recentSignups = users.filter((user) => {
    const createdAt = user.createdAt ? new Date(user.createdAt) : null;
    if (!createdAt) return false;
    return now.getTime() - createdAt.getTime() <= SEVEN_DAYS_MS;
  }).length;

  const lastUpdatedUser = users.reduce<AdminUser | null>((latest, user) => {
    if (!user.updatedAt) return latest;
    if (!latest || !latest.updatedAt) {
      return user;
    }
    return user.updatedAt > latest.updatedAt ? user : latest;
  }, null);

  const cards = [
    {
      label: "Total users",
      value: totalUsers,
      subtext: "Synced from Better Auth",
      icon: UsersRound,
    },
    {
      label: "Verified accounts",
      value: verifiedCount,
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
      value: lastUpdatedUser?.updatedAt
        ? formatRelative(new Date(lastUpdatedUser.updatedAt))
        : "—",
      subtext: lastUpdatedUser?.name ?? "No activity yet",
      icon: UserPlus,
    },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Admin / Users</p>
          <h1 className="text-3xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage PhilSA and DA collaborators, resend invites, and review field agent status.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <AddUserButton action={createUserMutation} />
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite user
          </Button>
        </div>
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
                    <TableCell className="text-sm text-muted-foreground">
                      {member.createdAt
                        ? dateTimeFormatter.format(new Date(member.createdAt))
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {member.updatedAt
                        ? formatRelative(new Date(member.updatedAt))
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                      No users found. Use the Better Auth flow to add collaborators.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
