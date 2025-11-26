import { Suspense } from "react";

import { LandingDashboardContent } from "@/components/dashboard/landing-dashboard-content";
import { LandingDashboardSkeleton } from "@/components/dashboard/landing-dashboard-skeleton";

export default function Home() {
  return (
    <Suspense fallback={<LandingDashboardSkeleton />}>
      <LandingDashboardContent />
    </Suspense>
  );
}
