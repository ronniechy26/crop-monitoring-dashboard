import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/action/mutation/auth";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admin Login | Crop Monitoring Dashboard",
};

export default async function AdminLoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <Card className="border border-border/60 bg-background/80 shadow-xl">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-semibold">Private admin access</CardTitle>
          <p className="text-sm text-muted-foreground">
            This route stays hidden from the public navigation. Share it only with trusted operations
            personnel who need to monitor crop telemetry.
          </p>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        Accounts are stored through Better Auth using PostgreSQL + Drizzle. Remove an admin by deleting their account in the DB.
      </p>
      <p className="text-center text-xs text-muted-foreground">
        <Link href="/" className="underline underline-offset-4">
          Return to dashboard overview
        </Link>
      </p>
    </div>
  );
}
