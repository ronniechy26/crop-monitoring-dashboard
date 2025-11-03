import { CropDashboard } from "@/components/dashboard/crop-dashboard";
import { getCropMetrics } from "@/lib/crop-data";

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
