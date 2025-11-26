"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient, adminClient } from "better-auth/client/plugins";

import { ac, admin, user } from "@/lib/permissions";

export const authClient = createAuthClient({
  basePath: "/api/auth",
  plugins: [
    emailOTPClient(),
    adminClient({
      ac,
      roles: {
        admin,
        user,
      },
    }),
  ],
});
