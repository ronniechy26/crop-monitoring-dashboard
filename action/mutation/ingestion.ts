"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ingestionLogs } from "@/lib/db/schema";
import { fileToFeatureCollection } from "@/lib/geodata";
import type { IngestionUploadState } from "@/types/ingestion";
import type { GeoJsonProperties } from "geojson";

const DEFAULT_MAX_FEATURES = 20000;
const parsedLimit = Number.parseInt(process.env.INGESTION_MAX_FEATURES ?? "", 10);
const MAX_FEATURES = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_MAX_FEATURES;
const DN_KEYS = ["dn", "DN", "crop", "Crop", "CROP"] as const;

function readDn(properties: GeoJsonProperties | null | undefined) {
  if (!properties) {
    return null;
  }
  for (const key of DN_KEYS) {
    if (key in properties) {
      const value = properties[key];
      if (value === undefined || value === null) {
        continue;
      }
      const normalized = value.toString().trim();
      if (normalized.length > 0) {
        return normalized.toLowerCase();
      }
    }
  }
  return null;
}

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

    const dnSet = new Set<string>();
    const datasetName = dataset.name;

    const { inserted, skipped } = await db.transaction(async (tx) => {
      let inserted = 0;
      let skipped = 0;
      for (const feature of collection.features) {
        const dn = readDn(feature.properties);
        if (!dn) {
          skipped++;
          continue;
        }
        dnSet.add(dn);
        const geometryJson = JSON.stringify(feature.geometry);
        await tx.execute(sql`
          insert into crop_geometries (dn, geom, capture_date)
          values (
            ${dn},
            ST_SetSRID(
              ST_Multi(
                ST_GeomFromGeoJSON(${geometryJson})
              ),
              4326
            )::geometry(MultiPolygon, 4326),
            ${captureDate}
          )
        `);
        inserted++;
      }
      if (inserted === 0) {
        throw new Error("No features contained a crop identifier (dn) property.");
      }

      await tx.insert(ingestionLogs).values({
        userId: user.id,
        userEmail: user.email ?? null,
        userName: user.name ?? null,
        fileName: datasetName,
        captureDate,
        totalFeatures: collection.features.length,
        insertedFeatures: inserted,
        skippedFeatures: skipped,
        crops: Array.from(dnSet),
      });

      return { inserted, skipped };
    });

    revalidatePath("/admin");
    revalidatePath("/admin/pipeline");

    return {
      status: "success",
      message: `Uploaded ${inserted} feature${inserted === 1 ? "" : "s"} (${skipped} skipped without dn).`,
      inserted,
      skipped,
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
