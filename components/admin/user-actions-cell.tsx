"use client";

import { useId, useState, type ReactNode } from "react";
import { Ban, Eye, MoreHorizontal, Pencil, ShieldCheck, Trash2, UserCheck, X } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/user";

const INPUT_STYLES =
  "w-full rounded-2xl border border-border/60 bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

const BAN_DURATION_OPTIONS = [
  { label: "No expiry", value: "" },
  { label: "24 hours", value: String(60 * 60 * 24) },
  { label: "7 days", value: String(60 * 60 * 24 * 7) },
  { label: "30 days", value: String(60 * 60 * 24 * 30) },
];

type ModalType = "edit" | "role" | "ban" | "unban" | "impersonate" | "delete" | null;

interface UserActionsCellProps {
  member: AdminUser;
  canUpdateUsers: boolean;
  canDeleteUsers: boolean;
  canBanUsers: boolean;
  canImpersonateUsers: boolean;
  canSetRoles: boolean;
  sessionUserId?: string;
  roleOptions: readonly string[];
  updateUserAction: (formData: FormData) => Promise<void>;
  setRoleAction: (formData: FormData) => Promise<void>;
  banUserAction: (formData: FormData) => Promise<void>;
  unbanUserAction: (formData: FormData) => Promise<void>;
  deleteUserAction: (formData: FormData) => Promise<void>;
  impersonateUserAction: (formData: FormData) => Promise<void>;
}

