import { cache } from "react";

import cornData from "@/data/corn_areas.json";
import onionData from "@/data/onion_areas.json";

export type CropSlug = "corn" | "onion";

export interface CropFeatureProperties {
  name: string;
  yield_t_per_ha: number;
  area_ha: number;
  soil_moisture: number;
  ndvi: number;
  barangay: string;
  monthly_production: Record<string, number>;
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
    barangay: string;
    area: number;
    yield: number;
    moisture: number;
    ndvi: number;
  }>;
  features: CropFeature[];
  timelineMonths: string[];
  barangayProduction: Array<{
    barangay: string;
    totalArea: number;
    latestProduction: number;
    averageYield: number;
    monthly: Record<string, number>;
  }>;
}

const cropDataMap: Record<CropSlug, CropGeoJson> = {
  corn: cornData as CropGeoJson,
  onion: onionData as CropGeoJson,
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
  return cropDataMap[crop];
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
    barangay: feature.properties.barangay,
    area: feature.properties.area_ha,
    yield: feature.properties.yield_t_per_ha,
    moisture: feature.properties.soil_moisture,
    ndvi: feature.properties.ndvi,
  }));
}

function collectTimelineMonths(geoJson: CropGeoJson) {
  const monthsSet = new Set<string>();
  geoJson.features.forEach((feature) => {
    Object.keys(feature.properties.monthly_production).forEach((month) => {
      monthsSet.add(month);
    });
  });
  return Array.from(monthsSet).sort();
}

function aggregateBarangayProduction(geoJson: CropGeoJson) {
  const barangayMap = new Map<
    string,
    {
      totalArea: number;
      totalYield: number;
      featureCount: number;
      monthly: Record<string, number>;
    }
  >();

  geoJson.features.forEach((feature) => {
    const key = feature.properties.barangay;
    if (!barangayMap.has(key)) {
      barangayMap.set(key, {
        totalArea: 0,
        totalYield: 0,
        featureCount: 0,
        monthly: {},
      });
    }
    const entry = barangayMap.get(key)!;
    entry.totalArea += feature.properties.area_ha;
    entry.totalYield += feature.properties.yield_t_per_ha;
    entry.featureCount += 1;
    Object.entries(feature.properties.monthly_production).forEach(
      ([month, value]) => {
        entry.monthly[month] = (entry.monthly[month] ?? 0) + value;
      },
    );
  });

  return Array.from(barangayMap.entries()).map(([barangay, stats]) => {
    const sortedMonths = Object.keys(stats.monthly).sort();
    const latestMonth = sortedMonths.length > 0 ? sortedMonths[sortedMonths.length - 1] : "";
    return {
      barangay,
      totalArea: Number(stats.totalArea.toFixed(1)),
      averageYield: Number(
        (stats.totalYield / Math.max(stats.featureCount, 1)).toFixed(1),
      ),
      latestProduction: latestMonth
        ? Number((stats.monthly[latestMonth] ?? 0).toFixed(0))
        : 0,
      monthly: stats.monthly,
    };
  });
}

export const getCropMetrics = cache(async (crop: CropSlug): Promise<CropMetrics> => {
  const geoJson = await getCropGeoJson(crop);
  const timelineMonths = collectTimelineMonths(geoJson);
  return {
    summary: summarizeFeatures(crop, geoJson),
    trend: mockTrends[crop],
    timeSeries: mockTimeSeries[crop],
    table: buildTableData(geoJson),
    features: geoJson.features,
    timelineMonths,
    barangayProduction: aggregateBarangayProduction(geoJson),
  };
});

export async function getAllCropSummaries() {
  const [corn, onion] = await Promise.all([
    getCropMetrics("corn"),
    getCropMetrics("onion"),
  ]);

  return [corn.summary, onion.summary];
}
