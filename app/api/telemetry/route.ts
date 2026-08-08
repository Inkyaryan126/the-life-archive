import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (process.env.NODE_ENV === "development") {
      console.log("[Telemetry API]", body?.event, body?.properties);
    }
  } catch {
    // Non-blocking telemetry receiver
  }

  return NextResponse.json({ ok: true });
}
