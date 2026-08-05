import { NextResponse, type NextRequest } from "next/server";
import { getAdminAccess } from "@/lib/admin";
import { getTrackableLinkBySlug } from "@/lib/advertising-campaigns";
import { generateAdvertisingQrAssets, buildShortTrackableUrl } from "@/lib/qr-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; format: string }> }
) {
  // 1. Enforce Admin Access Control
  const { account, isAdmin, adminEmailsConfigured } = await getAdminAccess();
  if (!account.user || !adminEmailsConfigured || !isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized access to QR download endpoint." },
      { status: 401 }
    );
  }

  const resolvedParams = await params;
  const { slug, format } = resolvedParams;

  // 2. Lookup Trackable Link
  const link = await getTrackableLinkBySlug(slug);

  // 3. Reject if link missing or disabled
  if (!link || link.isDisabled) {
    return NextResponse.json(
      { error: "Trackable link is disabled or does not exist." },
      { status: 404 }
    );
  }

  // 4. Build exact short URL
  const targetUrl = buildShortTrackableUrl(link.slug);

  // 5. Generate QR Assets
  const assets = await generateAdvertisingQrAssets(targetUrl);

  // 6. Return real valid file responses based on requested format
  if (format === "png") {
    return new NextResponse(assets.pngBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="qr-${slug}.png"`,
        "Cache-Control": "no-store, max-age=0"
      }
    });
  }

  if (format === "print") {
    return new NextResponse(assets.printPngBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="qr-${slug}-print.png"`,
        "Cache-Control": "no-store, max-age=0"
      }
    });
  }

  if (format === "svg") {
    return new NextResponse(assets.svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="qr-${slug}.svg"`,
        "Cache-Control": "no-store, max-age=0"
      }
    });
  }

  if (format === "engraving") {
    return new NextResponse(assets.engravingSvg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="qr-${slug}-engraving.svg"`,
        "Cache-Control": "no-store, max-age=0"
      }
    });
  }

  return NextResponse.json(
    { error: "Invalid format requested. Valid formats: png, print, svg, engraving" },
    { status: 400 }
  );
}
