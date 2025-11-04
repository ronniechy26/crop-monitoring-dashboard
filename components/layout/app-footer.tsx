import { cn } from "@/lib/utils";
export const dynamic = "force-dynamic";

export function AppFooter({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "relative isolate overflow-hidden rounded-3xl border border-border/60 bg-background/90 px-6 py-10 text-sm text-muted-foreground shadow-[0_30px_75px_-35px_rgba(15,23,42,0.65)] backdrop-blur",
        "before:absolute before:-right-20 before:-top-24 before:h-72 before:w-72 before:rounded-full before:bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)] before:opacity-50",
        "after:absolute after:-bottom-24 after:-left-16 after:h-64 after:w-64 after:rounded-full after:bg-[radial-gradient(circle_at_center,_var(--chart-2)_0%,_transparent_70%)] after:opacity-40",
        "sm:px-10 lg:px-12",
        className,
      )}
    >
      <div className="relative z-10 flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
            Crop Monitoring Dashboard
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Sustainable insights for resilient agriculture
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              Integrated telemetry, analytics, and actionable intelligence to help growers and
              agencies make faster, smarter decisions across the Philippines.
            </p>
          </div>
        </div>

        <div className="grid w-full max-w-md gap-8 text-sm sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">
              Strategic partners
            </h3>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/70" aria-hidden />
                <span>Bureau of Agricultural and Fisheries Engineering (BAFE)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/70" aria-hidden />
                <span>Philippine Space Agency (PhilSA)</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">
              Data sources
            </h3>
            <p className="mt-3 flex items-center gap-2 leading-relaxed">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--chart-3)]" aria-hidden />
              <span>Sentinel-2 multispectral imagery curated for nationwide crop monitoring.</span>
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-10 flex flex-col gap-4 border-t border-border/50 pt-6 text-xs text-muted-foreground/80 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Bureau of Agricultural and Fisheries Engineering (BAFE). All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="flex items-center gap-2">
            <span className="h-1 w-6 rounded-full bg-primary/60" aria-hidden />
            <span>In collaboration with the Philippine Space Agency (PhilSA)</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="h-1 w-6 rounded-full bg-[var(--chart-3)] opacity-80" aria-hidden />
            <span>Primary data source: Sentinel-2 Imagery</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