export function UserActionsCell({
  member,
  canUpdateUsers,
  canDeleteUsers,
  canBanUsers,
  canImpersonateUsers,
  canSetRoles,
  sessionUserId,
  roleOptions,
  updateUserAction,
  setRoleAction,
  banUserAction,
  unbanUserAction,
  deleteUserAction,
  impersonateUserAction,
}: UserActionsCellProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const isCurrentUser = sessionUserId === member.id;
  const displayName = member.name ?? member.email;
  const editFormId = useId();
  const roleFormId = useId();
  const banFormId = useId();
  const unbanFormId = useId();
  const impersonateFormId = useId();
  const deleteFormId = useId();

  const availableActions = [
    canUpdateUsers && { label: "Edit user", icon: Pencil, modal: "edit" as const },
    canSetRoles && { label: "Set role", icon: ShieldCheck, modal: "role" as const },
    canBanUsers && !member.banned && { label: "Ban user", icon: Ban, modal: "ban" as const },
    canBanUsers && member.banned && { label: "Unban user", icon: UserCheck, modal: "unban" as const },
    canImpersonateUsers && {
      label: "Impersonate",
      icon: Eye,
      modal: "impersonate" as const,
      disabled: isCurrentUser,
    },
    canDeleteUsers && { label: "Delete user", icon: Trash2, modal: "delete" as const },
  ].filter(Boolean) as {
    label: string;
    icon: typeof Pencil;
    modal: Exclude<ModalType, null>;
    disabled?: boolean;
  }[];

  const closeModal = () => setActiveModal(null);
  const openModal = (type: Exclude<ModalType, null>) => {
    setPanelOpen(false);
    setActiveModal(type);
  };

  let modalContent: ReactNode = null;
  if (activeModal) {
    const baseFields = <input type="hidden" name="userId" value={member.id} />;
    const sharedProps = {
      user: member,
    };
    switch (activeModal) {
      case "edit":
        modalContent = (
          <ActionModal
            key="edit"
            title={`Edit ${displayName}`}
            description="Update profile details synced with Better Auth."
            onClose={closeModal}
            {...sharedProps}
          >
            <form id={editFormId} action={updateUserAction} className="space-y-4" onSubmit={closeModal}>
              {baseFields}
              <label className="space-y-1 text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Name
                </span>
                <input
                  className={INPUT_STYLES}
                  name="name"
                  defaultValue={member.name ?? ""}
                  placeholder="Full name"
                  required
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email
                </span>
                <input
                  className={INPUT_STYLES}
                  type="email"
                  name="email"
                  defaultValue={member.email}
                  placeholder="name@agency.gov.ph"
                  required
                />
              </label>
              <ModalActions
                formId={editFormId}
                submitLabel="Save changes"
                onCancel={closeModal}
                confirmTitle="Apply profile updates?"
                confirmDescription="These changes sync immediately across the admin console."
              />
            </form>
          </ActionModal>
        );
        break;
      case "role":
        modalContent = (
          <ActionModal
            key="role"
            title="Set role"
            description="Assign comma-separated roles. Permissions sync immediately."
            onClose={closeModal}
            {...sharedProps}
          >
            <form id={roleFormId} action={setRoleAction} className="space-y-4" onSubmit={closeModal}>
              {baseFields}
              <RoleChecklist roleOptions={roleOptions} selectedRoles={member.role} />
              <ModalActions
                formId={roleFormId}
                submitLabel="Update role"
                onCancel={closeModal}
                confirmTitle="Change user roles?"
                confirmDescription="Updated roles determine what this collaborator can access."
              />
            </form>
          </ActionModal>
        );
        break;
      case "ban":
        modalContent = (
          <ActionModal
            key="ban"
            title="Ban user"
            description="Revokes all sessions and blocks sign-in until lifted."
            onClose={closeModal}
            {...sharedProps}
          >
            <form id={banFormId} action={banUserAction} className="space-y-4" onSubmit={closeModal}>
              {baseFields}
              <label className="space-y-1 text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Reason
                </span>
                <input
                  className={INPUT_STYLES}
                  name="banReason"
                  defaultValue={member.banReason ?? ""}
                  placeholder="Optional context"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Duration
                </span>
                <select name="banDuration" className={INPUT_STYLES} defaultValue="">
                  {BAN_DURATION_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <ModalActions
                formId={banFormId}
                submitLabel={`Ban ${displayName}`}
                onCancel={closeModal}
                destructive
                confirmTitle="Confirm ban"
                confirmDescription={`This immediately signs out ${displayName} and blocks further logins until unbanned.`}
              />
            </form>
          </ActionModal>
        );
        break;
      case "unban":
        modalContent = (
          <ActionModal
            key="unban"
            title="Unban user"
            description="Restores access and allows new sessions."
            onClose={closeModal}
            {...sharedProps}
          >
            <form id={unbanFormId} action={unbanUserAction} className="space-y-4" onSubmit={closeModal}>
              {baseFields}
              <p className="text-sm text-muted-foreground">
                {displayName} was banned{member.banReason ? ` for "${member.banReason}"` : ""}. Proceed
                to reinstate their access?
              </p>
              <ModalActions
                formId={unbanFormId}
                submitLabel="Unban user"
                onCancel={closeModal}
                confirmTitle="Restore access?"
                confirmDescription={`Allow ${displayName} to sign in again and create new sessions.`}
              />
            </form>
          </ActionModal>
        );
        break;
      case "impersonate":
        modalContent = (
          <ActionModal
            key="impersonate"
            title="Impersonate user"
            description="Creates a temporary session as this user for troubleshooting."
            onClose={closeModal}
            {...sharedProps}
          >
            <form id={impersonateFormId} action={impersonateUserAction} className="space-y-4" onSubmit={closeModal}>
              {baseFields}
              <p className="text-sm text-muted-foreground">
                You will remain impersonating until you stop the session or the timer expires.
              </p>
              <ModalActions
                formId={impersonateFormId}
                submitLabel={`Impersonate ${displayName}`}
                onCancel={closeModal}
                confirmTitle="Start impersonation?"
                confirmDescription="You will switch to this account until you stop impersonating."
              />
            </form>
          </ActionModal>
        );
        break;
      case "delete":
        modalContent = (
          <ActionModal
            key="delete"
            title="Delete user"
            description="This permanently removes the account from Better Auth."
            onClose={closeModal}
            {...sharedProps}
          >
            <form id={deleteFormId} action={deleteUserAction} className="space-y-4" onSubmit={closeModal}>
              {baseFields}
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. Please confirm you want to delete {displayName}.
              </p>
              <ModalActions
                formId={deleteFormId}
                submitLabel="Delete user"
                onCancel={closeModal}
                destructive
                confirmTitle="Delete this account?"
                confirmDescription="This removes the user and all related Better Auth records permanently."
              />
            </form>
          </ActionModal>
        );
        break;
      default:
        modalContent = null;
    }
  }

  return (
    <TableCell className="align-top text-right">
      <Popover open={panelOpen} onOpenChange={setPanelOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
            Options
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <div className="flex flex-col gap-1">
            {availableActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.modal}
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={action.disabled}
                  className="justify-start"
                  onClick={() =>
                    action.disabled ? undefined : openModal(action.modal)
                  }
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              );
            })}
            {availableActions.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">No actions available</p>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      {modalContent}
    </TableCell>
  );
}

