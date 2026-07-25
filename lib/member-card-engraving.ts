import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import QRCode from "qrcode";
import * as opentype from "opentype.js";
import type { Font as OpenTypeFont, Path as OpenTypePath } from "opentype.js";
import { getSiteUrl } from "./qr";

type PublicProfile = {
  id: string;
  displayName: string;
  avatarPath: string | null;
  avatarUrl: string | null;
  updatedAt: string | null;
};

type ArchiveRow = {
  id: string;
  slug: string | null;
  archive_name: string | null;
  person_name: string | null;
  owner_id: string | null;
  memorial_mode: boolean | null;
  relationship_to_owner: string | null;
  legacy_activation_code: string | null;
  created_at: string;
};

type OwnerLookup = {
  id: string;
  email: string | null;
};

export type MemberCardEngravingSide = "front" | "back";

export type MemberCardEngravingCandidate = {
  archiveId: string;
  archiveSlug: string | null;
  archiveName: string | null;
  personName: string | null;
  ownerId: string;
  ownerEmail: string | null;
  profileDisplayName: string | null;
  archiveType: "Living archive" | "Memorial archive" | "Unknown";
  legacyActivationCode: string | null;
  qrDestination: string | null;
  createdAt: string;
  createdYear: number | null;
  frontMissingFields: string[];
  backMissingFields: string[];
  missingFields: string[];
  ready: boolean;
};

const FRONT_TEMPLATE_PATH = join(
  process.cwd(),
  "public",
  "images",
  "member-card",
  "member-card-front-engrave-only.png"
);

const BACK_TEMPLATE_PATH = join(
  process.cwd(),
  "public",
  "images",
  "member-card",
  "member-card-back-engrave-only.png"
);

const FRONT_TEMPLATE_WIDTH = 1573;
const FRONT_TEMPLATE_HEIGHT = 1000;
const BACK_TEMPLATE_WIDTH = 1580;
const BACK_TEMPLATE_HEIGHT = 995;

const OUTPUT_WIDTH = 2026;
const OUTPUT_HEIGHT = 1276;
const OUTPUT_DENSITY = 600;

// Standard CR80 Physical Metal Card dimensions in mm
export const CARD_WIDTH_MM = 85.6;
export const CARD_HEIGHT_MM = 53.98;
export const SAFE_MARGIN_MM = 2.0;

const FONT_DIR = join(process.cwd(), "assets", "fonts");

const NAME_FONT_PATH = join(
  FONT_DIR,
  "noto-serif-latin-700-normal.woff"
);

const YEAR_FONT_PATH = join(
  FONT_DIR,
  "noto-sans-mono-latin-700-normal.woff"
);

const CODE_FONT_PATH = YEAR_FONT_PATH;

const TEMPLATE_CACHE = new Map<string, Promise<Buffer>>();
const FONT_CACHE = new Map<string, Promise<OpenTypeFont>>();
const GUIDE_HORIZONTAL_PADDING_RATIO = 0.04;
const GUIDE_VERTICAL_PADDING_RATIO = 0.08;

type TextBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TextFitOptions = {
  box: TextBox;
  text: string;
  font: OpenTypeFont;
  maxFontSize: number;
  minFontSize: number;
  maxLines: number;
  letterSpacing: number;
  allowWrap: boolean;
  horizontalPaddingRatio?: number;
  verticalPaddingRatio?: number;
};

type TextLinePath = {
  text: string;
  path: OpenTypePath;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  width: number;
  height: number;
};

type FittedTextLayout = {
  fontSize: number;
  letterSpacing: number;
  lines: string[];
  linePaths: TextLinePath[];
  usableBox: TextBox;
  blockWidth: number;
  blockHeight: number;
};

type OverlayConfig = {
  frontNameBox: TextBox;
  memberSinceBox: TextBox;
  qrBox: TextBox;
  activationCodeBox: TextBox;
};

const FRONT_MEMBER_CARD_BOX: TextBox = { x: 644, y: 400, width: 850, height: 169 };
const FRONT_MEMBER_SINCE_BOX: TextBox = { x: 741, y: 780, width: 246, height: 97 };
const BACK_QR_GUIDE_BOX: TextBox = { x: 1229, y: 400, width: 483, height: 434 };
const BACK_ACTIVATION_CODE_BOX: TextBox = { x: 1123, y: 1017, width: 714, height: 125 };

