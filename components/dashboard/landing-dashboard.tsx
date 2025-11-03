"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Building2, CircuitBoard, Satellite } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CropMetrics } from "@/lib/crop-data";

import { KpiCard } from "./kpi-card";
import { TrendCard } from "./trend-card";

interface LandingDashboardProps {
  corn: CropMetrics;
  onion: CropMetrics;
}

interface KpiSummaryEntry {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  description?: string;
}

interface TrendPoint {
  quarter: string;
  area: number;
}

interface SummaryData {
  kpis: KpiSummaryEntry[];
  trends: {
    corn: TrendPoint[];
    onion: TrendPoint[];
  };
}

const heroMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export function LandingDashboard({ corn, onion }: LandingDashboardProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [summaryError, setSummaryError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        const response = await fetch("/data/summary.json");
        if (!response.ok) {
          throw new Error("Failed to load summary");
        }
        const payload = (await response.json()) as SummaryData;
        if (isMounted) {
          setSummary(payload);
        }
      } catch (error) {
        if (isMounted) {
          setSummaryError(true);
        }
        console.error(error);
      }
    };

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const heroHighlights = useMemo(
    () => [
      {
        label: "Corn coverage",
        value: `${corn.summary.totalArea.toLocaleString()} ha`,
        context: `NDVI ${corn.summary.avgNdvi.toFixed(2)} • Yield ${corn.summary.avgYield.toFixed(1)} t/ha`,
      },
      {
        label: "Onion coverage",
        value: `${onion.summary.totalArea.toLocaleString()} ha`,
        context: `NDVI ${onion.summary.avgNdvi.toFixed(2)} • Yield ${onion.summary.avgYield.toFixed(1)} t/ha`,
      },
    ],
    [corn.summary, onion.summary],
  );

  const processSteps = [
    {
      title: "Satellite Observation",
      agency: "PhilSA",
      description: "Sentinel-2 captures multispectral imagery of croplands.",
      icon: Satellite,
    },
    {
      title: "Data Processing & Classification",
      agency: "BAFE + PhilSA",
      description: "Imagery is analysed and converted into crop-type shapefiles.",
      icon: CircuitBoard,
    },
    {
      title: "Visualization & Insights",
      agency: "BAFE",
      description: "Data is published to the dashboard for analysis and decisions.",
      icon: BarChart3,
    },
  ] as const;

  const emptyKpiPlaceholders = Array.from({ length: 4 }).map((_, index) => (
    <div
      key={`kpi-skeleton-${index}`}
      className="h-36 rounded-2xl border border-dashed border-border/50 bg-muted/20"
    >
      <div className="h-full animate-pulse rounded-2xl bg-muted/40" />
    </div>
  ));

  const emptyTrendPlaceholders = Array.from({ length: 2 }).map((_, index) => (
    <div
      key={`trend-skeleton-${index}`}
      className="h-48 rounded-2xl border border-dashed border-border/50 bg-muted/20"
    >
      <div className="h-full animate-pulse rounded-2xl bg-muted/40" />
    </div>
  ));

  return (
    <div className="space-y-12 sm:space-y-14 lg:space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-sky-50 via-emerald-50/80 to-amber-50/70 p-6 shadow-sm sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.18),_transparent_60%)]" />
          <div className="absolute inset-0 backdrop-blur-[1px] mix-blend-multiply" />
        </div>
        <div className="relative grid gap-8 lg:grid-cols-[1.6fr,1fr] lg:items-center lg:gap-10">
          <motion.div {...heroMotion} className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-sky-200/60 bg-white/90 px-4 py-1 text-sm font-medium text-sky-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              National crop monitoring mission update
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Agri Insights: Crop Monitoring and Analytics
              </h1>
              <p className="text-lg text-slate-700 sm:text-xl">
                Powered by BAFE and PhilSA – Combining Earth Observation and
                Agricultural Engineering to monitor corn and onion production
                across the Philippines.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-emerald-600 px-6 text-base shadow-lg hover:bg-emerald-600/90">
                <Link href="/corn">
                  View Corn Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-slate-300 bg-white/80 px-6 text-base text-slate-800 shadow-sm backdrop-blur hover:bg-white"
              >
                <Link href="/onion">
                  View Onion Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  BAFE
                </div>
                <Separator orientation="vertical" className="hidden h-6 w-[1.5px] bg-slate-300 sm:block" />
                <div className="rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  PhilSA
                </div>
              </div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Joint platform for satellite-enabled agriculture
              </p>
            </div>
          </motion.div>

          <motion.div
            {...heroMotion}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
            className="space-y-5 rounded-2xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Field coverage snapshot
            </p>
            <Separator className="bg-slate-200/80" />
            <div className="grid gap-4 sm:grid-cols-2">
              {heroHighlights.map((highlight) => (
                <Card
                  key={highlight.label}
                  className="border border-slate-200/80 bg-slate-50/70 shadow-sm"
                >
                  <CardHeader className="space-y-1 pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      {highlight.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-2xl font-semibold text-slate-900">
                      {highlight.value}
                    </p>
                    <p className="text-[13px] text-slate-600">
                      {highlight.context}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Card className="h-full border-border/60 bg-card/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/75">
            <CardHeader className="flex items-start gap-4 pb-3">
              <span className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Bureau of Agricultural and Fisheries Engineering
                </p>
                <CardTitle className="mt-2 text-xl font-semibold text-foreground">
                  BAFE
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              BAFE spearheads agricultural engineering initiatives and digital
              transformation for farm-to-market systems and production
              monitoring.
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
        >
          <Card className="h-full border-border/60 bg-card/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/75">
            <CardHeader className="flex items-start gap-4 pb-3">
              <span className="rounded-full bg-sky-100 p-2 text-sky-700">
                <Satellite className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Philippine Space Agency
                </p>
                <CardTitle className="mt-2 text-xl font-semibold text-foreground">
                  PhilSA
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              PhilSA provides satellite imagery and geospatial analytics through
              the Sentinel-2 program, enabling accurate mapping of corn and onion
              cultivation areas.
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            How the process works
          </p>
          <h2 className="text-2xl font-semibold text-foreground">
            From spaceborne observation to actionable insights
          </h2>
        </motion.div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
          {processSteps.map((step, index) => (
            <div key={step.title} className="flex flex-1 items-stretch">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.06 }}
                className="relative flex-1"
              >
                <Card className="h-full border-border/60 bg-card/95 shadow-sm">
                  <CardHeader className="flex items-start gap-4 pb-3">
                    <span className="rounded-full bg-muted/70 p-2 text-muted-foreground">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
                        {step.agency}
                      </p>
                      <CardTitle className="mt-2 text-lg font-semibold text-foreground">
                        {step.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </CardContent>
                </Card>
                {index < processSteps.length - 1 ? (
                  <div className="absolute top-1/2 right-[-18px] hidden h-[2px] w-12 -translate-y-1/2 bg-border/60 lg:block">
                    <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-border/60" />
                  </div>
                ) : null}
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Overview KPIs
          </p>
          <h2 className="text-2xl font-semibold text-foreground">
            National monitoring at a glance
          </h2>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary
            ? summary.kpis.map((entry, index) => (
                <KpiCard
                  key={entry.id}
                  label={entry.label}
                  value={entry.value}
                  unit={entry.unit || undefined}
                  description={entry.description}
                  index={index}
                />
              ))
            : summaryError
              ? emptyKpiPlaceholders
              : emptyKpiPlaceholders}
        </div>
        {summaryError ? (
          <p className="text-xs text-destructive">
            Unable to load summary data. Showing mission defaults.
          </p>
        ) : null}
      </section>

      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Seasonal trends
          </p>
          <h2 className="text-2xl font-semibold text-foreground">
            Satellite-observed crop area evolution
          </h2>
        </motion.div>
        <div className="grid gap-6 lg:grid-cols-2">
          {summary
            ? [
                {
                  title: "Corn Area Trend",
                  data: summary.trends.corn,
                  gradientFrom: "#22c55e",
                  gradientTo: "#bbf7d0",
                },
                {
                  title: "Onion Area Trend",
                  data: summary.trends.onion,
                  gradientFrom: "#facc15",
                  gradientTo: "#fef08a",
                },
              ].map((trend) => (
                <TrendCard
                  key={trend.title}
                  title={trend.title}
                  data={trend.data}
                  gradientFrom={trend.gradientFrom}
                  gradientTo={trend.gradientTo}
                />
              ))
            : summaryError
              ? emptyTrendPlaceholders
              : emptyTrendPlaceholders}
        </div>
        {summaryError ? (
          <p className="text-xs text-destructive">
            Trend highlights are using placeholder values while data is unavailable.
          </p>
        ) : null}
      </section>

      <footer className="space-y-4 border-t border-border/60 pt-6 text-sm text-muted-foreground">
        <p>© 2025 Bureau of Agricultural and Fisheries Engineering (BAFE)</p>
        <p>In collaboration with the Philippine Space Agency (PhilSA)</p>
        <p>Data Source: Sentinel-2 Imagery | Developed by PKMDD Digital Systems Team</p>
      </footer>
    </div>
  );
}
