import { redirect } from "next/navigation";

import { signOut } from "@/action/mutation/auth";
import { getSession } from "@/action/mutation/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function signOutAction() {
  "use server";
  await signOut();
  redirect("/admin/login");
}

export default async function AdminArea() {
  const session = await getSession();

  console.log(session)
  if (!session) {
    redirect("/admin/login");
  }

  const user = session?.user;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Card className="border border-border/60 bg-background/80 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Administrator console</CardTitle>
          <p className="text-sm text-muted-foreground">
            Authenticated as <span className="font-semibold">{user.email}</span>. Extend this page with
            the restricted tooling you need.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-5 text-sm text-muted-foreground">
            <p>
              You&apos;re signed in with Better Auth. Protect additional routes by calling `auth.api.getSession`
              in server components or actions and redirecting when no session exists.
            </p>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
