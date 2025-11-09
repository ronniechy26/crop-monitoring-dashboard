import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  emailOTP,
} from "better-auth/plugins";

import * as authSchema from "@/auth-schema";
import { db } from "@/lib/db";

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
    // haveIBeenPwned({
    //   customPasswordCompromisedMessage: "Please choose a more secure password."
    // }),
    nextCookies(),
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
