import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CropMetrics, CropSlug } from "@/lib/crop-data";
import { formatMonthLabel } from "@/lib/format";

import { CropDataTable } from "./crop-data-table";
import { CropFilters } from "./crop-filters";
import { CropPerformanceChart } from "./crop-performance-chart";
import { KPIGrid } from "./kpi-grid";
import { CropMap } from "./crop-map";

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
  const latestMonth =
    metrics.timelineMonths[metrics.timelineMonths.length - 1] ?? "";
  const latestMonthLabel = latestMonth ? formatMonthLabel(latestMonth) : "";
  const colorStops =
    crop === "corn"
      ? ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9"]
      : ["#f3e8ff", "#e9d5ff", "#d8b4fe", "#c084fc", "#a855f7"];
  const barangayRows = metrics.barangayProduction
    .slice()
    .sort((a, b) => b.latestProduction - a.latestProduction);

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

      <div className="grid gap-6 xl:grid-cols-[1.35fr,1fr]">
        <div className="space-y-6">
          <Card className="border-border/60 bg-card/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{friendly} field blocks</CardTitle>
              <CardDescription>
                Table joins yield, moisture, NDVI and barangay context to fast-track what needs a scout visit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CropDataTable metrics={metrics} />
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Barangay production footprint
              </CardTitle>
              <CardDescription>
                Latest production totals aggregated per barangay as of{" "}
                {latestMonthLabel || "the most recent report"}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-border/60">
                <Table>
                  <TableHeader className="bg-muted/60">
                    <TableRow>
                      <TableHead>Barangay</TableHead>
                      <TableHead>Latest tons</TableHead>
                      <TableHead>Area (ha)</TableHead>
                      <TableHead>Avg yield (t/ha)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {barangayRows.map((row) => (
                      <TableRow key={row.barangay}>
                        <TableCell className="font-medium text-foreground">
                          {row.barangay}
                        </TableCell>
                        <TableCell>{row.latestProduction.toLocaleString()}</TableCell>
                        <TableCell>{row.totalArea.toFixed(0)}</TableCell>
                        <TableCell>{row.averageYield.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <CropMap
          cropName={friendly}
          features={metrics.features}
          timelineMonths={metrics.timelineMonths}
          colorStops={colorStops}
        />
      </div>
    </div>
  );
}
