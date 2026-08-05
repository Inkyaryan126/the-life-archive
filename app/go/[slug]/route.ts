import { NextResponse, type NextRequest } from "next/server";
import { getTrackableLinkBySlug, recordLinkClick } from "@/lib/advertising-campaigns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const origin = request.nextUrl.origin;

  const link = await getTrackableLinkBySlug(slug);

  if (!link || link.isDisabled) {
    return NextResponse.redirect(new URL("/", origin));
  }

  // Validate destination path to prevent open redirect vulnerabilities
  let cleanPath = link.destinationPath.trim();
  if (
    !cleanPath.startsWith("/") ||
    cleanPath.startsWith("//") ||
    /^(?:https?:)?\/\//i.test(cleanPath)
  ) {
    cleanPath = "/";
  }

  // Increment link click count
  try {
    await recordLinkClick(link.id);
  } catch (error) {
    console.error("Unable to increment link click:", error);
  }

  // Construct destination URL with preserved query parameters
  const targetUrl = new URL(cleanPath, origin);

  // Preserve incoming query params
  request.nextUrl.searchParams.forEach((val, key) => {
    targetUrl.searchParams.set(key, val);
  });

  // Attach link attribution parameters
  if (link.utmSource) targetUrl.searchParams.set("utm_source", link.utmSource);
  if (link.utmMedium) targetUrl.searchParams.set("utm_medium", link.utmMedium);
  if (link.utmCampaign) targetUrl.searchParams.set("utm_campaign", link.utmCampaign);
  if (link.utmContent) targetUrl.searchParams.set("utm_content", link.utmContent);
  if (link.utmTerm) targetUrl.searchParams.set("utm_term", link.utmTerm);

  if (link.campaignId) targetUrl.searchParams.set("tla_campaign_id", link.campaignId);
  targetUrl.searchParams.set("tla_link_id", link.id);
  if (link.tlaChannel) targetUrl.searchParams.set("tla_channel", link.tlaChannel);
  if (link.tlaPlacement) targetUrl.searchParams.set("tla_placement", link.tlaPlacement);
  if (link.tlaVariant) targetUrl.searchParams.set("tla_variant", link.tlaVariant);
  if (link.tlaMaterial) targetUrl.searchParams.set("tla_material", link.tlaMaterial);
  if (link.tlaLocation) targetUrl.searchParams.set("tla_location", link.tlaLocation);
  if (link.tlaPartner) targetUrl.searchParams.set("tla_partner", link.tlaPartner);

  return NextResponse.redirect(targetUrl);
}