const FRONT_OVERLAY: OverlayConfig = {
  frontNameBox: FRONT_MEMBER_CARD_BOX,
  memberSinceBox: FRONT_MEMBER_SINCE_BOX,
  qrBox: BACK_QR_GUIDE_BOX,
  activationCodeBox: BACK_ACTIVATION_CODE_BOX
};

const BACK_OVERLAY: OverlayConfig = FRONT_OVERLAY;

function trimText(value: string | null | undefined) {
  return value ? value.trim() : "";
}

function sanitizeText(value: string | null | undefined) {
  return trimText(value)
    .normalize("NFKC")
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ");
}

async function loadFont(filePath: string): Promise<OpenTypeFont> {
  const cached = FONT_CACHE.get(filePath);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const buffer = await readFile(filePath);
    const opentypeModule = opentype as any;
    const parseFn = opentypeModule.parse || opentypeModule.default?.parse;
    const font = parseFn(buffer);

    if (!font || typeof font.stringToGlyphs !== "function") {
      throw new Error(`Member card font asset missing or unreadable: ${filePath}.`);
    }

    return font as OpenTypeFont;
  })();

  promise.catch(() => {
    FONT_CACHE.delete(filePath);
  });

  FONT_CACHE.set(filePath, promise);
  return promise;
}

function buildTextLinePath(
  text: string,
  font: OpenTypeFont,
  fontSize: number,
  letterSpacing: number
) {
  const sanitized = sanitizeText(text);
  const fontAny = font as any;
  const opentypeModule = opentype as any;
  const PathClass = opentypeModule.Path || opentypeModule.default?.Path;
  const path = new PathClass();
  const glyphs = fontAny.stringToGlyphs(sanitized);
  const scale = fontSize / fontAny.unitsPerEm;
  let cursorX = 0;
  let previousGlyph: any = null;

  for (const glyph of glyphs) {
    if (previousGlyph) {
      cursorX += fontAny.getKerningValue(previousGlyph, glyph) * scale;
    }

    const glyphPath = glyph.getPath(cursorX, 0, fontSize);
    path.extend(glyphPath);
    cursorX += glyph.advanceWidth * scale + letterSpacing;
    previousGlyph = glyph;
  }

  const bbox = path.getBoundingBox();

  return {
    text: sanitized,
    path,
    bbox: {
      x1: bbox.x1,
      y1: bbox.y1,
      x2: bbox.x2,
      y2: bbox.y2
    },
    width: bbox.x2 - bbox.x1,
    height: bbox.y2 - bbox.y1
  };
}

function getUsableBox(box: TextBox, horizontalPaddingRatio = GUIDE_HORIZONTAL_PADDING_RATIO, verticalPaddingRatio = GUIDE_VERTICAL_PADDING_RATIO): TextBox {
  const horizontalPadding = box.width * horizontalPaddingRatio;
  const verticalPadding = box.height * verticalPaddingRatio;

  return {
    x: box.x + horizontalPadding,
    y: box.y + verticalPadding,
    width: Math.max(0, box.width - horizontalPadding * 2),
    height: Math.max(0, box.height - verticalPadding * 2)
  };
}

