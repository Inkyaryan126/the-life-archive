import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./supabase/admin";
import { buildShortTrackableUrl, generateAdvertisingQrAssets } from "./qr-generator";

export type AdvertisingCampaignStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export type AdvertisingCampaign = {
  id: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  name: string;
  slug: string;
  platform: string;
  channel: string | null;
  medium: string | null;
  objective: string | null;
  destinationUrl: string;
  startDate: string | null;
  endDate: string | null;
  status: AdvertisingCampaignStatus;
  budget: number | null;
  actualCost: number | null;
  impressions: number;
  platformClicks: number;
  manualLeads: number;
  manualSales: number;
  targetAudience: string | null;
  isPhysical: boolean;
  placement: string | null;
  geographicLocation: string | null;
  partnerName: string | null;
  creativeVariant: string | null;
  offer: string | null;
  notes: string | null;
  campaignOwner: string | null;
};

export type AdvertisingLink = {
  id: string;
  createdAt: string;
  campaignId: string | null;
  linkName: string;
  slug: string;
  destinationPath: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  tlaChannel: string | null;
  tlaPlacement: string | null;
  tlaVariant: string | null;
  tlaMaterial: string | null;
  tlaLocation: string | null;
  tlaPartner: string | null;
  isDisabled: boolean;
  clickCount: number;
  uniqueVisitorCount: number;
};

export type AdvertisingLinkJoined = AdvertisingLink & {
  campaignName: string | null;
  campaignSlug: string | null;
  qrId: string | null;
  qrName: string | null;
  qrSlug: string | null;
  materialTarget: string | null;
  scanCount: number;
  hasQrRecord: boolean;
  conversionCount: number;
  qrSvgPreview: string;
  qrDataUri: string;
  isDeprecatedRoute: boolean;
};

export type AdvertisingQrCode = {
  id: string;
  createdAt: string;
  linkId: string;
  qrName: string;
  slug: string;
  errorCorrectionLevel: string;
  printSuitable: boolean;
  engravingSuitable: boolean;
  materialTarget: string | null;
  scanCount: number;
};

export type ConversionType =
  | "landing_visit"
  | "legacy_question_started"
  | "legacy_question_submitted"
  | "signup_started"
  | "signup_completed"
  | "archive_created"
  | "archive_claimed"
  | "memory_added"
  | "keepsake_viewed"
  | "checkout_started"
  | "purchase_completed"
  | "member_card_activated"
  | "time_capsule_created"
  | "final_wishes_saved"
  | "contact_submitted";

export type AdvertisingConversion = {
  id: string;
  createdAt: string;
  visitorId: string;
  sessionId: string | null;
  conversionType: ConversionType;
  conversionValue: number | null;
  firstTouchCampaignId: string | null;
  latestTouchCampaignId: string | null;
  linkId: string | null;
  qrId: string | null;
  details: Record<string, any> | null;
};

export type AnalyticsVisitorNote = {
  id: string;
  createdAt: string;
  updatedAt: string;
  visitorId: string;
  note: string | null;
  tags: string[];
  manualClassification: "human" | "bot" | "internal" | "ignored" | null;
  isIgnored: boolean;
  isInternal: boolean;
  isBlocked: boolean;
  createdBy: string | null;
};

export const DEPRECATED_ROUTES = ["/legacy-question"];

function getAdmin(): SupabaseClient<any, "public", any> | null {
  try {
    return createAdminClient() as SupabaseClient<any, "public", any>;
  } catch (err) {
    return null;
  }
}

