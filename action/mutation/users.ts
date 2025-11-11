"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { availableRoles } from "@/lib/permissions";

type Role = (typeof availableRoles)[number];

const validRoles = new Set<Role>(availableRoles);

function isRole(value: string): value is Role {
  return validRoles.has(value as Role);
}

function normalizeRoles(values: string[]): Role[] {
  const normalized = values
    .map((value) => value.trim())
    .filter(isRole);
  return Array.from(new Set(normalized));
}

function extractFields(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const roleInput = (formData.get("role") as string | null)?.trim() || "user";
  const role = isRole(roleInput) ? roleInput : "user";
  return { name, email, password, role };
}

function requireUserId(formData: FormData) {
  const userId = (formData.get("userId") as string | null)?.trim();
  if (!userId) {
    throw new Error("User identifier is required for this action");
  }
  return userId;
}

function parseRoleInput(roleInput: string | null): Role | Role[] | null {
  if (!roleInput) {
    return null;
  }
  const values = normalizeRoles(roleInput.split(","));
  if (values.length === 0) {
    return null;
  }
  return values.length === 1 ? values[0] : values;
}

export async function createUserMutation(formData: FormData) {
  const { name, email, password, role } = extractFields(formData);
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const requestHeaders = await headers();
  await auth.api.createUser({
    body: {
      email,
      password,
      name: name,
      role,
    },
    headers: requestHeaders,
  });

  revalidatePath("/admin/users");
}

export async function inviteUserMutation(formData: FormData) {
  const { email } = extractFields(formData);
  if (!email) {
    throw new Error("Email is required to send an invite");
  }

  // await auth.api.inviteUser({
  //   body: {
  //     email,
  //     name: name || undefined,
  //   },
  // });

  revalidatePath("/admin/users");
}

export async function updateUserMutation(formData: FormData) {
  const userId = requireUserId(formData);
  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const payload: Record<string, string> = {};

  if (name) {
    payload.name = name;
  }
  if (email) {
    payload.email = email;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("Provide at least one field to update");
  }

  const requestHeaders = await headers();
  await auth.api.adminUpdateUser({
    body: {
      userId,
      data: payload,
    },
    headers: requestHeaders,
  });

  revalidatePath("/admin/users");
}

export async function setUserRoleMutation(formData: FormData) {
  const userId = requireUserId(formData);
  const rolesFromCheckboxes = normalizeRoles(
    formData.getAll("role").map((value) => (typeof value === "string" ? value : ""))
  );
  let parsedRole: Role | Role[] | null = null;
  if (rolesFromCheckboxes.length > 0) {
    parsedRole = rolesFromCheckboxes.length === 1 ? rolesFromCheckboxes[0] : rolesFromCheckboxes;
  } else {
    const fallbackInput = (formData.get("role") as string | null)?.trim() ?? null;
    parsedRole = parseRoleInput(fallbackInput);
  }
  if (!parsedRole) {
    throw new Error("Specify at least one role");
  }

  const requestHeaders = await headers();
  await auth.api.setRole({
    body: {
      userId,
      role: parsedRole,
    },
    headers: requestHeaders,
  });

  revalidatePath("/admin/users");
}

export async function banUserMutation(formData: FormData) {
  const userId = requireUserId(formData);
  const banReason = (formData.get("banReason") as string | null)?.trim() || undefined;
  const banDuration = (formData.get("banDuration") as string | null)?.trim() ?? "";
  const durationSeconds =
    banDuration.length > 0 ? Number.parseInt(banDuration, 10) : undefined;
  if (durationSeconds !== undefined && Number.isNaN(durationSeconds)) {
    throw new Error("Ban duration must be a number of seconds");
  }

  const requestHeaders = await headers();
  await auth.api.banUser({
    body: {
      userId,
      banReason,
      banExpiresIn: durationSeconds,
    },
    headers: requestHeaders,
  });

  revalidatePath("/admin/users");
}

export async function unbanUserMutation(formData: FormData) {
  const userId = requireUserId(formData);
  const requestHeaders = await headers();

  await auth.api.unbanUser({
    body: {
      userId,
    },
    headers: requestHeaders,
  });

  revalidatePath("/admin/users");
}

export async function deleteUserMutation(formData: FormData) {
  const userId = requireUserId(formData);
  const requestHeaders = await headers();

  await auth.api.removeUser({
    body: {
      userId,
    },
    headers: requestHeaders,
  });

  revalidatePath("/admin/users");
}

export async function impersonateUserMutation(formData: FormData) {
  const userId = requireUserId(formData);
  const requestHeaders = await headers();

  await auth.api.impersonateUser({
    body: {
      userId,
    },
    headers: requestHeaders,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}
