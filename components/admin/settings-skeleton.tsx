function SkeletonStrip({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <SkeletonStrip className="h-4 w-40" />
        <SkeletonStrip className="h-8 w-72" />
        <SkeletonStrip className="h-4 w-60" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border/60 p-4">
            <SkeletonStrip className="h-5 w-48" />
            <SkeletonStrip className="mt-3 h-4 w-full" />
            <SkeletonStrip className="mt-2 h-4 w-2/3" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border/60 p-6">
        <SkeletonStrip className="h-6 w-40" />
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonStrip key={index} className="mt-4 h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
