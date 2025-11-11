function SkeletonPiece({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

export function UsersSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Admin / Users</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage PhilSA and DA collaborators, resend invites, and review field agent status.
        </p>
      </div>
      <div className="rounded-3xl border border-border/70 bg-card/40 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SkeletonPiece className="h-12 flex-1 rounded-2xl" />
          <SkeletonPiece className="h-10 w-28 rounded-2xl" />
        </div>
        <p className="mt-2 h-4 w-32 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border/60 p-4">
            <SkeletonPiece className="mb-4 h-4 w-24" />
            <SkeletonPiece className="h-8 w-16" />
            <SkeletonPiece className="mt-2 h-4 w-32" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border/60 p-6">
        <SkeletonPiece className="h-6 w-48" />
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonPiece key={index} className="mt-4 h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
