import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { CropMetrics, CropSlug } from "@/lib/crop-data";

import { CropDataTable } from "./crop-data-table";
import { CropFilters } from "./crop-filters";
import { CropPerformanceChart } from "./crop-performance-chart";
import { KPIGrid } from "./kpi-grid";
import { MapPlaceholder } from "./map-placeholder";

interface CropDashboardProps {
  metrics: CropMetrics;
  crop: CropSlug;
  gradient: {
    from: string;
    to: string;
  };
}

export function CropDashboard({ metrics, crop, gradient }: CropDashboardProps) {
  const friendly = crop === "corn" ? "Corn" : "Onion";

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="accent"
            className="bg-gradient-to-r from-chart-1 to-chart-3 text-foreground"
          >
            {friendly} dashboard
          </Badge>
          <span className="text-sm text-muted-foreground">
            {metrics.summary.totalArea.toFixed(0)} total hectares | season 2024
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          Precision agronomy at a glance
        </h2>
        <p className="text-sm text-muted-foreground">
          Yield, moisture, and NDVI sync with scouting notes. Leaflet layers plug
          in next to align map intelligence with these analytics.
        </p>
      </div>

      <CropFilters
        stages={
          crop === "corn"
            ? ["V8", "V10", "VT"]
            : ["Vegetative", "Bulbing", "Curing"]
        }
        sensors={["Satellite", "Soil probes", "Scouting"]}
      />

      <KPIGrid metrics={metrics} />

      <Card className="border-border/60 bg-card/90">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{friendly} performance</CardTitle>
          <CardDescription>
            Overlay rainfall, NDVI, and soil moisture to spot stress patterns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CropPerformanceChart
            data={metrics.timeSeries}
            stroke={gradient.from}
            fill={gradient.to}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
        <Card className="border-border/60 bg-card/90">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{friendly} field blocks</CardTitle>
            <CardDescription>
              Table joins yield, moisture, NDVI and area to fast-track what needs a scout visit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CropDataTable metrics={metrics} />
          </CardContent>
        </Card>
        <MapPlaceholder />
      </div>
    </div>
  );
}
