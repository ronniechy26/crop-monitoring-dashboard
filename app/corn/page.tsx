import type { Metadata, Viewport } from "next";

import { CropDashboard } from "@/components/dashboard/crop-dashboard";
import { getCropMetrics } from "@/lib/crop-data";

export const metadata: Metadata = {
  title: "Corn Dashboard · Crop Monitor",
  description: "Live telemetry for corn fields with yield, NDVI, and moisture insights.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function CornPage() {
  const metrics = await getCropMetrics("corn");

  return (
    <CropDashboard
      crop="corn"
      metrics={metrics}
      gradient={{
        from: "var(--chart-1)",
        to: "var(--chart-2)",
      }}
    />
  );
}
