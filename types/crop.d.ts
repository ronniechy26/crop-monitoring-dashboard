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
