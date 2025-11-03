"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";

import type { CropFeature, CropFeatureProperties } from "@/lib/crop-data";

export interface LeafletChoroplethProps {
  features: CropFeature[];
  bounds?: LatLngBoundsExpression;
  center: [number, number];
  monthKey: string;
  colorStops: string[];
  min: number;
  max: number;
}

function getColorScale(value: number, min: number, max: number, palette: string[]) {
  if (!Number.isFinite(value)) return palette[0] ?? "#0f172a";
  if (max === min) return palette[Math.floor(palette.length / 2)] ?? palette[0];
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const index = Math.min(
    palette.length - 1,
    Math.floor(ratio * (palette.length - 1)),
  );
  return palette[index];
}

export function LeafletChoropleth({
  features,
  bounds,
  center,
  monthKey,
  colorStops,
  min,
  max,
}: LeafletChoroplethProps) {
  const geoJsonData = useMemo<FeatureCollection>(() => {
    return {
      type: "FeatureCollection",
      features,
    };
  }, [features]);

  return (
    <MapContainer
      center={center}
      bounds={bounds}
      scrollWheelZoom={false}
      style={{ height: 360, width: "100%" }}
      className="[&_.leaflet-control-container]:hidden"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        key={monthKey}
        data={geoJsonData}
        style={(feature) => {
          const properties = (feature?.properties ??
            {}) as CropFeatureProperties;
          const production =
            properties.monthly_production?.[monthKey] ?? 0;
          const fillColor = getColorScale(production, min, max, colorStops);
          return {
            color: "rgba(15, 23, 42, 0.45)",
            weight: 1,
            fillColor,
            fillOpacity: 0.68,
          };
        }}
        onEachFeature={(feature, layer) => {
          const properties = (feature?.properties ??
            {}) as CropFeatureProperties;
          const production =
            properties.monthly_production?.[monthKey] ?? 0;
          const barangay = properties.barangay ?? "Barangay";
          const name = properties.name ?? "Field";
          layer.bindTooltip(
            `<strong>${barangay}</strong><br/>${name}<br/>${production.toLocaleString()} tons`,
          );
        }}
      />
    </MapContainer>
  );
}

export default LeafletChoropleth;
