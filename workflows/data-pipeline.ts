import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { FatalError, getWritable } from "workflow";

import { db } from "@/lib/db";
import { ingestionLogs } from "@/lib/db/schema";
import { MAX_FEATURES } from "@/lib/ingestion-limits";
import { DATA_PIPELINE_PROGRESS_NAMESPACE } from "@/lib/workflow-streams";
import type {
  CropGeometryAttributes,
  CropGeometryProperties,
  DataPipelineProgressEvent,
  DataPipelineWorkflowInput,
  DataPipelineWorkflowResult,
} from "@/types/ingestion";
import type { GeoJsonProperties } from "geojson";

const DN_KEYS = ["class", "Class", "dn", "DN", "crop", "Crop", "CROP"] as const;
const AREA_KEYS = ["Area sqm", "Area_sqm", "AreaSqm", "area_sqm"] as const;
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
  const captureDateSql = captureDate.toISOString().slice(0, 10);

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
      const attributes = readAttributes(feature.properties);
      const dn = readDn(feature.properties, attributes);
      if (!dn || !feature.geometry) {
        skippedCount++;
        continue;
      }

      dnSet.add(dn);
      const geometryJson = JSON.stringify(feature.geometry);

      await tx.execute(sql`
        insert into crop_geometries (
          dn,
          class,
          fid_1,
          ph_code_bgy,
          ph_code_reg,
          reg_name,
          ph_code_pro,
          pro_name,
          ph_code_mun,
          mun_name,
          bgy_name,
          area_sqm,
          crop_name,
          geom,
          capture_date
        )
        values (
          ${dn},
          ${attributes.classValue},
          ${attributes.fid1},
          ${attributes.phCodeBgy},
          ${attributes.phCodeReg},
          ${attributes.regName},
          ${attributes.phCodePro},
          ${attributes.proName},
          ${attributes.phCodeMun},
          ${attributes.munName},
          ${attributes.bgyName},
          ${attributes.areaSqm},
          ${attributes.cropName},
          ST_SetSRID(
            ST_Multi(
              ST_GeomFromGeoJSON(${geometryJson})
            ),
            4326
          )::geometry(MultiPolygon, 4326),
          ${captureDateSql}
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
        captureDate: captureDateSql,
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

function readDn(
  properties: GeoJsonProperties | null | undefined,
  attributes: CropGeometryAttributes
) {
  if (attributes.classValue !== null) {
    return attributes.classValue.toString();
  }

  const dnValue = getProperty(properties, DN_KEYS);
  const normalized = normalizeIdentifier(dnValue ?? attributes.cropName);
  return normalized;
}

function readAttributes(
  properties: CropGeometryProperties | null | undefined
): CropGeometryAttributes {
  const classValue = toNumber(getProperty(properties, ["class", "Class", "CLASS", "dn", "DN"]));
  const fid1 = toNumber(getProperty(properties, ["FID_1", "fid_1", "FID"]));
  const phCodeBgy = toStringValue(getProperty(properties, ["PHCode_Bgy", "phcode_bgy"]));
  const phCodeReg = toStringValue(getProperty(properties, ["PHCode_Reg", "phcode_reg"]));
  const regName = toStringValue(getProperty(properties, ["Reg_Name", "reg_name"]));
  const phCodePro = toStringValue(getProperty(properties, ["PHCode_Pro", "phcode_pro"]));
  const proName = toStringValue(getProperty(properties, ["Pro_Name", "pro_name"]));
  const phCodeMun = toStringValue(getProperty(properties, ["PHCode_Mun", "phcode_mun"]));
  const munName = toStringValue(getProperty(properties, ["Mun_Name", "mun_name"]));
  const bgyName = toStringValue(getProperty(properties, ["Bgy_Name", "bgy_name"]));
  const areaSqm = toNumber(getProperty(properties, AREA_KEYS));
  const cropName = toStringValue(getProperty(properties, ["CropName", "cropName", "Crop", "crop"]));

  return {
    classValue,
    fid1,
    phCodeBgy,
    phCodeReg,
    regName,
    phCodePro,
    proName,
    phCodeMun,
    munName,
    bgyName,
    areaSqm,
    cropName,
  };
}

function getProperty(
  properties: GeoJsonProperties | null | undefined,
  keys: readonly string[]
): unknown {
  if (!properties) {
    return null;
  }
  for (const key of keys) {
    if (key in properties) {
      return properties[key];
    }
  }
  return null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toStringValue(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toString() : null;
  }
  return null;
}

function normalizeIdentifier(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toString() : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed.toLowerCase() : null;
  }
  const stringified = value.toString().trim();
  return stringified.length > 0 ? stringified.toLowerCase() : null;
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
