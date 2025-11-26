import { redirect } from "next/navigation";
import { ShieldCheck, SlidersHorizontal, UserCog } from "lucide-react";

import { getSession } from "@/action/query/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const preferences = [
  {
    title: "Theme & appearance",
    description: "Toggle between light/dark, select highlight palette, and control sidebar placement.",
    icon: SlidersHorizontal,
  },
  {
    title: "Security defaults",
    description: "Force MFA, rotate admin seed credentials, and define automatic logout intervals.",
    icon: ShieldCheck,
  },
  {
    title: "User roles",
    description: "Map PhilSA/DA personas to Better Auth roles before enabling new modules.",
    icon: UserCog,
  },
] as const;

const mockIntegrations = [
  {
    name: "PhilSA Earth Data",
    status: "Connected",
    detail: "Satellite queue API",
  },
  {
    name: "BAFE PostGIS",
    status: "Connected",
    detail: "Primary database",
  },
  {
    name: "Email OTP",
    status: "Pending",
    detail: "Gov SMTP relay",
  },
] as const;

export async function SettingsContent() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Admin / Settings</p>
        <h1 className="text-3xl font-semibold tracking-tight">Console Settings</h1>
        <p className="text-sm text-muted-foreground">
          Mock configuration panels for display; wire to real mutations when requirements firm up.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {preferences.map((pref) => {
          const Icon = pref.icon;
          return (
            <Card key={pref.title}>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <span className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <CardTitle className="text-base">{pref.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{pref.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Integrations</CardTitle>
            <p className="text-sm text-muted-foreground">
              Placeholder data for PhilSA ingest, PostGIS, and email OTP.
            </p>
          </div>
          <Button variant="outline">Add integration</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockIntegrations.map((integration) => (
              <div
                key={integration.name}
                className="flex flex-col gap-2 rounded-2xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">{integration.name}</p>
                  <p className="text-sm text-muted-foreground">{integration.detail}</p>
                </div>
                <span
                  className={`inline-flex w-full items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold sm:w-auto ${
                    integration.status === "Connected"
                      ? "border-transparent bg-emerald-500/10 text-emerald-600"
                      : "border-border/70 text-muted-foreground"
                  }`}
                >
                  {integration.status}
                </span>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
