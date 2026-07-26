import { NextResponse } from "next/server";
import { verifyCronAuthorization } from "@/lib/time-capsule-cron-auth";
import { processDueOnboardingEmailRetries } from "@/lib/legacy-question-email-processor";

export const dynamic = "force-dynamic";

function jsonHeaders() {
  return new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "private, no-store, max-age=0",
    "X-Robots-Tag": "noindex"
  });
}

export async function GET(request: Request) {
  const auth = verifyCronAuthorization(request);

  if (auth.status === "missing_secret") {
    console.error({
      event: "legacy_question_email_cron_failed",
      reason: "missing_secret"
    });

    return new NextResponse(
      JSON.stringify({
        error: "CRON_SECRET is missing from server configuration.",
        status: "missing_secret"
      }),
      { status: 500, headers: jsonHeaders() }
    );
  }

  if (auth.status === "unauthorized") {
    return new NextResponse(
      JSON.stringify({
        error: "Unauthorized",
        status: "unauthorized"
      }),
      { status: 401, headers: jsonHeaders() }
    );
  }

  try {
    const summary = await processDueOnboardingEmailRetries(10);

    return new NextResponse(
      JSON.stringify({
        ok: true,
        summary
      }),
      { status: 200, headers: jsonHeaders() }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron processing failed.";

    console.error({
      event: "legacy_question_email_cron_failed",
      error: message
    });

    return new NextResponse(
      JSON.stringify({
        error: message,
        status: "failed"
      }),
      { status: 500, headers: jsonHeaders() }
    );
  }
}
