import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export type PermissionRequest = Record<string, string[]>;

export async function hasPermission(permissions: PermissionRequest): Promise<boolean> {
  try {
    const response = await auth.api.userHasPermission({
      body: { permissions },
      headers: await headers(),
    });
    return response.success;
  } catch (error) {
    console.warn("Failed to check permissions", error);
    return false;
  }
}
