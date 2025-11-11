"use client";

import { useState } from "react";
import { Plus, ShieldCheck, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AddUserButtonProps {
  action: (formData: FormData) => Promise<void>;
}

export function AddUserButton({ action }: AddUserButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen((prev) => !prev)}>
        <Plus className="mr-2 h-4 w-4" />
        Add user
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl border border-border/70 bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
              <div>
                <p className="text-sm text-muted-foreground">Admin / Users</p>
                <p className="text-lg font-semibold text-foreground">Create user</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form
              action={action}
              className="space-y-4 px-6 py-6 text-sm"
              onSubmit={() => setOpen(false)}
            >
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Full name
                </span>
                <input
                  name="name"
                  required
                  className="rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="e.g. Mara C. Alonzo"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  className="rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="name@philsa.gov.ph"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Temporary password
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  className="rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="Minimum 8 characters"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Role
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-3 py-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <select
                    name="role"
                    defaultValue="user"
                    className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none"
                  >
                    <option value="user">Standard collaborator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <span className="text-xs text-muted-foreground">
                  Admins can manage users and pipeline settings. Standard collaborators get dashboard access only.
                </span>
              </label>
              <p className="text-xs text-muted-foreground">
                Credentials sync with Better Auth immediately via the admin API. Ask the user to reset their password after first login.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
