import { CropDashboard } from "@/components/dashboard/crop-dashboard";
import { getCropMetrics } from "@/lib/crop-data";

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