export function sanitizeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);

  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str.replace(/"/g, '""')}`;
  }

  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export async function ensureSeedData(): Promise<void> {
  const supabase = getAdmin();
  if (!supabase) return;

  // 1. Ensure "Business Card Test" Campaign exists without overwriting admin edits
  const { data: existingCampaign } = await supabase
    .from("advertising_campaigns")
    .select("id, destination_url")
    .eq("slug", "business-card-test")
    .maybeSingle();

  let campaignId = existingCampaign?.id || null;

  if (!existingCampaign) {
    const { data: createdCampaign } = await supabase
      .from("advertising_campaigns")
      .insert({
        name: "Business Card Test",
        slug: "business-card-test",
        platform: "Business Card",
        destination_url: "/legacy-prologue",
        is_physical: true,
        material: "Black Metal Business Card",
        status: "active",
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single();

    campaignId = createdCampaign?.id || null;
  } else if (existingCampaign.destination_url === "/legacy-question") {
    // One-time migration for legacy seed
    await supabase
      .from("advertising_campaigns")
      .update({ destination_url: "/legacy-prologue" })
      .eq("id", existingCampaign.id);
  }

  // 2. Ensure "Business Card Test QR" Link exists without overwriting admin edits
  const { data: existingLink } = await supabase
    .from("advertising_links")
    .select("id, destination_path")
    .eq("slug", "business-card-test")
    .maybeSingle();

  let linkId = existingLink?.id || null;

  if (!existingLink) {
    const { data: createdLink } = await supabase
      .from("advertising_links")
      .insert({
        campaign_id: campaignId,
        link_name: "Business Card Test QR",
        slug: "business-card-test",
        destination_path: "/legacy-prologue",
        utm_source: "business_card",
        utm_medium: "card_qr",
        utm_campaign: "business_card_test",
        tla_material: "Black Metal Business Card"
      })
      .select("id")
      .single();

    linkId = createdLink?.id || null;
  } else if (existingLink.destination_path === "/legacy-question") {
    // One-time migration from deprecated destination to approved prologue
    await supabase
      .from("advertising_links")
      .update({ destination_path: "/legacy-prologue" })
      .eq("id", existingLink.id);
  }

  if (linkId) {
    // 3. Ensure corresponding QR code record exists
    const { data: existingQr } = await supabase
      .from("advertising_qr_codes")
      .select("id")
      .eq("slug", "qr-business-card-test")
      .maybeSingle();

    if (!existingQr) {
      await supabase.from("advertising_qr_codes").insert({
        link_id: linkId,
        qr_name: "Business Card Test QR Code",
        slug: "qr-business-card-test",
        error_correction_level: "H",
        print_suitable: true,
        engraving_suitable: true,
        material_target: "Black Metal Business Card"
      });
    }
  }
}

export async function listCampaigns(): Promise<AdvertisingCampaign[]> {
  await ensureSeedData().catch(() => {});
  const supabase = getAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("advertising_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to list campaigns:", error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
    name: row.name,
    slug: row.slug,
    platform: row.platform,
    channel: row.channel,
    medium: row.medium,
    objective: row.objective,
    destinationUrl: row.destination_url,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    budget: row.budget ? Number(row.budget) : null,
    actualCost: row.actual_cost ? Number(row.actual_cost) : null,
    impressions: Number(row.impressions || 0),
    platformClicks: Number(row.platform_clicks || 0),
    manualLeads: Number(row.manual_leads || 0),
    manualSales: Number(row.manual_sales || 0),
    targetAudience: row.target_audience,
    isPhysical: Boolean(row.is_physical),
    placement: row.placement,
    geographicLocation: row.geographic_location,
    partnerName: row.partner_name,
    creativeVariant: row.creative_variant,
    offer: row.offer,
    notes: row.notes,
    campaignOwner: row.campaign_owner
  }));
}

