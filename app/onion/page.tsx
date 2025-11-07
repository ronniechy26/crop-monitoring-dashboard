import type { Metadata, Viewport } from "next";

import { CropDashboard } from "@/components/dashboard/crop-dashboard";
import { getCropMetrics } from "@/lib/crop-data";

export const metadata: Metadata = {
  title: "Onion Dashboard · Crop Monitor",
  description: "Mobile-ready overview for onion plots with production, NDVI, and soil data.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function OnionPage() {
  const metrics = await getCropMetrics("onion");

  return (
    <CropDashboard
      crop="onion"
      metrics={metrics}
      gradient={{
        from: "var(--chart-4)",
        to: "var(--chart-5)",
      }}
    />
  );
}
