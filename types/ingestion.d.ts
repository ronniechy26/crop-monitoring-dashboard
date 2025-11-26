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

export interface CropGeometryProperties extends GeoJsonProperties {
  class?: number | string | null;
  FID_1?: number | string | null;
  PHCode_Bgy?: string | null;
  PHCode_Reg?: string | null;
  Reg_Name?: string | null;
  PHCode_Pro?: string | null;
  Pro_Name?: string | null;
  PHCode_Mun?: string | null;
  Mun_Name?: string | null;
  Bgy_Name?: string | null;
  "Area sqm"?: number | string | null;
  Area_sqm?: number | string | null;
  CropName?: string | null;
  crop?: string | null;
  dn?: string | null;
}

export interface CropGeometryAttributes {
  classValue: number | null;
  fid1: number | null;
  phCodeBgy: string | null;
  phCodeReg: string | null;
  regName: string | null;
  phCodePro: string | null;
  proName: string | null;
  phCodeMun: string | null;
  munName: string | null;
  bgyName: string | null;
  areaSqm: number | null;
  cropName: string | null;
}

export type PipelineFeatureCollection = FeatureCollection<
  Polygon | MultiPolygon,
  CropGeometryProperties
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

export interface IngestionLogsQueryResult {
  logs: IngestionLogEntry[];
  total: number;
  page: number;
  perPage: number;
}
