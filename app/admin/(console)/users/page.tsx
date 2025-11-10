import { Suspense } from "react";

import { UsersContent } from "@/components/admin/users-content";
import { UsersSkeleton } from "@/components/admin/users-skeleton";

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <UsersContent />
    </Suspense>
  );
}
