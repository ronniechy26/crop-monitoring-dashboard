"use client";

import { useId } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TimeseriesPoint } from "@/lib/crop-data";

interface CropPerformanceChartProps {
  data: TimeseriesPoint[];
  stroke: string;
  fill: string;
}

export function CropPerformanceChart({
  data,
  stroke,
  fill,
}: CropPerformanceChartProps) {
  const gradientId = `${useId()}-yield`;

  return (
    <div className="h-[240px] w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fill} stopOpacity={0.7} />
              <stop offset="95%" stopColor={fill} stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            }
            tickMargin={12}
          />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            width={40}
            label={{ value: "Yield (t/ha)", angle: -90, position: "insideLeft" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={40}
            label={{ value: "Index", angle: 90, position: "insideRight" }}
          />
          <Tooltip
            formatter={(value: number, name) => {
              if (name === "yield") return [`${value.toFixed(1)} t/ha`, "Yield"];
              if (name === "soilMoisture") return [
                `${(value * 100).toFixed(0)}%`,
                "Soil Moisture",
              ];
              if (name === "ndvi") return [value.toFixed(2), "NDVI"];
              if (name === "rainfall") return [`${value.toFixed(0)} mm`, "Rainfall"];
              return [value, name];
            }}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="yield"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            name="Yield"
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            stroke="var(--chart-3)"
            strokeWidth={2}
            dataKey="ndvi"
            name="NDVI"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            stroke="var(--chart-2)"
            strokeDasharray="6 6"
            dataKey="soilMoisture"
            name="Soil Moisture"
            dot={false}
          />
          <Bar
            yAxisId="right"
            dataKey="rainfall"
            name="Rainfall"
            fill="var(--chart-5)"
            opacity={0.6}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
