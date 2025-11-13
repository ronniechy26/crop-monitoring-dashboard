"use server";

import { headers } from "next/headers";
import { start } from "workflow/api";

import { auth } from "@/lib/auth";
import { fileToFeatureCollection } from "@/lib/geodata";
import { MAX_FEATURES } from "@/lib/ingestion-limits";
import type { DataPipelineWorkflowInput, IngestionUploadState } from "@/types/ingestion";
import { handleDataPipelineIngestion } from "@/workflows/data-pipeline";

export async function uploadShapefileMutation(
  _prevState: IngestionUploadState,
  formData: FormData
): Promise<IngestionUploadState> {
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });
    const user = session?.user;
    if (!user) {
      throw new Error("You must be signed in to upload shapefiles.");
    }

    const captureDateInput = (formData.get("captureDate") as string | null)?.trim();
    if (!captureDateInput) {
      throw new Error("Capture date is required.");
    }
    const captureDate = new Date(captureDateInput);
    if (Number.isNaN(captureDate.getTime())) {
      throw new Error("Capture date is invalid.");
    }

    const dataset = formData.get("dataset");
    if (!(dataset instanceof File)) {
      throw new Error("Attach a zipped shapefile (.zip) or GeoJSON file.");
    }

    const collection = await fileToFeatureCollection(dataset);
    if (collection.features.length === 0) {
      throw new Error("No polygon features were found in the uploaded dataset.");
    }
    if (collection.features.length > MAX_FEATURES) {
      throw new Error(
        `Please split the dataset; uploads are limited to ${MAX_FEATURES} features (attempted ${collection.features.length}).`
      );
    }

    const payload: DataPipelineWorkflowInput = {
      captureDateIso: captureDate.toISOString(),
      datasetName: dataset.name,
      featureCollection: collection,
      user: {
        id: user.id,
        email: user.email ?? null,
        name: user.name ?? null,
      },
    };

    const run = await start(handleDataPipelineIngestion, [payload]);

    return {
      status: "success",
      message: `Ingestion workflow started for ${dataset.name}. Track run ${run.runId}.`,
      inserted: 0,
      skipped: 0,
      workflowRunId: run.runId,
      datasetName: dataset.name,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while processing the upload.";
    return {
      status: "error",
      message,
      inserted: 0,
      skipped: 0,
      errors: [message],
    };
  }
}
