import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin";
import {
  buildMemberCardEngravingPng,
  getMemberCardEngravingCandidate,
  getMemberCardEngravingFilename
} from "@/lib/member-card-engraving";

export const dynamic = "force-dynamic";

function pngHeaders(filename: string) {
  return new Headers({
    "Content-Type": "image/png",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex"
  });
}

export async function GET(
  _request: Request,
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

  const { archiveId } = await params;

  if (!/^[0-9a-fA-F-]{36}$/.test(archiveId)) {
    return new NextResponse("Archive not found.", { status: 404 });
  }

  try {
    const candidate = await getMemberCardEngravingCandidate(archiveId);

    if (!candidate) {
      return new NextResponse("Archive not found.", { status: 404 });
    }

    const png = await buildMemberCardEngravingPng(candidate, "back");
    return new NextResponse(png, {
      headers: pngHeaders(getMemberCardEngravingFilename(candidate, "back"))
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Member card export failed.";
    return new NextResponse(message, { status: 422 });
  }
}
