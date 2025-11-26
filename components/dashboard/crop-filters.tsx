"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CropFiltersProps {
  stages: string[];
  sensors: string[];
}

export function CropFilters({ stages, sensors }: CropFiltersProps) {
  const [stage, setStage] = useState(stages[0]);
  const [sensor, setSensor] = useState(sensors[0]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/90 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
          Field lenses
        </p>
        <p className="text-sm text-muted-foreground">
          Toggle growth stage & sensor view to sync the charts and table
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {stages.map((item) => (
            <motion.div
              key={item}
              whileTap={{ scale: 0.97 }}
              className="inline-flex"
            >
              <Button
                variant={stage === item ? "default" : "outline"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setStage(item)}
              >
                {item}
              </Button>
            </motion.div>
          ))}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {sensors.map((item) => (
            <motion.div
              key={item}
              whileTap={{ scale: 0.97 }}
              className="inline-flex"
            >
              <Button
                variant={sensor === item ? "default" : "ghost"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setSensor(item)}
              >
                {item}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
