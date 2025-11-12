import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, admin as adminPlugin } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import * as authSchema from "@/auth-schema";
import { db } from "@/lib/db";
import { ac, admin, user } from "@/lib/permissions";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set. Add it to your environment to use Better Auth.");
}

if (!process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL is not set. Add it to your environment to use Better Auth.");
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  trustedOrigins: ["http://localhost:3000"],
  plugins: [
    nextCookies(),
    adminPlugin({
      adminRoles: ["admin"],
      ac,
      roles: {
        admin,
        user,
      },
    }),
    emailOTP({
      overrideDefaultEmailVerification: false,
      otpLength: 6,
      expiresIn: parseInt(process.env.EMAIL_OTP_EXPIRY ?? '180'),
      sendVerificationOnSignUp: true,
      disableSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        console.log("email ", email);
        console.log("otp ", otp);
        console.log("type ", type);
        // Implement the sendVerificationOTP method to send the OTP to the user's email address
      },
    }),
  ],
});

async function ensureDefaultAdminAccount() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    return;
  }
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";

  try {
    const existing = await db
      .select({ id: authSchema.user.id, emailVerified: authSchema.user.emailVerified })
      .from(authSchema.user)
      .where(eq(authSchema.user.email, email))
      .limit(1);

    if (existing.length > 0) {
      if (!existing[0].emailVerified) {
        await db
          .update(authSchema.user)
          .set({ emailVerified: true })
          .where(eq(authSchema.user.email, email));
      }
      return;
    }

    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });
    await db
      .update(authSchema.user)
      .set({ emailVerified: true, role: "admin" })
      .where(eq(authSchema.user.email, email));
  } catch (error) {
    console.error("Failed to ensure default admin account", error);
  }
}

void ensureDefaultAdminAccount();
