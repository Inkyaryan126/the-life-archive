import { NextResponse } from "next/server";
import { processDueTimeCapsuleDeliveries } from "@/lib/time-capsule-processor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get("authorization");

  return Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`);
}

function getSafeErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
        .replace(/https?:\/\/\S+/g, "[url]")
        .replace(/[A-Za-z0-9+/=_-]{48,}/g, "[redacted]")
        .slice(0, 300)
    : "Time capsule cron processing failed.";
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await processDueTimeCapsuleDeliveries();

    return NextResponse.json(summary);
  } catch (error) {
    console.error({
      event: "time_capsule_cron_failed",
      stage: "route",
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: getSafeErrorMessage(error)
    });

    return NextResponse.json(
      {
        error: "time_capsule_cron_failed"
      },
      { status: 500 }
    );
  }
}
