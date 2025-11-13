import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  pipeline: ["create", "read", "update", "delete"],
  user: [
    "ban",
    "list",
    "create",
    "read",
    "update",
    "impersonate",
    "set-role",
    "delete",
    "set-password",
    "revoke",
  ],
  settings: ["create", "read", "update", "delete"],
  dashboard: ["read"],
  logs: ["list", "read"],
} as const;

export const ac = createAccessControl(statement);

export const availableRoles = ["admin", "user"] as const;

export const user = ac.newRole({
  dashboard: ["read"],
});

export const admin = ac.newRole({
  pipeline: ["create", "read", "update", "delete"],
  user: [
    "ban",
    "list",
    "create",
    "read",
    "update",
    "impersonate",
    "set-role",
    "delete",
    "set-password",
    "revoke",
  ],
  settings: ["create", "read", "update", "delete"],
  dashboard: ["read"],
  logs: ["list", "read"],
});

const ROLE_REGISTRY = {
  admin,
  user,
} as const;

type Statement = typeof statement;
type Resource = keyof Statement;
type ActionFor<R extends Resource> = Statement[R][number];

export function hasPermission<R extends Resource>(
  roleInput: string | string[] | null | undefined,
  resource: R,
  action: ActionFor<R>
): boolean {
  if (!roleInput) {
    return false;
  }
  const normalized = Array.isArray(roleInput) ? roleInput : [roleInput];
  return normalized.some((roleName) => {
    const role = ROLE_REGISTRY[roleName as keyof typeof ROLE_REGISTRY];
    if (!role) {
      return false;
    }
    const statements = role.statements as Partial<
      Record<Resource, readonly ActionFor<Resource>[]>
    >;
    const allowedActions = statements[resource] as
      | readonly ActionFor<R>[]
      | undefined;
    if (!allowedActions) {
      return false;
    }
    return allowedActions.includes(action);
  });
}

export function requirePermission<R extends Resource>(
  roleInput: string | string[] | null | undefined,
  resource: R,
  action: ActionFor<R>
) {
  if (hasPermission(roleInput, resource, action)) {
    return;
  }
  const error = new Error("You do not have permission to perform this action.");
  (error as Error & { status?: number }).status = 403;
  throw error;
}