interface ActionModalProps {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

interface ActionModalProps {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  user: AdminUser;
}

function ActionModal({
  title,
  description,
  children,
  onClose,
  user,
}: ActionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border/70 bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/70 bg-card px-6 py-4">
          <div className="text-left">
            <p className="text-sm text-muted-foreground">Admin / Users</p>
            <p className="text-lg font-semibold text-foreground">{title}</p>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-6 py-5">
          <UserSummary user={user} />
        </div>
        <Separator className="opacity-60" />
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

function UserSummary({ user }: { user: AdminUser }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 text-left">
      <div className="flex items-center gap-4">
        <Avatar
          initials={(user.name ?? user.email).slice(0, 2).toUpperCase()}
          src={user.image ?? undefined}
          className="h-12 w-12 text-base"
        />
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground">{user.name ?? user.email}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        {user.role ? (
          <Badge variant="outline" className="capitalize">
            {user.role}
          </Badge>
        ) : null}
      </div>
      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <p>
          <span className="font-semibold uppercase tracking-wide">Status:</span>{" "}
          {user.banned ? "Banned" : "Active"}
        </p>
        <p>
          <span className="font-semibold uppercase tracking-wide">Verified:</span>{" "}
          {user.emailVerified ? "Yes" : "Pending"}
        </p>
      </div>
    </div>
  );
}

interface ModalActionsProps {
  submitLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  formId: string;
  confirmTitle?: string;
  confirmDescription?: string;
}

function ModalActions({
  submitLabel,
  destructive = false,
  onCancel,
  formId,
  confirmTitle = "Are you sure?",
  confirmDescription = "This action cannot be undone.",
}: ModalActionsProps) {
  return (
    <div className="flex flex-col gap-2 pt-4 text-right sm:flex-row sm:justify-end sm:text-right">
      <Button type="button" variant="outline" onClick={onCancel} className="sm:min-w-[120px]">
        Cancel
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            className="sm:min-w-[150px]"
          >
            {submitLabel}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            {confirmDescription ? (
              <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nevermind</AlertDialogCancel>
            <AlertDialogAction
              form={formId}
              type="submit"
              className={cn(
                buttonVariants({ variant: destructive ? "destructive" : "default" }),
                "sm:min-w-[140px]",
              )}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface RoleChecklistProps {
  roleOptions: readonly string[];
  selectedRoles: string | null;
}

function RoleChecklist({ roleOptions, selectedRoles }: RoleChecklistProps) {
  const selectedSet = new Set(
    (selectedRoles ?? "")
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean),
  );

  if (!roleOptions.length) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        No roles configured. Update `lib/permissions.ts` to add at least one role.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Assign roles
      </p>
      <div className="grid gap-3 text-left sm:grid-cols-2">
        {roleOptions.map((role) => {
          const display = role.charAt(0).toUpperCase() + role.slice(1);
          const checked = selectedSet.has(role);
          return (
            <label
              key={role}
              className="flex cursor-pointer items-center justify-between rounded-2xl border border-border/70 bg-card/40 px-3 py-2 shadow-sm transition hover:border-primary/60"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{display}</p>
                <p className="text-xs text-muted-foreground">
                  {role === "admin"
                    ? "Full console access"
                    : role === "user"
                      ? "Dashboard-only access"
                      : "Custom role"}
                </p>
              </div>
              <input
                type="checkbox"
                name="role"
                value={role}
                defaultChecked={checked}
                className="h-4 w-4 rounded border-border/80 accent-primary"
              />
            </label>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Select at least one role to keep the account active.</p>
    </div>
  );
}
