function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Welcome back,&nbsp;
          <span className="inline-flex h-4 w-32 animate-pulse rounded-md bg-muted align-middle" />
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Crop Monitoring Command</h1>
        <p className="text-sm text-muted-foreground">
          Live NDVI, moisture, and production feeds for priority crops
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border/60 p-4">
            <SkeletonBlock className="mb-4 h-4 w-28" />
            <SkeletonBlock className="h-8 w-20" />
            <SkeletonBlock className="mt-2 h-4 w-40" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-border/60 p-6 lg:col-span-2">
          <SkeletonBlock className="h-6 w-64" />
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-4 w-full" />
          ))}
        </div>
        <div className="space-y-4 rounded-2xl border border-border/60 p-6">
          <SkeletonBlock className="h-6 w-48" />
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-4 w-full" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border/60 p-6">
            <SkeletonBlock className="h-6 w-48" />
            {Array.from({ length: 3 }).map((_, innerIndex) => (
              <SkeletonBlock key={innerIndex} className="mt-4 h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