function fitTextToBox(input: TextFitOptions): FittedTextLayout {
  const {
    box,
    text,
    font,
    maxFontSize,
    minFontSize,
    maxLines,
    letterSpacing,
    allowWrap,
    horizontalPaddingRatio = GUIDE_HORIZONTAL_PADDING_RATIO,
    verticalPaddingRatio = GUIDE_VERTICAL_PADDING_RATIO
  } = input;

  const usableBox = getUsableBox(box, horizontalPaddingRatio, verticalPaddingRatio);
  const sanitized = sanitizeText(text);
  const spacingCandidates = Array.from(
    new Set(
      [letterSpacing, letterSpacing * 0.75, letterSpacing * 0.5, letterSpacing * 0.25, 0].map(
        (value) => Number(value.toFixed(2))
      )
    )
  ).sort((a, b) => b - a);

  function wrapLines(fontSize: number, spacing: number) {
    const words = sanitized.split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      return [] as string[];
    }

    if (!allowWrap || maxLines <= 1 || words.length === 1) {
      return [sanitized];
    }

    if (maxLines === 2) {
      const oneLineWidth = buildTextLinePath(sanitized, font, fontSize, spacing).width;
      if (oneLineWidth <= usableBox.width) {
        return [sanitized];
      }

      let bestSplit: string[] | null = null;
      let bestScore = Number.POSITIVE_INFINITY;

      for (let splitIndex = 1; splitIndex < words.length; splitIndex += 1) {
        const left = words.slice(0, splitIndex).join(" ");
        const right = words.slice(splitIndex).join(" ");
        const leftWidth = buildTextLinePath(left, font, fontSize, spacing).width;
        const rightWidth = buildTextLinePath(right, font, fontSize, spacing).width;

        if (leftWidth > usableBox.width || rightWidth > usableBox.width) {
          continue;
        }

        const score = Math.max(leftWidth, rightWidth);
        if (score < bestScore) {
          bestScore = score;
          bestSplit = [left, right];
        }
      }

      return bestSplit ?? [sanitized];
    }

    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      const nextWidth = buildTextLinePath(next, font, fontSize, spacing).width;

      if (nextWidth <= usableBox.width) {
        current = next;
        continue;
      }

      if (current) {
        lines.push(current);
      }

      current = word;

      if (lines.length >= maxLines) {
        break;
      }
    }

    if (current && lines.length < maxLines) {
      lines.push(current);
    }

    return lines;
  }

  function measureLayout(fontSize: number, spacing: number) {
    const lines = wrapLines(fontSize, spacing);
    const linePaths = lines.map((line) => buildTextLinePath(line, font, fontSize, spacing));
    const lineGap = Math.max(0, fontSize * 0.12);
    const blockWidth = Math.max(...linePaths.map((line) => line.width), 0);
    const blockHeight =
      linePaths.reduce((sum, line) => sum + line.height, 0) + lineGap * Math.max(0, linePaths.length - 1);

    return {
      lines,
      linePaths,
      blockWidth,
      blockHeight
    };
  }

  function fits(fontSize: number, spacing: number) {
    const layout = measureLayout(fontSize, spacing);
    return (
      layout.blockWidth <= usableBox.width &&
      layout.blockHeight <= usableBox.height &&
      layout.lines.length <= maxLines
    );
  }

  let chosen: FittedTextLayout | null = null;
  let low = minFontSize;
  let high = maxFontSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    let matched = false;

    for (const spacing of spacingCandidates) {
      if (fits(mid, spacing)) {
        chosen = {
          fontSize: mid,
          letterSpacing: spacing,
          ...measureLayout(mid, spacing),
          usableBox
        };
        matched = true;
        break;
      }
    }

    if (matched) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (!chosen) {
    const fallbackSpacing = spacingCandidates[spacingCandidates.length - 1] ?? 0;
    const fallbackLayout = measureLayout(minFontSize, fallbackSpacing);
    chosen = {
      fontSize: minFontSize,
      letterSpacing: fallbackSpacing,
      ...fallbackLayout,
      usableBox
    };
  }

  return chosen;
}

function assertRenderableText(text: string, font: OpenTypeFont, label: string) {
  for (const character of Array.from(text)) {
    if (/\s/.test(character)) {
      continue;
    }

    const glyph = font.charToGlyph(character);
    if (!glyph || glyph.name === ".notdef") {
      throw new Error(`Unsupported character in ${label}: ${character}`);
    }
  }
}

function renderPathElement(path: OpenTypePath, transform?: string) {
  return `<path d="${path.toPathData(2)}" fill="#000000"${transform ? ` transform="${transform}"` : ""}/>`;
}

