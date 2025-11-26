import { LandingDashboard } from "@/components/dashboard/landing-dashboard";
import { getCropMetrics } from "@/lib/crop-data";

export async function LandingDashboardContent() {
  const [corn, onion] = await Promise.all([
    getCropMetrics("corn"),
    getCropMetrics("onion"),
  ]);

  return <LandingDashboard corn={corn} onion={onion} />;
}
