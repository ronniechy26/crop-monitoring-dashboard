import shp from "shpjs";
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  MultiPolygon,
  Polygon,
} from "geojson";
import type { CropGeometryProperties, PipelineFeatureCollection } from "@/types/ingestion";

type PolygonLike = Polygon | MultiPolygon;

const SUPPORTED_GEOMETRIES = new Set<Geometry["type"]>(["Polygon", "MultiPolygon"]);
const DEFAULT_MAX_UPLOAD_MB = 50;
const uploadLimitMb = Number.parseInt(process.env.INGESTION_MAX_UPLOAD_MB ?? "", 10);
const MAX_UPLOAD_MB =
  Number.isFinite(uploadLimitMb) && uploadLimitMb > 0 ? uploadLimitMb : DEFAULT_MAX_UPLOAD_MB;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

function isFeatureCollection(value: unknown): value is FeatureCollection {
  return Boolean(
    value &&
      typeof value === "object" &&
      "type" in value &&
      (value as FeatureCollection).type === "FeatureCollection" &&
      Array.isArray((value as FeatureCollection).features)
  );
}

function isPolygonLike(geometry: Geometry | null): geometry is PolygonLike {
  if (!geometry) {
    return false;
  }
  return SUPPORTED_GEOMETRIES.has(geometry.type);
}

function extractCollections(value: unknown): FeatureCollection[] {
  if (isFeatureCollection(value)) {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.filter(isFeatureCollection);
  }
  if (value && typeof value === "object") {
    return Object.values(value).filter(isFeatureCollection);
  }
  return [];
}

function flattenCollections(collections: FeatureCollection[]): PipelineFeatureCollection {
  const features: Feature<PolygonLike, CropGeometryProperties>[] = [];
  for (const collection of collections) {
    for (const feature of collection.features) {
      if (feature && isPolygonLike(feature.geometry)) {
        features.push({
          ...feature,
          properties: (feature.properties ?? null) as CropGeometryProperties,
          geometry:
            feature.geometry.type === "Polygon"
              ? ({
                  type: "Polygon",
                  coordinates: feature.geometry.coordinates,
                } as Polygon)
              : ({
                  type: "MultiPolygon",
                  coordinates: feature.geometry.coordinates,
                } as MultiPolygon),
        });
      }
    }
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

async function parseShapefileZip(file: File): Promise<PipelineFeatureCollection> {
  const buffer = await file.arrayBuffer();
  const parsed = await shp(buffer);
  const collections = extractCollections(parsed);
  if (collections.length === 0) {
    throw new Error("The archive did not contain a valid shapefile layer.");
  }
  return flattenCollections(collections);
}

function parseGeoJson(text: string): PipelineFeatureCollection {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Unable to parse GeoJSON payload.");
  }
  const collections = extractCollections(parsed);
  if (collections.length === 0) {
    throw new Error("No valid GeoJSON FeatureCollection was found.");
  }
  return flattenCollections(collections);
}

function assertFileSize(file: File) {
  if (file.size === 0) {
    throw new Error("The uploaded file is empty.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File exceeds the ${MAX_UPLOAD_MB} MB limit.`);
  }
}

export async function fileToFeatureCollection(file: File): Promise<PipelineFeatureCollection> {
  assertFileSize(file);
  const name = file.name.toLowerCase();
  if (name.endsWith(".zip")) {
    return parseShapefileZip(file);
  }
  if (name.endsWith(".geojson") || name.endsWith(".json")) {
    return parseGeoJson(await file.text());
  }
  throw new Error("Only zipped shapefiles (.zip) or GeoJSON (.geojson/.json) are supported.");
}
