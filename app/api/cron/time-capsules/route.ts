import { NextResponse } from "next/server";
import { processDueTimeCapsuleDeliveries } from "@/lib/time-capsule-processor";
import { verifyCronAuthorization } from "@/lib/time-capsule-cron-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSafeErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
        .replace(/https?:\/\/\S+/g, "[url]")
        .replace(/[A-Za-z0-9+/=_-]{48,}/g, "[redacted]")
        .slice(0, 300)
    : "Time capsule cron processing failed.";
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const authResult = verifyCronAuthorization(request);

  if (authResult.status === "missing_secret") {
    console.error(authResult.logEvent);
    return NextResponse.json(authResult.errorResponse, { status: authResult.httpStatus });
  }

  if (authResult.status === "unauthorized") {
    console.warn(authResult.logEvent);
    return NextResponse.json(authResult.errorResponse, { status: authResult.httpStatus });
  }

  try {
    const summary = await processDueTimeCapsuleDeliveries();
    const durationMs = Math.max(0, Date.now() - startTime);
    const timestamp = new Date().toISOString();

    const logEvent = {
      event: summary.failed > 0 ? "time_capsule_cron_partial_failure" : "time_capsule_cron_success",
      stage: "complete",
      status: 200,
      durationMs,
      claimed: summary.claimed,
      delivered: summary.delivered,
      recovered: summary.recovered,
      failed: summary.failed,
      skipped: summary.skipped,
      timestamp
    };

    console.info(logEvent);

    return NextResponse.json(summary);
  } catch (error) {
    const durationMs = Math.max(0, Date.now() - startTime);

    console.error({
      event: "time_capsule_cron_failed",
      stage: "processor",
      status: 500,
      durationMs,
      errorName: error instanceof Error ? error.name : typeof error,
      safeErrorMessage: getSafeErrorMessage(error),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        error: "time_capsule_cron_failed"
      },
      { status: 500 }
    );
  }
}
