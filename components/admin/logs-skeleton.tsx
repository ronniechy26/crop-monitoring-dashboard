function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

export function LogsSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-4 w-64" />
        </div>
        <SkeletonBlock className="h-8 w-40" />
      </div>

      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border border-border/40 p-4 sm:grid-cols-6 sm:items-center"
          >
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-4 w-40 sm:col-span-2" />
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
