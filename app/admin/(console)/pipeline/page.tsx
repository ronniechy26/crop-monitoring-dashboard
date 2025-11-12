import { redirect } from "next/navigation";
import { getSession } from "@/action/query/auth";
import { uploadShapefileMutation } from "@/action/mutation/ingestion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShapefileUploadForm } from "@/components/admin/shapefile-upload-form";

export default async function DataPipelinePage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Admin / Data Pipeline</p>
        <h1 className="text-3xl font-semibold tracking-tight">Satellite Ingestion Module</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Manage the end-to-end flow from Sentinel‑2 composites to the PostGIS datastore that powers the corn and onion dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload shapefile to PostGIS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The uploader converts zipped shapefiles (or GeoJSON exports) into MultiPolygon geometries and writes them to
            the `crop_geometries` table with the capture date while reading each feature&apos;s `dn`/`crop` attribute to
            set the stored crop identifier.
          </p>
          <ShapefileUploadForm action={uploadShapefileMutation} maxUploadMb={getUploadLimit()} />
        </CardContent>
      </Card>

    </div>
  );
}

function getUploadLimit() {
  const fallback = 50;
  const raw = process.env.INGESTION_MAX_UPLOAD_MB;
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}
