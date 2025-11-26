import { Suspense } from "react";

import { SettingsContent } from "@/components/admin/settings-content";
import { SettingsSkeleton } from "@/components/admin/settings-skeleton";

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
