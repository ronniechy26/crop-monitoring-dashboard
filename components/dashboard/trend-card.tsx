"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendPoint {
  quarter: string;
  area: number;
}

interface TrendCardProps {
  title: string;
  data: TrendPoint[];
  gradientFrom: string;
  gradientTo: string;
}

export function TrendCard({
  title,
  data,
  gradientFrom,
  gradientTo,
}: TrendCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="h-full overflow-hidden border-border/60 bg-card/85 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-foreground">
              {data[data.length - 1]?.area.toLocaleString()}
            </span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              ha in {data[data.length - 1]?.quarter}
            </span>
          </div>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient
                    id={`trend-${title.replace(/\s+/g, "-").toLowerCase()}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={gradientFrom} stopOpacity={0.85} />
                    <stop offset="95%" stopColor={gradientTo} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="quarter"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  hide
                  domain={[
                    (minData : number) => Math.max((minData as number) - 2500, 0),
                    (maxData : number) => (maxData as number) + 2500,
                  ]}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "4 4" }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()} ha`,
                    "Area",
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="area"
                  stroke={gradientFrom}
                  strokeWidth={2.4}
                  fillOpacity={1}
                  fill={`url(#trend-${title.replace(/\s+/g, "-").toLowerCase()})`}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