function renderTextPathsInBox(input: {
  box: TextBox;
  text: string;
  maxFontSize: number;
  minFontSize: number;
  maxLines: number;
  font: OpenTypeFont;
  letterSpacing: number;
  allowWrap: boolean;
  lineGap?: number;
}) {
  const { box, text, maxFontSize, minFontSize, maxLines, font, letterSpacing, allowWrap } = input;

  const fit = fitTextToBox({
    box,
    text,
    maxFontSize,
    minFontSize,
    maxLines,
    font,
    letterSpacing,
    allowWrap
  });

  if (fit.lines.length === 0) {
    return "";
  }

  const lineGap = Math.max(0, fit.fontSize * 0.12);
  let cursorY = fit.usableBox.y + (fit.usableBox.height - fit.blockHeight) / 2;

  return fit.linePaths
    .map(({ path, bbox, width, height }) => {
      const centerX = bbox.x1 + width / 2;
      const centerY = bbox.y1 + height / 2;
      const targetX = fit.usableBox.x + fit.usableBox.width / 2;
      const targetY = cursorY + height / 2;
      cursorY += height + lineGap;

      return renderPathElement(
        path,
        `translate(${(targetX - centerX).toFixed(2)} ${(targetY - centerY).toFixed(2)})`
      );
    })
    .join("");
}

