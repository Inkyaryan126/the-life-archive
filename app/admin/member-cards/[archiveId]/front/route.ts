import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin";
import {
  buildMemberCardEngravingPng,
  buildMemberCardEngravingSvg,
  getMemberCardEngravingCandidate,
  getMemberCardEngravingFilename
} from "@/lib/member-card-engraving";

export const dynamic = "force-dynamic";

function getRequestedFormat(request: Request): "png" | "svg" | "invalid" {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format")?.trim().toLowerCase();

  if (!format || format === "png") return "png";
  if (format === "svg") return "svg";
  return "invalid";
}

function pngHeaders(filename: string) {
  return new Headers({
    "Content-Type": "image/png",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex"
  });
}

function svgHeaders(filename: string) {
  return new Headers({
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex"
  });
}

export async function GET(
  request: Request,
  {
    params
  }: {
    params: Promise<{
      archiveId: string;
    }>;
  }
) {
  const { account, isAdmin, adminEmailsConfigured } = await getAdminAccess();

  if (!account.user || !adminEmailsConfigured || !isAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const format = getRequestedFormat(request);

  if (format === "invalid") {
    return new NextResponse("Invalid format requested. Supported formats are png and svg.", {
      status: 400
    });
  }

  const { archiveId } = await params;

  if (!/^[0-9a-fA-F-]{36}$/.test(archiveId)) {
    return new NextResponse("Archive not found.", { status: 404 });
  }

  try {
    const candidate = await getMemberCardEngravingCandidate(archiveId);

    if (!candidate) {
      return new NextResponse("Archive not found.", { status: 404 });
    }

    if (format === "svg") {
      const svg = await buildMemberCardEngravingSvg(candidate, "front");
      return new NextResponse(svg, {
        headers: svgHeaders(
          getMemberCardEngravingFilename(candidate, "front", "svg")
        )
      });
    }

    const png = await buildMemberCardEngravingPng(candidate, "front");
    return new NextResponse(png, {
      headers: pngHeaders(
        getMemberCardEngravingFilename(candidate, "front", "png")
      )
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Member card export failed.";
    return new NextResponse(message, { status: 422 });
  }
}
