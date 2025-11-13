import { NextResponse } from "next/server";
import { getRun } from "workflow/api";

import { DATA_PIPELINE_PROGRESS_NAMESPACE } from "@/lib/workflow-streams";
import type { DataPipelineProgressEvent } from "@/types/ingestion";

type RouteContext = {
  params: Promise<{
    runId: string;
  }>;
};

const encoder = new TextEncoder();

export async function GET(_request: Request, { params }: RouteContext) {
  const { runId } = await params;
  if (!runId) {
    return NextResponse.json({ error: "Missing workflow run ID." }, { status: 400 });
  }

  try {
    const run = await getRun(runId);
    const readable = run.getReadable<DataPipelineProgressEvent>({
      namespace: DATA_PIPELINE_PROGRESS_NAMESPACE,
    });

    const transform = new TransformStream<DataPipelineProgressEvent, Uint8Array>({
      transform(chunk, controller) {
        if (chunk === undefined || chunk === null) {
          return;
        }

        try {
          if (typeof chunk === "string") {
            controller.enqueue(encoder.encode(chunk + "\n"));
            return;
          }

          controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
        } catch {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                status: "error",
                message: "Failed to serialize workflow event.",
              }) + "\n"
            )
          );
        }
      },
    });

    const stream = readable.pipeThrough(transform);

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache, no-transform",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to read workflow run stream.";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
