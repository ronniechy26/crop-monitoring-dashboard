function PulseBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

export function LandingDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <PulseBlock className="h-5 w-32" />
        <PulseBlock className="h-10 w-64" />
        <PulseBlock className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border/60 p-4">
            <PulseBlock className="mb-4 h-4 w-32" />
            <PulseBlock className="h-8 w-24" />
            <PulseBlock className="mt-2 h-4 w-40" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-border/60 p-6 lg:col-span-2">
          <PulseBlock className="h-6 w-56" />
          {Array.from({ length: 3 }).map((_, index) => (
            <PulseBlock key={index} className="h-4 w-full" />
          ))}
        </div>
        <div className="space-y-4 rounded-2xl border border-border/60 p-6">
          <PulseBlock className="h-6 w-48" />
          {Array.from({ length: 2 }).map((_, index) => (
            <PulseBlock key={index} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
