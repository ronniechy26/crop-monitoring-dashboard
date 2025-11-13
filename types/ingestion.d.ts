import type {
  FeatureCollection,
  GeoJsonProperties,
  MultiPolygon,
  Polygon,
} from "geojson";

import type { CropSlug } from "./crop";

export type UploadStatus = "idle" | "success" | "error";

export interface IngestionUploadState {
  status: UploadStatus;
  message: string;
  inserted: number;
  skipped: number;
  crop?: CropSlug | string;
  errors?: string[];
  workflowRunId?: string;
  datasetName?: string;
}

export type UploadShapefileAction = (
  prevState: IngestionUploadState,
  formData: FormData
) => Promise<IngestionUploadState>;

export interface PipelineUserContext {
  id: string;
  email?: string | null;
  name?: string | null;
}

export type PipelineFeatureCollection = FeatureCollection<
  Polygon | MultiPolygon,
  GeoJsonProperties
>;

export interface DataPipelineWorkflowInput {
  captureDateIso: string;
  datasetName: string;
  featureCollection: PipelineFeatureCollection;
  user: PipelineUserContext;
}

export interface DataPipelineWorkflowResult {
  inserted: number;
  skipped: number;
  crops: string[];
  logId: number;
  datasetName: string;
  captureDateIso: string;
}

export type DataPipelineProgressStatus =
  | "queued"
  | "validating"
  | "inserting"
  | "finalizing"
  | "completed"
  | "error";

export interface DataPipelineProgressEvent {
  status: DataPipelineProgressStatus;
  message: string;
  totalFeatures?: number;
  inserted?: number;
  skipped?: number;
}

export interface IngestionLogEntry {
  id: number;
  userId: string;
  userEmail?: string | null;
  userName?: string | null;
  fileName?: string | null;
  captureDate: string;
  totalFeatures: number;
  insertedFeatures: number;
  skippedFeatures: number;
  crops: string[];
  createdAt: string;
}
