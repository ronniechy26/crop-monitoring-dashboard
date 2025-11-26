"use client";

import { memo, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";
import type { CropFeature, CropFeatureProperties } from "@/types/crop";

export interface LeafletChoroplethProps {
  features: CropFeature[];
  bounds?: LatLngBoundsExpression;
  center: [number, number];
  monthKey: string;
  colorStops: string[];
  min: number;
  max: number;
  height?: number;
}

function getColorScale(value: number, min: number, max: number, palette: string[]) {
  if (!Number.isFinite(value)) return palette[0] ?? "#0f172a";
  if (max === min) return palette[Math.floor(palette.length / 2)] ?? palette[0];
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const index = Math.min(palette.length - 1, Math.floor(ratio * (palette.length - 1)));
  return palette[index];
}

function LeafletChoroplethComponent({
  features,
  bounds,
  center,
  monthKey,
  colorStops,
  min,
  max,
  height,
}: LeafletChoroplethProps) {

  const geoJsonData = useMemo<FeatureCollection>(
    () => ({ type: "FeatureCollection", features }),
    [features]
  );

  // ✅ Optional extra guard for cached components
  if (typeof window === "undefined") return null;

  return (
    <MapContainer
      center={center}
      bounds={bounds}
      zoom={6}
      minZoom={5}
      maxZoom={12}
      scrollWheelZoom
      doubleClickZoom
      style={{ height: height ?? 360, width: "100%" }}
      className="rounded-2xl [&_.leaflet-control-container]:!block [&_.leaflet-bottom.leaflet-right]:m-4 [&_.leaflet-control-zoom]:rounded-xl [&_.leaflet-control-zoom a]:!bg-background [&_.leaflet-control-zoom a]:!text-foreground [&_.leaflet-control-zoom a]:!border [&_.leaflet-control-zoom a]:!border-border/70 [&_.leaflet-control-zoom a]:hover:!bg-muted"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        key={monthKey}
        data={geoJsonData}
        style={(feature) => {
          const props = (feature?.properties ?? {}) as CropFeatureProperties;
          const production = props.monthly_production?.[monthKey] ?? 0;
          const fillColor = getColorScale(production, min, max, colorStops);
          return {
            color: "rgba(15, 23, 42, 0.45)",
            weight: 1,
            fillColor,
            fillOpacity: 0.68,
          };
        }}
        onEachFeature={(feature, layer) => {
          const props = (feature?.properties ?? {}) as CropFeatureProperties;
          const production = props.monthly_production?.[monthKey] ?? 0;
          const barangay = props.barangay ?? "Barangay";
          const name = props.name ?? "Field";
          layer.bindTooltip(
            `<strong>${barangay}</strong><br/>${name}<br/>${production.toLocaleString()} tons`
          );
        }}
      />
    </MapContainer>
  );
}

export const LeafletChoropleth = memo(LeafletChoroplethComponent);
LeafletChoropleth.displayName = "LeafletChoropleth";
export default LeafletChoropleth;
