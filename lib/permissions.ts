import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  pipeline: ["create", "read", "update", "delete"],
  user: ["ban", "create", "read", "update", "impersonate"],
  settings: ["create", "read", "update", "delete"],
  dashboard: ["read"]
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  dashboard: ["read"]
});

export const admin = ac.newRole({
  pipeline: ["create", "read", "update", "delete"],
  user: ["ban", "create", "read", "update", "impersonate"],
  settings: ["create", "read", "update", "delete"],
  dashboard: ["read"]
});
