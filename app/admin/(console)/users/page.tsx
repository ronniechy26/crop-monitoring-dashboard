import { Suspense } from "react";

import { UsersContent } from "@/components/admin/users-content";
import { UsersSkeleton } from "@/components/admin/users-skeleton";

interface UsersPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function UsersPage({ searchParams }: UsersPageProps) {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <UsersContent searchParams={searchParams} />
    </Suspense>
  );
}
