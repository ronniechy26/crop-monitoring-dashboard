import type { CropSlug } from "./crop";

export type UploadStatus = "idle" | "success" | "error";

export interface IngestionUploadState {
  status: UploadStatus;
  message: string;
  inserted: number;
  skipped: number;
  crop?: CropSlug | string;
  errors?: string[];
}

export type UploadShapefileAction = (
  prevState: IngestionUploadState,
  formData: FormData
) => Promise<IngestionUploadState>;

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
