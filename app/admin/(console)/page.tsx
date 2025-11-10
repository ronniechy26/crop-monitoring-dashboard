import { Suspense } from "react";

import { AdminDashboardContent } from "@/components/admin/admin-dashboard-content";
import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton";

export default function AdminArea() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
