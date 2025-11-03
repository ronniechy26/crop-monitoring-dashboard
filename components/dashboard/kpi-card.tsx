"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  index?: number;
}

export function KpiCard({
  label,
  value,
  unit,
  description,
  index = 0,
}: KpiCardProps) {
  const displayValue =
    typeof value === "number"
      ? value.toLocaleString(undefined, {
          maximumFractionDigits: unit === "%" ? 0 : 1,
        })
      : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
    >
      <Card className="h-full border-border/60 bg-card/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-foreground">
              {displayValue}
            </span>
            {unit ? (
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {unit}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="text-xs text-muted-foreground/80">{description}</p>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
