"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";

function extractFields(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const role = (formData.get("role") as string | null)?.trim() || "user";
  return { name, email, password, role };
}

export async function createUserMutation(formData: FormData) {
  const { name, email, password, role } = extractFields(formData);
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  await auth.api.createUser({
    body: {
      email,
      password,
      name: name,
      role,
    },
  });

  revalidatePath("/admin/users");
}

export async function inviteUserMutation(formData: FormData) {
  const { name, email } = extractFields(formData);
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