export async function listTrackableLinksJoined(): Promise<AdvertisingLinkJoined[]> {
  await ensureSeedData().catch(() => {});
  const supabase = getAdmin();
  if (!supabase) {
    const shortUrl = buildShortTrackableUrl(mockLinkStore.slug);
    const qrAssets = await generateAdvertisingQrAssets(shortUrl);
    return [
      {
        ...mockLinkStore,
        campaignName: "Business Card Test",
        campaignSlug: "business-card-test",
        qrId: "mock_qr_business_card_test",
        qrName: "Business Card Test QR Code",
        qrSlug: "qr-business-card-test",
        materialTarget: mockLinkStore.tlaMaterial,
        scanCount: 0,
        hasQrRecord: true,
        conversionCount: 0,
        qrSvgPreview: qrAssets.svg,
        qrDataUri: qrAssets.pngDataUri,
        isDeprecatedRoute: mockLinkStore.destinationPath.includes("/legacy-question")
      }
    ];
  }

  const [linksResult, campaignsResult, qrsResult, conversionsResult] = await Promise.all([
    supabase.from("advertising_links").select("*").order("created_at", { ascending: false }),
    supabase.from("advertising_campaigns").select("id, name, slug"),
    supabase.from("advertising_qr_codes").select("*"),
    supabase.from("advertising_conversions").select("link_id")
  ]);

  if (linksResult.error) {
    console.error("Unable to list trackable links:", linksResult.error.message);
    return [];
  }

  const campaignMap = new Map<string, { name: string; slug: string }>();
  for (const c of campaignsResult.data ?? []) {
    campaignMap.set(c.id, { name: c.name, slug: c.slug });
  }

  const qrMap = new Map<string, any>();
  for (const q of qrsResult.data ?? []) {
    qrMap.set(q.link_id, q);
  }

  const conversionCountMap = new Map<string, number>();
  for (const conv of conversionsResult.data ?? []) {
    if (conv.link_id) {
      conversionCountMap.set(conv.link_id, (conversionCountMap.get(conv.link_id) ?? 0) + 1);
    }
  }

  const joinedLinks: AdvertisingLinkJoined[] = [];

  for (const row of linksResult.data ?? []) {
    const campaign = row.campaign_id ? campaignMap.get(row.campaign_id) : null;
    const qr = qrMap.get(row.id);
    const shortUrl = buildShortTrackableUrl(row.slug);
    const qrAssets = await generateAdvertisingQrAssets(shortUrl);
    const destPath = (row.destination_path || "").trim();
    const isDeprecatedRoute = DEPRECATED_ROUTES.some((d) => destPath.toLowerCase().startsWith(d));

    joinedLinks.push({
      id: row.id,
      createdAt: row.created_at,
      campaignId: row.campaign_id,
      linkName: row.link_name,
      slug: row.slug,
      destinationPath: row.destination_path,
      utmSource: row.utm_source,
      utmMedium: row.utm_medium,
      utmCampaign: row.utm_campaign,
      utmContent: row.utm_content,
      utmTerm: row.utm_term,
      tlaChannel: row.tla_channel,
      tlaPlacement: row.tla_placement,
      tlaVariant: row.tla_variant,
      tlaMaterial: row.tla_material,
      tlaLocation: row.tla_location,
      tlaPartner: row.tla_partner,
      isDisabled: Boolean(row.is_disabled),
      clickCount: Number(row.click_count || 0),
      uniqueVisitorCount: Number(row.unique_visitor_count || 0),
      campaignName: campaign?.name ?? (row.utm_campaign || null),
      campaignSlug: campaign?.slug ?? null,
      qrId: qr?.id ?? null,
      qrName: qr?.qr_name ?? null,
      qrSlug: qr?.slug ?? null,
      materialTarget: row.tla_material || qr?.material_target || null,
      scanCount: Number(qr?.scan_count || 0),
      hasQrRecord: Boolean(qr),
      conversionCount: conversionCountMap.get(row.id) ?? 0,
      qrSvgPreview: qrAssets.svg,
      qrDataUri: qrAssets.pngDataUri,
      isDeprecatedRoute
    });
  }

  return joinedLinks;
}

export async function listTrackableLinks(): Promise<AdvertisingLink[]> {
  const joined = await listTrackableLinksJoined();
  return joined.map(({ campaignName, campaignSlug, qrId, qrName, qrSlug, materialTarget, scanCount, hasQrRecord, conversionCount, qrSvgPreview, qrDataUri, isDeprecatedRoute, ...base }) => base);
}

export async function listQrCodes(): Promise<AdvertisingQrCode[]> {
  const supabase = getAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("advertising_qr_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to list QR codes:", error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    createdAt: row.created_at,
    linkId: row.link_id,
    qrName: row.qr_name,
    slug: row.slug,
    errorCorrectionLevel: row.error_correction_level || "H",
    printSuitable: Boolean(row.print_suitable),
    engravingSuitable: Boolean(row.engraving_suitable),
    materialTarget: row.material_target,
    scanCount: Number(row.scan_count || 0)
  }));
}

