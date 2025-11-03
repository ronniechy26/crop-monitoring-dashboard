import { cache } from "react";
import { promises as fs } from "fs";
import path from "path";

export type CropSlug = "corn" | "onion";

export interface CropFeatureProperties {
  name: string;
  yield_t_per_ha: number;
  area_ha: number;
  soil_moisture: number;
  ndvi: number;
}

export interface CropFeature {
  type: "Feature";
  id: string;
  properties: CropFeatureProperties;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export interface CropGeoJson {
  type: "FeatureCollection";
  name: string;
  features: CropFeature[];
}

export interface CropSummary {
  crop: CropSlug;
  avgYield: number;
  avgNdvi: number;
  avgMoisture: number;
  totalArea: number;
}

export interface TimeseriesPoint {
  date: string;
  yield: number;
  soilMoisture: number;
  ndvi: number;
  rainfall: number;
}

export interface CropMetrics {
  summary: CropSummary;
  trend: {
    weeklyChange: number;
    alert: string;
    confidence: number;
  };
  timeSeries: TimeseriesPoint[];
  table: Array<{
    id: string;
    name: string;
    area: number;
    yield: number;
    moisture: number;
    ndvi: number;
  }>;
}

const cropFileMap: Record<CropSlug, string> = {
  corn: "corn_areas.geojson",
  onion: "onion_areas.geojson",
};

const mockTrends: Record<CropSlug, CropMetrics["trend"]> = {
  corn: {
    weeklyChange: 3.4,
    alert: "Moisture trending below target on north ridge",
    confidence: 0.76,
  },
  onion: {
    weeklyChange: -1.2,
    alert: "Bulbing phase stable; watch fungal pressure post-rain",
    confidence: 0.68,
  },
};

const mockTimeSeries: Record<CropSlug, TimeseriesPoint[]> = {
  corn: [
    { date: "2024-05-01", yield: 5.8, soilMoisture: 0.58, ndvi: 0.61, rainfall: 8 },
    { date: "2024-05-15", yield: 6.4, soilMoisture: 0.6, ndvi: 0.65, rainfall: 12 },
    { date: "2024-06-01", yield: 6.9, soilMoisture: 0.63, ndvi: 0.69, rainfall: 15 },
    { date: "2024-06-15", yield: 7.5, soilMoisture: 0.66, ndvi: 0.71, rainfall: 9 },
    { date: "2024-07-01", yield: 8.1, soilMoisture: 0.68, ndvi: 0.74, rainfall: 6 },
    { date: "2024-07-15", yield: 8.6, soilMoisture: 0.7, ndvi: 0.76, rainfall: 4 },
  ],
  onion: [
    { date: "2024-05-01", yield: 2.2, soilMoisture: 0.47, ndvi: 0.52, rainfall: 5 },
    { date: "2024-05-15", yield: 2.6, soilMoisture: 0.5, ndvi: 0.56, rainfall: 6 },
    { date: "2024-06-01", yield: 3.1, soilMoisture: 0.53, ndvi: 0.6, rainfall: 9 },
    { date: "2024-06-15", yield: 3.7, soilMoisture: 0.55, ndvi: 0.63, rainfall: 7 },
    { date: "2024-07-01", yield: 3.9, soilMoisture: 0.57, ndvi: 0.65, rainfall: 4 },
    { date: "2024-07-15", yield: 4.2, soilMoisture: 0.58, ndvi: 0.66, rainfall: 3 },
  ],
};

export const getCropGeoJson = cache(async (crop: CropSlug) => {
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    cropFileMap[crop],
  );
  const file = await fs.readFile(filePath, "utf-8");
  return JSON.parse(file) as CropGeoJson;
});

function summarizeFeatures(crop: CropSlug, geoJson: CropGeoJson): CropSummary {
  const totals = geoJson.features.reduce(
    (acc, feature) => {
      acc.totalArea += feature.properties.area_ha;
      acc.totalYield += feature.properties.yield_t_per_ha;
      acc.totalMoisture += feature.properties.soil_moisture;
      acc.totalNdvi += feature.properties.ndvi;
      return acc;
    },
    { totalArea: 0, totalYield: 0, totalMoisture: 0, totalNdvi: 0 },
  );

  const count = geoJson.features.length || 1;

  return {
    crop,
    totalArea: Number(totals.totalArea.toFixed(1)),
    avgYield: Number((totals.totalYield / count).toFixed(1)),
    avgMoisture: Number((totals.totalMoisture / count).toFixed(2)),
    avgNdvi: Number((totals.totalNdvi / count).toFixed(2)),
  };
}

function buildTableData(geoJson: CropGeoJson) {
  return geoJson.features.map((feature) => ({
    id: feature.id,
    name: feature.properties.name,
    area: feature.properties.area_ha,
    yield: feature.properties.yield_t_per_ha,
    moisture: feature.properties.soil_moisture,
    ndvi: feature.properties.ndvi,
  }));
}

export const getCropMetrics = cache(async (crop: CropSlug): Promise<CropMetrics> => {
  const geoJson = await getCropGeoJson(crop);
  return {
    summary: summarizeFeatures(crop, geoJson),
    trend: mockTrends[crop],
    timeSeries: mockTimeSeries[crop],
    table: buildTableData(geoJson),
  };
});

export async function getAllCropSummaries() {
  const [corn, onion] = await Promise.all([
    getCropMetrics("corn"),
    getCropMetrics("onion"),
  ]);

  return [corn.summary, onion.summary];
}

export function formatPercentage(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}

export function formatYield(value: number) {
  return `${value.toFixed(1)} t/ha`;
}
