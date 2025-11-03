"use client";

import { useMemo, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CropMetrics, CropSlug } from "@/lib/crop-data";
import { formatPercentage } from "@/lib/format";

import { CropMap } from "./crop-map";
import { MiniChartCard } from "./mini-chart-card";
import { StatsCard } from "./stats-card";

interface LandingDashboardProps {
  corn: CropMetrics;
  onion: CropMetrics;
}

const locations = [
  { label: "The Philippines", value: "ph" },
  { label: "Luzon", value: "luzon" },
  { label: "Visayas", value: "visayas" },
  { label: "Mindanao", value: "mindanao" },
];

export function LandingDashboard({ corn, onion }: LandingDashboardProps) {
  const [activeCrop, setActiveCrop] = useState<CropSlug>("corn");
  const [activeLocation, setActiveLocation] = useState("ph");

  const activeMetrics = activeCrop === "corn" ? corn : onion;

  const colorStops = useMemo(() => {
    return activeCrop === "corn"
      ? ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9"]
      : ["#f3e8ff", "#e9d5ff", "#d8b4fe", "#c084fc", "#a855f7"];
  }, [activeCrop]);

  const overviewStats = [
    {
      title: "Corn area monitored",
      value: corn.summary.totalArea.toFixed(0),
      unit: "ha",
      helper: "Barangay clusters across North & South corridors",
    },
    {
      title: "Onion area monitored",
      value: onion.summary.totalArea.toFixed(0),
      unit: "ha",
      helper: "Key bulb production zones across Central Luzon",
    },
    {
      title: "Corn average yield",
      value: corn.summary.avgYield.toFixed(1),
      unit: "t/ha",
      helper: "Field-estimated yield potential this season",
    },
    {
      title: "Onion average yield",
      value: onion.summary.avgYield.toFixed(1),
      unit: "t/ha",
      helper: "Bulbing phase outlook across monitored farms",
    },
    {
      title: "Corn canopy health",
      value: corn.summary.avgNdvi.toFixed(2),
      helper: "Average NDVI across all monitored corn barangays",
      footnote: formatPercentage(corn.summary.avgMoisture),
    },
    {
      title: "Onion canopy health",
      value: onion.summary.avgNdvi.toFixed(2),
      helper: "NDVI blend with moisture-adjusted sensors",
      footnote: formatPercentage(onion.summary.avgMoisture),
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.75fr,1fr] 2xl:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <Card className="border-border/70 bg-card/95 shadow-sm">
          <CardHeader className="flex flex-col gap-6 pb-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Crop monitoring atlas
                </p>
                <CardTitle className="mt-2 text-3xl font-semibold text-foreground lg:text-4xl">
                  Corn & Onion in the Philippines
                </CardTitle>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full border-border/60 bg-background/80"
              >
                <Link href="/corn">
                  Explore dashboards
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4 text-foreground/80" />
                Location focus
              </div>
              <select
                value={activeLocation}
                onChange={(event) => setActiveLocation(event.target.value)}
                className="h-9 rounded-full border border-border/70 bg-background px-4 text-sm font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                {locations.map((location) => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
              <div className="ml-auto flex gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border/60 px-2 py-0.5">
                  {corn.features.length} corn blocks
                </span>
                <span className="rounded-full border border-border/60 px-2 py-0.5">
                  {onion.features.length} onion blocks
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {overviewStats.map((stat) => (
                <StatsCard key={stat.title} {...stat} />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          <MiniChartCard
            metrics={corn}
            accent="Corn trend"
            gradientFrom="hsl(var(--chart-1))"
            gradientTo="hsl(var(--chart-2))"
          />
          <MiniChartCard
            metrics={onion}
            accent="Onion trend"
            gradientFrom="hsl(var(--chart-4))"
            gradientTo="hsl(var(--chart-5))"
          />
          <Card className="border-border/60 bg-card/95 shadow-sm 2xl:flex 2xl:flex-col 2xl:justify-center 2xl:p-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Weekly signals
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
                <span>Northern ridge moisture</span>
                <span className="font-semibold text-foreground">-3.4%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
                <span>Bulb size trajectory</span>
                <span className="font-semibold text-foreground">+1.2%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
                <span>Scouting backlog</span>
                <span className="font-semibold text-foreground">4 barangays</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Season outlook & advisory highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
              <p className="font-medium text-foreground">
                Corn tasseling window approaching
              </p>
              <p>
                Elevate irrigation for ridge barangays as the V10 growth stage
                approaches. Monitor moisture dip signaled by the weekly trend.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <p className="font-medium text-foreground">
                Onion bulbing remains stable
              </p>
              <p>
                Pest pressure remains low; focus on balanced fertigation to
                maintain NDVI above {onion.summary.avgNdvi.toFixed(2)} across
                the monitored barangays.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-border/50 bg-background/80 p-4 text-xs">
              Connect your Leaflet-ready NDVI or rainfall layers to enrich this
              overview with live satellite overlays.
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
          <div className="text-sm font-semibold text-foreground/85">
            Philippine crop timelapse
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeCrop === "corn" ? "accent" : "outline"}
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setActiveCrop("corn")}
            >
              Corn
            </Button>
            <Button
              variant={activeCrop === "onion" ? "accent" : "outline"}
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setActiveCrop("onion")}
            >
              Onion
            </Button>
          </div>
        </div>
        <CropMap
          cropName={activeCrop === "corn" ? "Corn" : "Onion"}
          features={activeMetrics.features}
          timelineMonths={activeMetrics.timelineMonths}
          colorStops={colorStops}
          height={780}
        />
        <Card className="border-border/60 bg-card/95 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Network uptime
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
              <span>Satellite revisit</span>
              <span className="font-semibold text-foreground">72 hours</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
              <span>Soil probes online</span>
              <span className="font-semibold text-foreground">14</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
              <span>AI advisories</span>
              <span className="font-semibold text-foreground">6 signals</span>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