let mockLinkStore: AdvertisingLink = {
  id: "mock_lnk_business_card_test",
  createdAt: new Date().toISOString(),
  campaignId: "mock_cmp_business_card_test",
  linkName: "Business Card Test QR",
  slug: "business-card-test",
  destinationPath: "/legacy-prologue",
  utmSource: "business_card",
  utmMedium: "card_qr",
  utmCampaign: "business_card_test",
  utmContent: null,
  utmTerm: null,
  tlaChannel: null,
  tlaPlacement: null,
  tlaVariant: null,
  tlaMaterial: "Black Metal Business Card",
  tlaLocation: null,
  tlaPartner: null,
  isDisabled: false,
  clickCount: 0,
  uniqueVisitorCount: 0
};

export async function getTrackableLinkBySlug(slug: string): Promise<AdvertisingLink | null> {
  const supabase = getAdmin();
  if (!supabase) {
    if (slug.toLowerCase().trim() === mockLinkStore.slug) {
      return { ...mockLinkStore };
    }
    return null;
  }

  const { data, error } = await supabase
    .from("advertising_links")
    .select("*")
    .eq("slug", slug.toLowerCase().trim())
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    createdAt: data.created_at,
    campaignId: data.campaign_id,
    linkName: data.link_name,
    slug: data.slug,
    destinationPath: data.destination_path,
    utmSource: data.utm_source,
    utmMedium: data.utm_medium,
    utmCampaign: data.utm_campaign,
    utmContent: data.utm_content,
    utmTerm: data.utm_term,
    tlaChannel: data.tla_channel,
    tlaPlacement: data.tla_placement,
    tlaVariant: data.tla_variant,
    tlaMaterial: data.tla_material,
    tlaLocation: data.tla_location,
    tlaPartner: data.tla_partner,
    isDisabled: Boolean(data.is_disabled),
    clickCount: Number(data.click_count || 0),
    uniqueVisitorCount: Number(data.unique_visitor_count || 0)
  };
}

export async function updateTrackableLink(input: {
  id: string;
  linkName?: string;
  destinationPath?: string;
  campaignId?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  tlaMaterial?: string | null;
}): Promise<void> {
  const supabase = getAdmin();
  if (!supabase) {
    if (input.destinationPath !== undefined) mockLinkStore.destinationPath = input.destinationPath;
    if (input.linkName !== undefined) mockLinkStore.linkName = input.linkName;
    if (input.tlaMaterial !== undefined) mockLinkStore.tlaMaterial = input.tlaMaterial;
    return;
  }

  const updateData: Record<string, any> = {};
  if (input.linkName !== undefined) updateData.link_name = input.linkName.trim();
  if (input.destinationPath !== undefined) {
    let dest = input.destinationPath.trim();
    if (!dest.startsWith("/")) dest = `/${dest}`;
    updateData.destination_path = dest;
  }
  if (input.campaignId !== undefined) updateData.campaign_id = input.campaignId;
  if (input.utmSource !== undefined) updateData.utm_source = input.utmSource;
  if (input.utmMedium !== undefined) updateData.utm_medium = input.utmMedium;
  if (input.utmCampaign !== undefined) updateData.utm_campaign = input.utmCampaign;
  if (input.tlaMaterial !== undefined) updateData.tla_material = input.tlaMaterial;

  const { error } = await supabase
    .from("advertising_links")
    .update(updateData)
    .eq("id", input.id);

  if (error) {
    throw new Error(`Unable to update trackable link: ${error.message}`);
  }

  // Also update QR code material target if provided
  if (input.tlaMaterial !== undefined) {
    await supabase
      .from("advertising_qr_codes")
      .update({ material_target: input.tlaMaterial })
      .eq("link_id", input.id);
  }
}

