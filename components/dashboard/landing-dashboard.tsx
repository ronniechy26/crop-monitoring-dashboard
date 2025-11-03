"use client";

import { motion } from "framer-motion";
import { ArrowRight, Satellite, Waves, Sparkle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CropMetrics } from "@/lib/crop-data";

import { MiniChartCard } from "./mini-chart-card";
import { MapPlaceholder } from "./map-placeholder";

interface LandingDashboardProps {
  corn: CropMetrics;
  onion: CropMetrics;
}

const heroMetrics = [
  {
    label: "Satellite revisit",
    value: "72h",
    icon: Satellite,
  },
  {
    label: "Moisture probes online",
    value: "14",
    icon: Waves,
  },
  {
    label: "AI agronomy signals",
    value: "6",
    icon: Sparkle,
  },
];

export function LandingDashboard({ corn, onion }: LandingDashboardProps) {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/50 p-8 text-foreground shadow-sm sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Crop Monitoring 2024
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Monitor canopy stress, yield signals, and irrigation drift in one
            living dashboard.
          </h1>
          <p className="text-base text-muted-foreground">
            Corn and onion insights stitched from satellite, sensor, and scout
            data. Ready for rapid agronomy decisions — and a seamless Leaflet
            integration next.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href="/corn">
                Explore corn fields
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border border-border/70 bg-background/60 backdrop-blur"
            >
              <Link href="/onion">View onion health</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-10 grid gap-4 sm:grid-cols-3"
        >
          {heroMetrics.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="border-border/50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-foreground">
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,1fr]">
        <MiniChartCard
          metrics={corn}
          accent="Corn"
          gradientFrom="hsl(var(--chart-1))"
          gradientTo="hsl(var(--chart-2))"
        />
        <MiniChartCard
          metrics={onion}
          accent="Onion"
          gradientFrom="hsl(var(--chart-4))"
          gradientTo="hsl(var(--chart-5))"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <Card className="border-border/60 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Season progression</CardTitle>
            <p className="text-sm text-muted-foreground">
              Yield, NDVI, and rainfall stacked to expose stress windows across
              the season.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/50 p-4">
              <span className="font-semibold text-foreground">
                Corn V10 - Tasseling watch
              </span>
              <span>Peak irrigation window +6 days</span>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">
                Onion bulbing phase holds steady. Stay vigilant for downy mildew
                at humidity surges; Leaflet overlay will unlock zone-level alerts.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-border/60 bg-background/80 p-4 text-xs text-muted-foreground">
              Multi-crop rollup tiles appear once Leaflet layers connect. Drop
              in NDVI or weather GeoJSON to preview the map experience.
            </div>
          </CardContent>
        </Card>
        <MapPlaceholder />
      </section>
    </div>
  );
}
