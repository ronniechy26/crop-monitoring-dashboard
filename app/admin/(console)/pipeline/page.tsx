import { redirect } from "next/navigation";
import { Activity, CloudUpload, Database, Server, Workflow } from "lucide-react";

import { getSession } from "@/action/query/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: CloudUpload,
    title: "Fetch Sentinel-2 scenes",
    detail: "Trigger PhilSA preprocessing or upload GeoTIFF/GeoJSON tiles from latest satellite pass.",
  },
  {
    icon: Workflow,
    title: "Process metrics",
    detail: "Run NDVI, soil-moisture, rainfall fusion, and QA pipelines; export CSV/JSON artifacts.",
  },
  {
    icon: Database,
    title: "Load into PostGIS",
    detail: "Use `ogr2ogr` or `shp2pgsql` with `DATABASE_URL` to keep `crops.*` tables up to date.",
  },
  {
    icon: Activity,
    title: "Publish to dashboard",
    detail: "Refresh cached summaries via Drizzle/Better Auth actions so cards and maps stream data.",
  },
] as const;

export default async function DataPipelinePage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Admin / Data Pipeline</p>
        <h1 className="text-3xl font-semibold tracking-tight">Satellite Ingestion Module</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Manage the end-to-end flow from Sentinel‑2 composites to the PostGIS datastore that powers the corn and onion dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingestion checklist</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-2xl border border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{step.detail}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Command snippets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Enable PostGIS</p>
              <pre className="mt-1 overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-foreground">
                psql $DATABASE_URL -c &quot;CREATE EXTENSION IF NOT EXISTS postgis;&quot;
              </pre>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Load GeoJSON</p>
              <pre className="mt-1 overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-foreground">
                ogr2ogr -f PostgreSQL PG:&quot;$DATABASE_URL&quot; data/corn.geojson \
                -nln crops.corn_fields -nlt MULTIPOLYGON -overwrite
              </pre>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Load shapefile</p>
              <pre className="mt-1 overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-foreground">
                shp2pgsql -I -s 4326 data/onion.shp crops.onion_fields | psql $DATABASE_URL
              </pre>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Automation hooks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/60 p-4">
              <p className="flex items-center justify-between text-xs uppercase">
                Better Auth seeding
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Required
                </span>
              </p>
              <p className="mt-2">
                Run `npm run auth:generate` + `npm run db:push` after schema tweaks so ingestion actions stay typed.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 p-4">
              <p className="text-xs uppercase">Cache refresh</p>
              <p className="mt-2">
                After loading new metrics, call `revalidatePath(&quot;/admin&quot;)` and `/` to stream updated stats through PPR.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 p-4">
              <p className="text-xs uppercase">Monitoring</p>
              <p className="mt-2">
                Log ingestion runs into `crops.ingestion_log` (timestamp, AOI, operator) for traceability.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-2xl border border-dashed border-border/70 p-6">
        <p className="text-sm text-muted-foreground">
          Need to trigger a full reload? Use the CLI helper or ping the Better Auth mutation responsible for ingestion. Document the satellite pass ID and PostGIS transaction ID in your PR.
        </p>
        <Button className="mt-4">
          <Server className="mr-2 h-4 w-4" />
          Run ingestion workflow
        </Button>
      </div>
    </div>
  );
}
