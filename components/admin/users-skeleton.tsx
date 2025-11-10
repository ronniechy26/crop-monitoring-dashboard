function SkeletonPiece({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

export function UsersSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <SkeletonPiece className="h-5 w-40" />
        <SkeletonPiece className="h-9 w-72" />
        <SkeletonPiece className="h-4 w-64" />
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
