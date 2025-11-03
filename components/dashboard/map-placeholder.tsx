import { Map } from "lucide-react";

export function MapPlaceholder() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/60 bg-muted/40 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Leaflet layers arriving soon
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            We&apos;re wiring geojson tiles to preview canopy stress, irrigation
            pressure, and disease hotspots directly on the map canvas.
          </p>
        </div>
        <div className="rounded-full bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
          Map-ready API staging
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-background/70 p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Planned overlays
          </span>
          <p className="text-sm text-foreground/90">
            NDVI delta, soil moisture, canopy temperature, scouting pins
          </p>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-chart-1/10 to-chart-3/10 p-4 text-sm text-muted-foreground">
          <Map className="mr-3 h-5 w-5 text-chart-3" />
          Drag & drop your GeoJSON layers to preview next deployment.
        </div>
      </div>
    </div>
  );
}