function renderOverlaySvg(input: {
  width: number;
  height: number;
  body: string;
}) {
  const { width, height, body } = input;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${body}
</svg>`;
}

async function loadTemplateBuffer(filePath: string) {
  const cached = TEMPLATE_CACHE.get(filePath);
  if (cached) {
    return cached;
  }

  const promise = readFile(filePath);
  TEMPLATE_CACHE.set(filePath, promise);
  return promise;
}

function getMissingFields(candidate: {
  profileDisplayName: string | null;
  archiveName: string | null;
  createdYear: number | null;
  archiveSlug: string | null;
  legacyActivationCode: string | null;
}) {
  const frontMissingFields: string[] = [];
  const backMissingFields: string[] = [];

  if (!candidate.profileDisplayName) {
    frontMissingFields.push("Missing display name");
  }

  if (!candidate.archiveName) {
    frontMissingFields.push("Missing archive name");
    backMissingFields.push("Missing archive name");
  }

  if (!candidate.createdYear) {
    frontMissingFields.push("Missing member since year");
  }

  if (!candidate.archiveSlug) {
    backMissingFields.push("Missing archive slug");
    backMissingFields.push("Missing QR destination");
  }

  if (!candidate.legacyActivationCode) {
    backMissingFields.push("Missing activation code");
  }

  return {
    frontMissingFields,
    backMissingFields
  };
}

function getArchiveTypeLabel(memorialMode: boolean | null) {
  if (memorialMode === true) {
    return "Memorial archive";
  }

  if (memorialMode === false) {
    return "Living archive";
  }

  return "Unknown";
}

async function loadOwnerLookup(ownerId: string): Promise<OwnerLookup> {
  const { createAdminClient } = require("./supabase/admin");
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.getUserById(ownerId);

  return {
    id: ownerId,
    email: error ? null : data.user?.email ?? null
  };
}

function buildCandidateRecord(
  row: ArchiveRow,
  owner: OwnerLookup,
  profile: PublicProfile | null
): MemberCardEngravingCandidate {
  const archiveSlug = sanitizeText(row.slug);
  const archiveName = sanitizeText(row.archive_name);
  const personName = sanitizeText(row.person_name);
  const profileDisplayName = sanitizeText(profile?.displayName);
  const legacyActivationCode = sanitizeText(row.legacy_activation_code);
  const createdYear = row.created_at ? new Date(row.created_at).getFullYear() : null;
  const qrDestination = archiveSlug ? `${getSiteUrl()}/archive/${archiveSlug}` : null;
  const { frontMissingFields, backMissingFields } = getMissingFields({
    profileDisplayName: profileDisplayName || null,
    archiveName: archiveName || null,
    createdYear: Number.isFinite(createdYear) ? createdYear : null,
    archiveSlug: archiveSlug || null,
    legacyActivationCode: legacyActivationCode || null
  });

  const missingFields = [...new Set([...frontMissingFields, ...backMissingFields])];

  return {
    archiveId: row.id,
    archiveSlug: archiveSlug || null,
    archiveName: archiveName || null,
    personName: personName || null,
    ownerId: row.owner_id || owner.id,
    ownerEmail: owner.email,
    profileDisplayName: profileDisplayName || null,
    archiveType: getArchiveTypeLabel(row.memorial_mode),
    legacyActivationCode: legacyActivationCode || null,
    qrDestination,
    createdAt: row.created_at,
    createdYear: Number.isFinite(createdYear) ? createdYear : null,
    frontMissingFields,
    backMissingFields,
    missingFields,
    ready: frontMissingFields.length === 0 && backMissingFields.length === 0
  };
}

export async function listMemberCardEngravingCandidates(query?: string) {
  const { createAdminClient } = require("./supabase/admin");
  const { loadProfilesByUserIds } = require("./profiles");
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("archives")
    .select(
      "id, slug, archive_name, person_name, owner_id, memorial_mode, relationship_to_owner, legacy_activation_code, created_at"
    )
    .eq("relationship_to_owner", "self")
    .eq("memorial_mode", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ArchiveRow[];
  const ownerIds = [...new Set(rows.map((row) => row.owner_id).filter(Boolean))] as string[];
  const profiles = await loadProfilesByUserIds(ownerIds);
  const ownerLookups = await Promise.all(
    ownerIds.map(async (ownerId) => ({
      ownerId,
      owner: await loadOwnerLookup(ownerId),
      profile: (profiles as Map<string, PublicProfile>).get(ownerId) ?? null
    }))
  );

  const ownerMap = new Map<string, OwnerLookup>(
    ownerLookups.map(({ owner }) => [owner.id, owner])
  );
  const profileMap = new Map<string, PublicProfile | null>(
    ownerLookups.map(({ ownerId, profile }) => [ownerId, profile])
  );

  let candidates = rows.map((row) =>
    buildCandidateRecord(
      row,
      ownerMap.get(row.owner_id || "") ?? { id: row.owner_id || "", email: null },
      profileMap.get(row.owner_id || "") ?? null
    )
  );

  const normalizedQuery = query?.trim().toLowerCase();

  if (normalizedQuery) {
    candidates = candidates.filter((candidate) => {
      const haystack = [
        candidate.profileDisplayName,
        candidate.personName,
        candidate.archiveName,
        candidate.archiveSlug,
        candidate.ownerEmail,
        candidate.archiveType
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }

  return candidates;
}

export async function getMemberCardEngravingCandidate(archiveId: string) {
  const { createAdminClient } = require("./supabase/admin");
  const { loadProfilesByUserIds } = require("./profiles");
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("archives")
    .select(
      "id, slug, archive_name, person_name, owner_id, memorial_mode, relationship_to_owner, legacy_activation_code, created_at"
    )
    .eq("id", archiveId)
    .eq("relationship_to_owner", "self")
    .eq("memorial_mode", false)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as ArchiveRow;

  if (!row.owner_id) {
    return null;
  }

  const [profiles, owner] = await Promise.all([
    loadProfilesByUserIds([row.owner_id]),
    loadOwnerLookup(row.owner_id)
  ]);

  return buildCandidateRecord(row, owner, (profiles as Map<string, PublicProfile>).get(row.owner_id) ?? null);
}

async function generateQrOverlay(value: string, box: TextBox) {
  const qrSvg = await QRCode.toString(value, {
    type: "svg",
    margin: 4,
    width: Math.max(1, Math.round(box.width)),
    color: {
      dark: "#000000",
      light: "#ffffff"
    }
  });

  const viewBoxMatch = qrSvg.match(/viewBox="([^"]+)"/i);
  const viewBox = viewBoxMatch?.[1] || "0 0 33 33";
  const [, , viewBoxWidth] = viewBox.split(/\s+/).map((value) => Number(value));
  const scale = Number.isFinite(viewBoxWidth) && viewBoxWidth > 0 ? box.width / viewBoxWidth : 1;
  const inner = qrSvg
    .replace(/<\?xml[^>]*>/i, "")
    .replace(/<!DOCTYPE[^>]*>/i, "")
    .replace(/^<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "");

  return `<g transform="translate(${box.x} ${box.y}) scale(${scale})" aria-label="Archive QR code">${inner}</g>`;
}

function scaleBox(box: TextBox, scaleX: number, scaleY: number): TextBox {
  return {
    x: Math.round(box.x * scaleX),
    y: Math.round(box.y * scaleY),
    width: Math.round(box.width * scaleX),
    height: Math.round(box.height * scaleY)
  };
}

function centerSquareBox(box: TextBox, insetRatio = 0): TextBox {
  const insetWidth = box.width * insetRatio;
  const insetHeight = box.height * insetRatio;
  const innerWidth = Math.max(0, box.width - insetWidth * 2);
  const innerHeight = Math.max(0, box.height - insetHeight * 2);
  const size = Math.max(0, Math.min(innerWidth, innerHeight));
  const x = Math.round(box.x + (box.width - size) / 2);
  const y = Math.round(box.y + (box.height - size) / 2);

  return {
    x,
    y,
    width: Math.round(size),
    height: Math.round(size)
  };
}

async function buildFrontOverlay(candidate: MemberCardEngravingCandidate) {
  if (!candidate.profileDisplayName || !candidate.archiveName || !candidate.createdYear) {
    throw new Error(
      `Missing required front-side data: ${candidate.frontMissingFields.join(", ")}`
    );
  }

  const scaleX = OUTPUT_WIDTH / FRONT_TEMPLATE_WIDTH;
  const scaleY = OUTPUT_HEIGHT / FRONT_TEMPLATE_HEIGHT;
  const nameBox = scaleBox(FRONT_OVERLAY.frontNameBox, scaleX, scaleY);
  const yearBox = scaleBox(FRONT_OVERLAY.memberSinceBox, scaleX, scaleY);
  const displayName = sanitizeText(candidate.profileDisplayName);
  const yearText = `${candidate.createdYear}`;
  const nameFont = await loadFont(NAME_FONT_PATH);
  const yearFont = await loadFont(YEAR_FONT_PATH);
  assertRenderableText(displayName, nameFont, "member display name");
  assertRenderableText(yearText, yearFont, "member-since year");

  return renderOverlaySvg({
    width: OUTPUT_WIDTH,
    height: OUTPUT_HEIGHT,
    body: `
      ${renderTextPathsInBox({
        box: nameBox,
        text: displayName,
        maxFontSize: Math.round(120 * scaleY),
        minFontSize: Math.round(52 * scaleY),
        maxLines: 2,
        font: nameFont,
        letterSpacing: 0,
        allowWrap: true
      })}
      ${renderTextPathsInBox({
        box: yearBox,
        text: yearText,
        maxFontSize: Math.round(64 * scaleY),
        minFontSize: Math.round(34 * scaleY),
        maxLines: 1,
        font: yearFont,
        letterSpacing: 0,
        allowWrap: false
      })}
    `
  });
}

async function buildBackOverlay(candidate: MemberCardEngravingCandidate) {
  if (!candidate.archiveName || !candidate.archiveSlug || !candidate.legacyActivationCode || !candidate.qrDestination) {
    throw new Error(
      `Missing required back-side data: ${candidate.backMissingFields.join(", ")}`
    );
  }

  const qrGuideBox = BACK_OVERLAY.qrBox;
  const qrBox = centerSquareBox(qrGuideBox);
  const activationBox = BACK_OVERLAY.activationCodeBox;
  const activationFont = await loadFont(CODE_FONT_PATH);
  const activationCode = sanitizeText(candidate.legacyActivationCode);
  assertRenderableText(activationCode, activationFont, "legacy activation code");
  const qrOverlay = await generateQrOverlay(candidate.qrDestination, qrBox);

  return renderOverlaySvg({
    width: OUTPUT_WIDTH,
    height: OUTPUT_HEIGHT,
    body: `
      ${qrOverlay}
      ${renderTextPathsInBox({
        box: activationBox,
        text: activationCode,
        maxFontSize: 54,
        minFontSize: 24,
        maxLines: 1,
        font: activationFont,
        letterSpacing: 0.1,
        allowWrap: false
      })}
    `
  });
}

async function flattenMemberCardPng(
  candidate: MemberCardEngravingCandidate,
  side: MemberCardEngravingSide
) {
  const templatePath = side === "front" ? FRONT_TEMPLATE_PATH : BACK_TEMPLATE_PATH;
  const templateBuffer = await loadTemplateBuffer(templatePath);
  const template = sharp(templateBuffer).resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, {
    fit: "fill"
  });

  if (side === "back") {
    const back = await buildBackOverlay(candidate);

    return template
      .composite([{ input: Buffer.from(back) }])
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .withMetadata({ density: OUTPUT_DENSITY })
      .toBuffer();
  }

  const overlaySvg = await buildFrontOverlay(candidate);
  return template
    .composite([{ input: Buffer.from(overlaySvg) }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .withMetadata({ density: OUTPUT_DENSITY })
    .toBuffer();
}

export async function buildMemberCardEngravingPng(
  candidate: MemberCardEngravingCandidate,
  side: MemberCardEngravingSide
) {
  return flattenMemberCardPng(candidate, side);
}

export async function buildMemberCardEngravingSvg(
  candidate: MemberCardEngravingCandidate,
  side: MemberCardEngravingSide
): Promise<string> {
  const scaleX = CARD_WIDTH_MM / FRONT_TEMPLATE_WIDTH;
  const scaleY = CARD_HEIGHT_MM / FRONT_TEMPLATE_HEIGHT;

  if (side === "front") {
    if (!candidate.profileDisplayName || !candidate.archiveName || !candidate.createdYear) {
      throw new Error(
        `Missing required front-side data: ${candidate.frontMissingFields.join(", ")}`
      );
    }

    const nameBox = scaleBox(FRONT_OVERLAY.frontNameBox, scaleX, scaleY);
    const yearBox = scaleBox(FRONT_OVERLAY.memberSinceBox, scaleX, scaleY);
    const displayName = sanitizeText(candidate.profileDisplayName);
    const yearText = `${candidate.createdYear}`;
    const nameFont = await loadFont(NAME_FONT_PATH);
    const yearFont = await loadFont(YEAR_FONT_PATH);
    assertRenderableText(displayName, nameFont, "member display name");
    assertRenderableText(yearText, yearFont, "member-since year");

    const namePaths = renderTextPathsInBox({
      box: nameBox,
      text: displayName,
      maxFontSize: 6.5,
      minFontSize: 2.8,
      maxLines: 2,
      font: nameFont,
      letterSpacing: 0,
      allowWrap: true
    });

    const yearPaths = renderTextPathsInBox({
      box: yearBox,
      text: yearText,
      maxFontSize: 3.5,
      minFontSize: 1.8,
      maxLines: 1,
      font: yearFont,
      letterSpacing: 0,
      allowWrap: false
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="85.6mm" height="53.98mm" viewBox="0 0 85.6 53.98">
  <g id="front-engraving-layer">
    ${namePaths}
    ${yearPaths}
  </g>
</svg>`;
  }

  if (!candidate.archiveName || !candidate.archiveSlug || !candidate.legacyActivationCode || !candidate.qrDestination) {
    throw new Error(
      `Missing required back-side data: ${candidate.backMissingFields.join(", ")}`
    );
  }

  const qrScaleX = CARD_WIDTH_MM / BACK_TEMPLATE_WIDTH;
  const qrScaleY = CARD_HEIGHT_MM / BACK_TEMPLATE_HEIGHT;
  const qrGuideBox = scaleBox(BACK_OVERLAY.qrBox, qrScaleX, qrScaleY);
  const qrBox = centerSquareBox(qrGuideBox);
  const activationBox = scaleBox(BACK_OVERLAY.activationCodeBox, qrScaleX, qrScaleY);

  const activationFont = await loadFont(CODE_FONT_PATH);
  const activationCode = sanitizeText(candidate.legacyActivationCode);
  assertRenderableText(activationCode, activationFont, "legacy activation code");

  const qrOverlay = await generateQrOverlay(candidate.qrDestination, qrBox);
  const activationPaths = renderTextPathsInBox({
    box: activationBox,
    text: activationCode,
    maxFontSize: 3.0,
    minFontSize: 1.3,
    maxLines: 1,
    font: activationFont,
    letterSpacing: 0.005,
    allowWrap: false
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="85.6mm" height="53.98mm" viewBox="0 0 85.6 53.98">
  <g id="back-engraving-layer">
    ${qrOverlay}
    ${activationPaths}
  </g>
</svg>`;
}

export async function buildMemberCardEngravingDataUri(
  candidate: MemberCardEngravingCandidate,
  side: MemberCardEngravingSide
) {
  const buffer = await buildMemberCardEngravingPng(candidate, side);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export function getMemberCardEngravingFilename(
  candidate: MemberCardEngravingCandidate,
  side: MemberCardEngravingSide,
  format: "png" | "svg" = "png"
) {
  const source = candidate.archiveSlug || candidate.archiveName || candidate.archiveId;
  const safe = source
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  const base = safe || "member-card";
  return `life-archive-member-card-${side}-${base}.${format}`;
}
