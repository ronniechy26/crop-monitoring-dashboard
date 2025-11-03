"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CropMetrics } from "@/lib/crop-data";

interface MiniChartCardProps {
  metrics: CropMetrics;
  accent: string;
  gradientFrom: string;
  gradientTo: string;
}

export function MiniChartCard({
  metrics,
  accent,
  gradientFrom,
  gradientTo,
}: MiniChartCardProps) {
  const latest = metrics.timeSeries[metrics.timeSeries.length - 1];
  const previous = metrics.timeSeries[metrics.timeSeries.length - 2] ?? latest;
  const delta = latest.yield - previous.yield;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/50">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div>
            <Badge variant="accent" className="bg-gradient-to-r from-chart-4 to-chart-5 text-xs text-background">
              {accent}
            </Badge>
            <CardTitle className="mt-3 text-lg text-foreground">
              {metrics.summary.crop === "corn" ? "Corn" : "Onion"} snapshot
            </CardTitle>
          </div>
          <div className="rounded-full bg-muted/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            Avg yield {metrics.summary.avgYield.toFixed(1)} t/ha
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground/70">
                Weekly change
              </p>
              <p className="text-xl font-semibold text-foreground">
                {delta >= 0 ? "+" : ""}
                {delta.toFixed(1)} t/ha
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground/70">
                NDVI
              </p>
              <p className="text-xl font-semibold text-foreground">
                {metrics.summary.avgNdvi}
              </p>
            </div>
          </div>
          <div className="mt-5 h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.timeSeries}>
                <defs>
                  <linearGradient
                    id={`mini-${metrics.summary.crop}`}
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={gradientFrom} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={gradientTo} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => value.slice(5)}
                  minTickGap={20}
                />
                <YAxis
                  hide
                  domain={["dataMin - 0.5", "dataMax + 0.5"]}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value: number) => [`${value.toFixed(1)} t/ha`, "Yield"]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="yield"
                  stroke={gradientFrom}
                  fill={`url(#mini-${metrics.summary.crop})`}
                  strokeWidth={2}
                  dot={{ strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
