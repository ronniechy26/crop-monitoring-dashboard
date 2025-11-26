import { Suspense } from "react";

import { UsersContent } from "@/components/admin/users-content";
import { UsersSkeleton } from "@/components/admin/users-skeleton";

interface UsersPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <UsersContent searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
