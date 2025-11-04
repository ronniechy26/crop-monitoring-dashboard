"use client";

import { memo, Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { LatLngBoundsExpression } from "leaflet";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CropFeature } from "@/lib/crop-data";
import { formatMonthLabel } from "@/lib/format";
interface CropMapProps {
  cropName: string;
  features: CropFeature[];
  timelineMonths: string[];
  colorStops: string[];
  height?: number;
}

const playbackIntervalMs = 2200;

function computeBounds(features: CropFeature[]): LatLngBoundsExpression | undefined {
  if (!features.length) return undefined;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  features.forEach((feature) => {
    feature.geometry.coordinates.forEach((polygon) => {
      polygon.forEach(([lng, lat]) => {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      });
    });
  });

  if (!Number.isFinite(minLat) || !Number.isFinite(maxLat)) return undefined;
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

function computeCenter(features: CropFeature[]): [number, number] {
  if (!features.length) return [14.5995, 120.9842]; // Manila fallback

  let totalLat = 0;
  let totalLng = 0;
  let count = 0;

  features.forEach((feature) => {
    feature.geometry.coordinates.forEach((polygon) => {
      polygon.forEach(([lng, lat]) => {
        totalLat += lat;
        totalLng += lng;
        count += 1;
      });
    });
  });

  if (count === 0) return [14.5995, 120.9842];

  return [totalLat / count, totalLng / count];
}

const LeafletChoropleth = dynamic(
  () => import("@/components/dashboard/leaflet-choropleth"),
  {
    ssr: false,
    loading: () => <div className="h-[260px] w-full rounded-2xl bg-muted sm:h-[360px]" />,
  }
);
function CropMapComponent({
  cropName,
  features,
  timelineMonths,
  colorStops,
  height,
}: CropMapProps) {
  const [monthIndex, setMonthIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const baseHeight = height ?? 720;
  const [mapHeight, setMapHeight] = useState(() => Math.min(baseHeight, 560));

  const monthKey = timelineMonths[monthIndex] ?? "";

  const monthLabel = monthKey ? formatMonthLabel(monthKey) : "Timeline";

  const bounds = useMemo(() => computeBounds(features), [features]);
  const center = useMemo(() => computeCenter(features), [features]);

  const monthStats = useMemo(() => {
    const values = features.map(
      (feature) => feature.properties.monthly_production[monthKey] ?? 0,
    );
    const min = Math.min(...values);
    const max = Math.max(...values);
    const average =
      values.length > 0
        ? values.reduce((acc, value) => acc + value, 0) / values.length
        : 0;
    return {
      min: Number.isFinite(min) ? min : 0,
      max: Number.isFinite(max) ? max : 0,
      average: Number(average.toFixed(0)),
    };
  }, [features, monthKey]);

  useEffect(() => {
    if (!playing || timelineMonths.length <= 1) return;

    const timer = window.setInterval(() => {
      setMonthIndex((prev) => (prev + 1) % timelineMonths.length);
    }, playbackIntervalMs);

    return () => window.clearInterval(timer);
  }, [playing, timelineMonths.length]);

  useEffect(() => {
    const setResponsiveHeight = () => {
      const width = window.innerWidth;
      const target = height ?? 700;
      if (width < 640) {
        setMapHeight(Math.min(target, 320));
      } else if (width < 1024) {
        setMapHeight(Math.min(target, 460));
      } else if (width < 1440) {
        setMapHeight(Math.min(target, 580));
      } else {
        setMapHeight(target);
      }
    };

    setResponsiveHeight();
    window.addEventListener("resize", setResponsiveHeight, { passive: true });
    return () => window.removeEventListener("resize", setResponsiveHeight);
  }, [height]);

  const legendStops = useMemo(() => {
    const span = Math.max(monthStats.max - monthStats.min, 1);
    return colorStops.map((color, index) => {
      const value =
        monthStats.min + (span / Math.max(colorStops.length - 1, 1)) * index;
      return {
        color,
        value: Math.round(value),
      };
    });
  }, [colorStops, monthStats.max, monthStats.min]);

  return (
    <Card className="border-border/60 bg-card/90">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <Badge variant="accent" className="rounded-full bg-muted/80 text-xs text-muted-foreground">
            Monthly timelapse
          </Badge>
          <CardTitle className="mt-2 text-lg text-foreground">
            {cropName} production heatmap
          </CardTitle>
          <CardDescription>
            Choropleth driven by reported harvest volume per barangay.
          </CardDescription>
        </div>
        <motion.div
          key={monthKey}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-semibold text-foreground/80"
        >
          {monthLabel}
        </motion.div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setPlaying((state) => !state)}
            >
              {playing ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Play
                </>
              )}
            </Button>
            <div className="rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs">
              Avg {monthStats.average.toLocaleString()} tons
            </div>
          </div>
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={Math.max(timelineMonths.length - 1, 0)}
              value={monthIndex}
              onChange={(event) => {
                setMonthIndex(Number(event.target.value));
                setPlaying(false);
              }}
              className="h-2 w-full appearance-none rounded-full bg-muted accent-foreground"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/80">Legend</span>
          {legendStops.map((stop) => (
            <div
              key={`${stop.color}-${stop.value}`}
              className="flex items-center gap-2"
            >
              <span
                className="h-3 w-6 rounded-full border border-border/60"
                style={{ backgroundColor: stop.color }}
              />
              <span>{stop.value.toLocaleString()} t</span>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60">
          <Suspense fallback={<div className={`h-[${mapHeight}px] w-full animate-pulse rounded-2xl bg-muted/50`} />}>
            <LeafletChoropleth
              features={features}
              bounds={bounds}
              center={center}
              monthKey={monthKey}
              colorStops={colorStops}
              min={monthStats.min}
              max={monthStats.max}
              height={mapHeight}
            />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
}

export const CropMap = memo(CropMapComponent);
CropMap.displayName = "CropMap";