export async function toggleLinkDisabled(linkId: string, isDisabled: boolean): Promise<void> {
  const supabase = getAdmin();
  if (!supabase) return;
  await supabase
    .from("advertising_links")
    .update({ is_disabled: isDisabled })
    .eq("id", linkId);
}

export async function recordLinkClick(linkId: string) {
  const supabase = getAdmin();
  if (!supabase) return;
  try {
    const { error } = await supabase.rpc("increment_link_click_count", { target_link_id: linkId });
    if (error) {
      throw error;
    }
  } catch {
    const { data } = await supabase.from("advertising_links").select("click_count").eq("id", linkId).single();
    if (data) {
      await supabase.from("advertising_links").update({ click_count: Number(data.click_count || 0) + 1 }).eq("id", linkId);
    }
  }
}

export async function createCampaign(input: {
  name: string;
  slug: string;
  platform: string;
  channel?: string | null;
  medium?: string | null;
  objective?: string | null;
  destinationUrl: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: AdvertisingCampaignStatus;
  budget?: number | null;
  actualCost?: number | null;
  impressions?: number;
  platformClicks?: number;
  targetAudience?: string | null;
  isPhysical?: boolean;
  placement?: string | null;
  geographicLocation?: string | null;
  partnerName?: string | null;
  creativeVariant?: string | null;
  offer?: string | null;
  notes?: string | null;
  campaignOwner?: string | null;
}): Promise<AdvertisingCampaign> {
  const supabase = getAdmin();
  if (!supabase) throw new Error("Supabase is not configured.");
  const cleanSlug = input.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

  const rowData = {
    name: input.name,
    slug: cleanSlug,
    platform: input.platform,
    channel: input.channel ?? null,
    medium: input.medium ?? null,
    objective: input.objective ?? null,
    destination_url: input.destinationUrl,
    start_date: input.startDate ?? null,
    end_date: input.endDate ?? null,
    status: input.status ?? "active",
    budget: input.budget ?? null,
    actual_cost: input.actualCost ?? null,
    impressions: input.impressions ?? 0,
    platform_clicks: input.platformClicks ?? 0,
    target_audience: input.targetAudience ?? null,
    is_physical: Boolean(input.isPhysical),
    placement: input.placement ?? null,
    geographic_location: input.geographicLocation ?? null,
    partner_name: input.partnerName ?? null,
    creative_variant: input.creativeVariant ?? null,
    offer: input.offer ?? null,
    notes: input.notes ?? null,
    campaign_owner: input.campaignOwner ?? null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("advertising_campaigns")
    .upsert(rowData, { onConflict: "slug" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to save campaign.");
  }

  return {
    id: data.id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    archivedAt: data.archived_at,
    name: data.name,
    slug: data.slug,
    platform: data.platform,
    channel: data.channel,
    medium: data.medium,
    objective: data.objective,
    destinationUrl: data.destination_url,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
    budget: data.budget ? Number(data.budget) : null,
    actualCost: data.actual_cost ? Number(data.actual_cost) : null,
    impressions: Number(data.impressions || 0),
    platformClicks: Number(data.platform_clicks || 0),
    manualLeads: Number(data.manual_leads || 0),
    manualSales: Number(data.manual_sales || 0),
    targetAudience: data.target_audience,
    isPhysical: Boolean(data.is_physical),
    placement: data.placement,
    geographicLocation: data.geographic_location,
    partnerName: data.partner_name,
    creativeVariant: data.creative_variant,
    offer: data.offer,
    notes: data.notes,
    campaignOwner: data.campaign_owner
  };
}

export async function createTrackableLink(input: {
  campaignId?: string | null;
  linkName: string;
  slug: string;
  destinationPath: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  tlaChannel?: string | null;
  tlaPlacement?: string | null;
  tlaVariant?: string | null;
  tlaMaterial?: string | null;
  tlaLocation?: string | null;
  tlaPartner?: string | null;
}): Promise<{ link: AdvertisingLink; qr: AdvertisingQrCode }> {
  const supabase = getAdmin();
  if (!supabase) throw new Error("Supabase is not configured.");
  const cleanSlug = input.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

  const linkRow = {
    campaign_id: input.campaignId ?? null,
    link_name: input.linkName,
    slug: cleanSlug,
    destination_path: input.destinationPath.startsWith("/") ? input.destinationPath : `/${input.destinationPath}`,
    utm_source: input.utmSource ?? null,
    utm_medium: input.utmMedium ?? null,
    utm_campaign: input.utmCampaign ?? null,
    utm_content: input.utmContent ?? null,
    utm_term: input.utmTerm ?? null,
    tla_channel: input.tlaChannel ?? null,
    tla_placement: input.tlaPlacement ?? null,
    tla_variant: input.tlaVariant ?? null,
    tla_material: input.tlaMaterial ?? null,
    tla_location: input.tlaLocation ?? null,
    tla_partner: input.tlaPartner ?? null
  };

  const { data: savedLink, error: linkError } = await supabase
    .from("advertising_links")
    .upsert(linkRow, { onConflict: "slug" })
    .select("*")
    .single();

  if (linkError || !savedLink) {
    throw new Error(linkError?.message || "Unable to save trackable link.");
  }

  const qrRow = {
    link_id: savedLink.id,
    qr_name: `${input.linkName} QR`,
    slug: `qr-${cleanSlug}`,
    error_correction_level: "H",
    print_suitable: true,
    engraving_suitable: true,
    material_target: input.tlaMaterial ?? null
  };

  const { data: savedQr, error: qrError } = await supabase
    .from("advertising_qr_codes")
    .upsert(qrRow, { onConflict: "slug" })
    .select("*")
    .single();

  if (qrError || !savedQr) {
    throw new Error(qrError?.message || "Unable to save QR code record.");
  }

  return {
    link: {
      id: savedLink.id,
      createdAt: savedLink.created_at,
      campaignId: savedLink.campaign_id,
      linkName: savedLink.link_name,
      slug: savedLink.slug,
      destinationPath: savedLink.destination_path,
      utmSource: savedLink.utm_source,
      utmMedium: savedLink.utm_medium,
      utmCampaign: savedLink.utm_campaign,
      utmContent: savedLink.utm_content,
      utmTerm: savedLink.utm_term,
      tlaChannel: savedLink.tla_channel,
      tlaPlacement: savedLink.tla_placement,
      tlaVariant: savedLink.tla_variant,
      tlaMaterial: savedLink.tla_material,
      tlaLocation: savedLink.tla_location,
      tlaPartner: savedLink.tla_partner,
      isDisabled: Boolean(savedLink.is_disabled),
      clickCount: Number(savedLink.click_count || 0),
      uniqueVisitorCount: Number(savedLink.unique_visitor_count || 0)
    },
    qr: {
      id: savedQr.id,
      createdAt: savedQr.created_at,
      linkId: savedQr.link_id,
      qrName: savedQr.qr_name,
      slug: savedQr.slug,
      errorCorrectionLevel: savedQr.error_correction_level || "H",
      printSuitable: Boolean(savedQr.print_suitable),
      engravingSuitable: Boolean(savedQr.engraving_suitable),
      materialTarget: savedQr.material_target,
      scanCount: Number(savedQr.scan_count || 0)
    }
  };
}

export async function listVisitorNotes(): Promise<Map<string, AnalyticsVisitorNote>> {
  const supabase = getAdmin();
  if (!supabase) return new Map();
  const { data, error } = await supabase
    .from("analytics_visitor_notes")
    .select("*");

  if (error) {
    console.error("Unable to list visitor notes:", error.message);
    return new Map();
  }

  const map = new Map<string, AnalyticsVisitorNote>();
  for (const row of data ?? []) {
    map.set(row.visitor_id, {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      visitorId: row.visitor_id,
      note: row.note,
      tags: Array.isArray(row.tags) ? row.tags : [],
      manualClassification: row.manual_classification,
      isIgnored: Boolean(row.is_ignored),
      isInternal: Boolean(row.is_internal),
      isBlocked: Boolean(row.is_blocked),
      createdBy: row.created_by
    });
  }

  return map;
}

export async function upsertVisitorNote(input: {
  visitorId: string;
  note?: string | null;
  tags?: string[];
  manualClassification?: "human" | "bot" | "internal" | "ignored" | null;
  isIgnored?: boolean;
  isInternal?: boolean;
  isBlocked?: boolean;
  createdBy?: string | null;
}): Promise<AnalyticsVisitorNote> {
  const supabase = getAdmin();
  if (!supabase) throw new Error("Supabase is not configured.");
  const rowData = {
    visitor_id: input.visitorId,
    note: input.note ?? null,
    tags: input.tags ?? [],
    manual_classification: input.manualClassification ?? null,
    is_ignored: Boolean(input.isIgnored),
    is_internal: Boolean(input.isInternal),
    is_blocked: Boolean(input.isBlocked),
    created_by: input.createdBy ?? null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("analytics_visitor_notes")
    .upsert(rowData, { onConflict: "visitor_id" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to save visitor note.");
  }

  return {
    id: data.id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    visitorId: data.visitor_id,
    note: data.note,
    tags: Array.isArray(data.tags) ? data.tags : [],
    manualClassification: data.manual_classification,
    isIgnored: Boolean(data.is_ignored),
    isInternal: Boolean(data.is_internal),
    isBlocked: Boolean(data.is_blocked),
    createdBy: data.created_by
  };
}

export async function recordConversion(input: {
  visitorId: string;
  sessionId?: string | null;
  conversionType: ConversionType;
  conversionValue?: number | null;
  firstTouchCampaignId?: string | null;
  latestTouchCampaignId?: string | null;
  linkId?: string | null;
  qrId?: string | null;
  details?: Record<string, any> | null;
}) {
  const supabase = getAdmin();
  if (!supabase) return;
  const { error } = await supabase.from("advertising_conversions").insert({
    visitor_id: input.visitorId,
    session_id: input.sessionId ?? null,
    conversion_type: input.conversionType,
    conversion_value: input.conversionValue ?? null,
    first_touch_campaign_id: input.firstTouchCampaignId ?? null,
    latest_touch_campaign_id: input.latestTouchCampaignId ?? null,
    link_id: input.linkId ?? null,
    qr_id: input.qrId ?? null,
    details: input.details ?? null
  });

  if (error) {
    console.error("Unable to record conversion:", error.message);
  }
}

export async function listConversions(): Promise<AdvertisingConversion[]> {
  const supabase = getAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("advertising_conversions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Unable to list conversions:", error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    createdAt: row.created_at,
    visitorId: row.visitor_id,
    sessionId: row.session_id,
    conversionType: row.conversion_type,
    conversionValue: row.conversion_value ? Number(row.conversion_value) : null,
    firstTouchCampaignId: row.first_touch_campaign_id,
    latestTouchCampaignId: row.latest_touch_campaign_id,
    linkId: row.link_id,
    qrId: row.qr_id,
    details: row.details
  }));
}

export function exportCampaignsCsv(campaigns: AdvertisingCampaign[]): string {
  const headers = [
    "Campaign ID",
    "Name",
    "Slug",
    "Platform",
    "Channel",
    "Medium",
    "Status",
    "Budget",
    "Cost",
    "Impressions",
    "Clicks",
    "Leads",
    "Sales",
    "Is Physical",
    "Created Date"
  ];

  const rows = campaigns.map((c) => [
    sanitizeCsvField(c.id),
    sanitizeCsvField(c.name),
    sanitizeCsvField(c.slug),
    sanitizeCsvField(c.platform),
    sanitizeCsvField(c.channel),
    sanitizeCsvField(c.medium),
    sanitizeCsvField(c.status),
    sanitizeCsvField(c.budget),
    sanitizeCsvField(c.actualCost),
    sanitizeCsvField(c.impressions),
    sanitizeCsvField(c.platformClicks),
    sanitizeCsvField(c.manualLeads),
    sanitizeCsvField(c.manualSales),
    sanitizeCsvField(c.isPhysical ? "Yes" : "No"),
    sanitizeCsvField(c.createdAt)
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
