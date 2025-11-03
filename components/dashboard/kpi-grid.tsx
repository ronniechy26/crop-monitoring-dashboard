"use client";

import { motion } from "framer-motion";
import { Gauge, Waves, Activity, Leaf } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CropMetrics } from "@/lib/crop-data";

interface KPIGridProps {
  metrics: CropMetrics;
}

const iconMap = {
  yield: Gauge,
  moisture: Waves,
  ndvi: Leaf,
  alert: Activity,
};

export function KPIGrid({ metrics }: KPIGridProps) {
  const cards = [
    {
      key: "yield",
      title: "Avg Yield",
      value: `${metrics.summary.avgYield.toFixed(1)} t/ha`,
      helper: `Across ${metrics.summary.totalArea.toFixed(0)} ha`,
      accent: "Yield trend",
    },
    {
      key: "moisture",
      title: "Soil Moisture",
      value: `${(metrics.summary.avgMoisture * 100).toFixed(0)}%`,
      helper: "Top 20 cm sensor blend",
      accent: "Hydration",
    },
    {
      key: "ndvi",
      title: "NDVI",
      value: metrics.summary.avgNdvi.toFixed(2),
      helper: "Satellite revisit 3d",
      accent: "Canopy health",
    },
    {
      key: "alert",
      title: "Field Insight",
      value: metrics.trend.alert,
      helper: `Confidence ${(metrics.trend.confidence * 100).toFixed(0)}%`,
      accent: "Advisory",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = iconMap[card.key];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.1, duration: 0.35 }}
          >
            <Card className="h-full border-border/60 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div>
                  <Badge className="bg-muted/60 text-xs text-muted-foreground">
                    {card.accent}
                  </Badge>
                  <CardTitle className="mt-2 text-base text-foreground/90">
                    {card.title}
                  </CardTitle>
                </div>
                <span className="rounded-full bg-muted/70 p-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-semibold text-foreground">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground">{card.helper}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
