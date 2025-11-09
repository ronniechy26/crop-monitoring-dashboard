"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { cache } from "react";
import { redirect } from "next/navigation";

export const getSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});

export const signOut = async () => {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signUp = async (user : any) => {
  try {
    await auth.api.signUpEmail({
      body: {
        email: user.email,
        password: user.password,
        name: user.name,
      },
    });

    return {
      success: true,
      message: "Signed up successfully.",
    };
  } catch (error) {
    const e = error as Error;

    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error) {
    const e = error as Error;

    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};