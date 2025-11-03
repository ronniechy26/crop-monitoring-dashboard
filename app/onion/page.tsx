import { CropDashboard } from "@/components/dashboard/crop-dashboard";
import { getCropMetrics } from "@/lib/crop-data";

export default async function OnionPage() {
  const metrics = await getCropMetrics("onion");

  return (
    <CropDashboard
      crop="onion"
      metrics={metrics}
      gradient={{
        from: "hsl(var(--chart-4))",
        to: "hsl(var(--chart-5))",
      }}
    />
  );
}
