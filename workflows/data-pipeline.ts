import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { FatalError, getWritable } from "workflow";

import { db } from "@/lib/db";
import { ingestionLogs } from "@/lib/db/schema";
import { MAX_FEATURES } from "@/lib/ingestion-limits";
import { DATA_PIPELINE_PROGRESS_NAMESPACE } from "@/lib/workflow-streams";
import type {
  DataPipelineProgressEvent,
  DataPipelineWorkflowInput,
  DataPipelineWorkflowResult,
} from "@/types/ingestion";
import type { GeoJsonProperties } from "geojson";

const DN_KEYS = ["dn", "DN", "crop", "Crop", "CROP"] as const;
const PROGRESS_INTERVAL = 100;

export async function handleDataPipelineIngestion(
  payload: DataPipelineWorkflowInput
): Promise<DataPipelineWorkflowResult> {
  "use workflow";

  await emitQueuedEvent(payload);

  try {
    const result = await ingestFeatures(payload);
    await emitFinalizingEvent(result);
    await refreshDashboards();
    await emitCompletedEvent(result);
    return result;
  } catch (error) {
    await emitErrorEvent(error);
    throw error;
  }
}

async function ingestFeatures(
  payload: DataPipelineWorkflowInput
): Promise<DataPipelineWorkflowResult> {
  "use step";

  const { featureCollection, captureDateIso, datasetName, user } = payload;
  const captureDate = new Date(captureDateIso);

  if (Number.isNaN(captureDate.getTime())) {
    throw new FatalError("Invalid capture date provided to the workflow.");
  }

  if (!featureCollection?.features?.length) {
    throw new FatalError("No features were provided to the workflow.");
  }

  if (featureCollection.features.length > MAX_FEATURES) {
    throw new FatalError(
      `Dataset exceeds the configured ${MAX_FEATURES} feature limit.`
    );
  }

  const totalFeatures = featureCollection.features.length;

  await streamProgress({
    status: "validating",
    message: `Validated ${totalFeatures} feature${totalFeatures === 1 ? "" : "s"}.`,
    totalFeatures,
  });

  const dnSet = new Set<string>();
  const { inserted, skipped, logId } = await db.transaction(async (tx) => {
    let insertedCount = 0;
    let skippedCount = 0;
    let lastAnnouncement = 0;

    for (const feature of featureCollection.features) {
      const dn = readDn(feature.properties);
      if (!dn || !feature.geometry) {
        skippedCount++;
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

      insertedCount++;

      if (shouldAnnounce(insertedCount, lastAnnouncement)) {
        lastAnnouncement = insertedCount;
        await streamProgress({
          status: "inserting",
          message: `Inserted ${insertedCount} of ${totalFeatures} features…`,
          totalFeatures,
          inserted: insertedCount,
          skipped: skippedCount,
        });
      }
    }

    if (insertedCount === 0) {
      throw new FatalError("No features contained a crop identifier (dn).");
    }

    const [logEntry] = await tx
      .insert(ingestionLogs)
      .values({
        userId: user.id,
        userEmail: user.email ?? null,
        userName: user.name ?? null,
        fileName: datasetName,
        captureDate,
        totalFeatures: featureCollection.features.length,
        insertedFeatures: insertedCount,
        skippedFeatures: skippedCount,
        crops: Array.from(dnSet),
      })
      .returning({ id: ingestionLogs.id });

    await streamProgress({
      status: "inserting",
      message: `Finished inserts for ${datasetName}.`,
      totalFeatures,
      inserted: insertedCount,
      skipped: skippedCount,
    });

    return {
      inserted: insertedCount,
      skipped: skippedCount,
      logId: logEntry?.id ?? 0,
    };
  });

  return {
    inserted,
    skipped,
    crops: Array.from(dnSet),
    logId,
    datasetName,
    captureDateIso,
  };
}

async function emitQueuedEvent(payload: DataPipelineWorkflowInput) {
  "use step";

  await streamProgress({
    status: "queued",
    message: `Queued ingestion for ${payload.datasetName}.`,
    totalFeatures: payload.featureCollection.features.length,
  });
}

async function emitFinalizingEvent(result: DataPipelineWorkflowResult) {
  "use step";

  await streamProgress({
    status: "finalizing",
    message: "Refreshing admin dashboards…",
    totalFeatures: result.inserted + result.skipped,
    inserted: result.inserted,
    skipped: result.skipped,
  });
}

async function emitCompletedEvent(result: DataPipelineWorkflowResult) {
  "use step";

  await streamProgress(
    {
      status: "completed",
      message: `Ingested ${result.inserted} feature${result.inserted === 1 ? "" : "s"}.`,
      totalFeatures: result.inserted + result.skipped,
      inserted: result.inserted,
      skipped: result.skipped,
    },
    { closeStream: true }
  );
}

async function emitErrorEvent(error: unknown) {
  "use step";

  await streamProgress(
    {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unexpected workflow error while ingesting dataset.",
    },
    { closeStream: true }
  );
}

async function refreshDashboards() {
  "use step";

  revalidatePath("/admin");
  revalidatePath("/admin/logs");
  revalidatePath("/admin/pipeline");
}

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

function shouldAnnounce(inserted: number, lastAnnouncement: number) {
  if (inserted === 0) return false;
  if (inserted === lastAnnouncement) return false;
  if (inserted - lastAnnouncement >= PROGRESS_INTERVAL) {
    return true;
  }
  return false;
}

async function streamProgress(
  event: DataPipelineProgressEvent,
  options: { closeStream?: boolean } = {}
) {
  try {
    const stream = getWritable<DataPipelineProgressEvent>({
      namespace: DATA_PIPELINE_PROGRESS_NAMESPACE,
    });
    const writer = stream.getWriter();
    await writer.write(event);
    if (options.closeStream) {
      await writer.close();
    } else if (typeof writer.releaseLock === "function") {
      writer.releaseLock();
    }
  } catch {
    // Swallow serialization/transport errors; streaming is best-effort.
  }
}
