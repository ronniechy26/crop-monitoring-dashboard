import { redirect } from "next/navigation";

import { getSession } from "@/action/query/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCropMetrics } from "@/lib/crop-data";
import { cn } from "@/lib/utils";
import { AlertTriangle, Droplet, Leaf, Map, Sprout } from "lucide-react";

const numberFormatter = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 1,
});

export async function AdminDashboardContent() {
  const [session, corn, onion] = await Promise.all([
    getSession(),
    getCropMetrics("corn"),
    getCropMetrics("onion"),
  ]);

  if (!session) {
    redirect("/admin/login");
  }

  const user = session.user;
  const combinedArea = corn.summary.totalArea + onion.summary.totalArea;
  const avgMoisture =
    (corn.summary.avgMoisture + onion.summary.avgMoisture) / 2;
  const avgNdvi = (corn.summary.avgNdvi + onion.summary.avgNdvi) / 2;
  const monitoredSites = corn.features.length + onion.features.length;
  const barangayCount =
    corn.barangayProduction.length + onion.barangayProduction.length;

  const statCards = [
    {
      label: "Corn coverage",
      value: `${numberFormatter.format(corn.summary.totalArea)} ha`,
      subtext: `NDVI ${corn.summary.avgNdvi.toFixed(2)} • Yield ${corn.summary.avgYield.toFixed(1)} t/ha`,
      icon: Sprout,
    },
    {
      label: "Onion coverage",
      value: `${numberFormatter.format(onion.summary.totalArea)} ha`,
      subtext: `NDVI ${onion.summary.avgNdvi.toFixed(2)} • Yield ${onion.summary.avgYield.toFixed(1)} t/ha`,
      icon: Leaf,
    },
    {
      label: "Avg soil moisture",
      value: avgMoisture.toFixed(2),
      subtext: "Two-week composite across monitored fields",
      icon: Droplet,
    },
    {
      label: "Monitoring footprint",
      value: `${monitoredSites.toLocaleString()}`,
      subtext: `${barangayCount} barangays reporting (${numberFormatter.format(combinedArea)} ha)`,
      icon: Map,
    },
  ] as const;

  const vegetationHealth = [
    {
      crop: "Corn",
      ndvi: corn.summary.avgNdvi,
      moisture: corn.summary.avgMoisture,
    },
    {
      crop: "Onion",
      ndvi: onion.summary.avgNdvi,
      moisture: onion.summary.avgMoisture,
    },
  ];

  const cornLatest = corn.timeSeries[corn.timeSeries.length - 1];
  const onionLatest = onion.timeSeries[onion.timeSeries.length - 1];

  const alerts = [
    {
      crop: "Corn",
      message: corn.trend.alert,
      change: corn.trend.weeklyChange,
      confidence: corn.trend.confidence,
    },
    {
      crop: "Onion",
      message: onion.trend.alert,
      change: onion.trend.weeklyChange,
      confidence: onion.trend.confidence,
    },
  ];

  const barangayLeaders = [
    ...corn.barangayProduction.map((item) => ({ ...item, crop: "Corn" })),
    ...onion.barangayProduction.map((item) => ({ ...item, crop: "Onion" })),
  ]
    .sort((a, b) => b.totalArea - a.totalArea)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user.name ?? user.email}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Crop Monitoring Command
          </h1>
          <p className="text-sm text-muted-foreground">
            Live NDVI, moisture, and production feeds for priority crops
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border border-border/70">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div className="rounded-full bg-muted p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.subtext}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vegetation & moisture outlook</CardTitle>
            <p className="text-sm text-muted-foreground">
              NDVI targets alongside average moisture readings
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {vegetationHealth.map((item) => (
              <div key={item.crop} className="space-y-3">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{item.crop}</span>
                  <span className="text-muted-foreground">
                    NDVI {item.ndvi.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(item.ndvi * 100, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Soil moisture</span>
                  <span>{item.moisture.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Field telemetry (latest)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Derived from the newest satellite composite
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[{ crop: "Corn", data: cornLatest }, { crop: "Onion", data: onionLatest }].map(
              ({ crop, data }) => (
                <div key={crop} className="rounded-xl border border-border/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{crop}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(data.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-muted-foreground">Yield</p>
                      <p className="text-base font-semibold text-foreground">
                        {data.yield.toFixed(1)} t/ha
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Moisture</p>
                      <p className="text-base font-semibold text-foreground">
                        {data.soilMoisture.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">NDVI</p>
                      <p className="text-base font-semibold text-foreground">
                        {data.ndvi.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Field alerts & confidence</CardTitle>
            <p className="text-sm text-muted-foreground">
              Weekly change computed from Better Auth telemetry
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={alert.crop}>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{alert.crop}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className={cn(alert.change >= 0 ? "text-emerald-600" : "text-amber-600")}>
                      {alert.change >= 0 ? "+" : ""}
                      {alert.change.toFixed(1)}% vs last week
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Confidence {Math.round(alert.confidence * 100)}%
                    </p>
                  </div>
                </div>
                {index < alerts.length - 1 ? <Separator className="my-4" /> : null}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Barangay leaders</CardTitle>
            <p className="text-sm text-muted-foreground">
              Highest monitored area across corn & onion AOIs
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {barangayLeaders.map((entry, index) => (
              <div key={`${entry.barangay}-${entry.crop}`}>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{entry.barangay}</span>
                  <span className="text-muted-foreground">{entry.crop}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{numberFormatter.format(entry.totalArea)} ha monitored</span>
                  <span>Latest prod: {entry.latestProduction.toLocaleString()} t</span>
                </div>
                {index < barangayLeaders.length - 1 ? (
                  <Separator className="my-3" />
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Operational summary</CardTitle>
            <p className="text-sm text-muted-foreground">
              Combined NDVI {avgNdvi.toFixed(2)} • {numberFormatter.format(combinedArea)} ha under watch
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 p-4">
              <p className="text-xs uppercase text-muted-foreground">Corn focus</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {corn.summary.avgYield.toFixed(1)} t/ha
              </p>
              <p className="text-sm text-muted-foreground">
                Yield outlook based on {corn.features.length} AOIs
              </p>
            </div>
            <div className="rounded-xl border border-border/70 p-4">
              <p className="text-xs uppercase text-muted-foreground">Onion focus</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {onion.summary.avgYield.toFixed(1)} t/ha
              </p>
              <p className="text-sm text-muted-foreground">
                Yield outlook based on {onion.features.length} AOIs
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Sync latest satellite pass
            </Button>
            <Button className="w-full" variant="outline">
              Export barangay shapefile
            </Button>
            <Button className="w-full" variant="outline">
              Notify provincial LGU
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
