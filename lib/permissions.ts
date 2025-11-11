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
});
