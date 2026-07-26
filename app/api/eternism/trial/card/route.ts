import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import {
  DIMENSION_LABELS,
  EternismDimensionKey,
  ResultArchetype
} from "@/lib/eternism-trial";

const VALID_ARCHETYPES: Set<string> = new Set<ResultArchetype>([
  "The Unprotected Self",
  "The Sleeping Giant",
  "The Unfinished Builder",
  "The Conscious Rebel",
  "The Future Architect",
  "The Formidable One"
]);

const VALID_DIMENSIONS: Set<string> = new Set<EternismDimensionKey>([
  "physical",
  "mental",
  "moral",
  "creative",
  "spiritual",
  "conscious_evolution"
]);

function sanitizeDisplayName(input?: string | null): string {
  if (!input) return "An Eternist";
  // Strip tags, control chars, limit length to 24 chars
  const sanitized = input
    .replace(/[<>&"']/g, "")
    .replace(/[\r\n\t]/g, " ")
    .trim();
  if (!sanitized) return "An Eternist";
  return sanitized.slice(0, 24);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const rawScore = parseInt(searchParams.get("score") || "50", 10);
  const rawArchetype = searchParams.get("archetype") || "";
  const rawStrongest = searchParams.get("strongest") || "";
  const rawGrowth = searchParams.get("growth") || "";
  const rawName = searchParams.get("name") || "";
  const format = searchParams.get("format") === "square" ? "square" : "portrait";
  const outputType = searchParams.get("type") === "svg" ? "svg" : "png";

  // Strict Validation & Clamping
  if (isNaN(rawScore) || rawScore < 0 || rawScore > 100) {
    return new NextResponse("Invalid score parameter. Must be an integer between 0 and 100.", { status: 400 });
  }

  const score = Math.min(100, Math.max(0, rawScore));
  const archetype: ResultArchetype = VALID_ARCHETYPES.has(rawArchetype as ResultArchetype)
    ? (rawArchetype as ResultArchetype)
    : "The Unfinished Builder";

  const strongest: EternismDimensionKey = VALID_DIMENSIONS.has(rawStrongest as EternismDimensionKey)
    ? (rawStrongest as EternismDimensionKey)
    : "physical";

  const growth: EternismDimensionKey = VALID_DIMENSIONS.has(rawGrowth as EternismDimensionKey)
    ? (rawGrowth as EternismDimensionKey)
    : "mental";

  const displayName = sanitizeDisplayName(rawName);

  const width = 1080;
  const height = format === "square" ? 1080 : 1920;

  const strongestLabel = DIMENSION_LABELS[strongest];
  const growthLabel = DIMENSION_LABELS[growth];

  const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#090807" />
          <stop offset="50%" stop-color="#14120f" />
          <stop offset="100%" stop-color="#050403" />
        </linearGradient>
        <radialGradient id="goldGlow" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#D6AD5A" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#D6AD5A" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <rect width="${width}" height="${height}" fill="url(#goldGlow)" />

      <!-- Outer Decorative Border -->
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="#D6AD5A" stroke-width="2" stroke-opacity="0.4" />
      <rect x="52" y="52" width="${width - 104}" height="${height - 104}" fill="none" stroke="#D6AD5A" stroke-width="1" stroke-opacity="0.2" />

      <!-- Header Brand -->
      <text x="${width / 2}" y="${format === "square" ? 130 : 200}" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#D6AD5A" letter-spacing="6" text-anchor="middle">THE LIFE ARCHIVE</text>
      <text x="${width / 2}" y="${format === "square" ? 170 : 250}" font-family="Georgia, serif" font-size="36" font-weight="normal" fill="#F4EFE6" letter-spacing="4" text-anchor="middle">ETERNISM TRIAL</text>
      <line x1="${width / 2 - 120}" y1="${format === "square" ? 195 : 285}" x2="${width / 2 + 120}" y2="${format === "square" ? 195 : 285}" stroke="#D6AD5A" stroke-width="1.5" stroke-opacity="0.6" />

      <!-- Subject Name -->
      <text x="${width / 2}" y="${format === "square" ? 270 : 420}" font-family="sans-serif" font-size="28" font-weight="500" fill="#D8D2C7" opacity="0.8" text-anchor="middle">${displayName}</text>

      <!-- Score Ring & Number -->
      <circle cx="${width / 2}" cy="${format === "square" ? 440 : 660}" r="${format === "square" ? 110 : 160}" fill="none" stroke="#D6AD5A" stroke-width="3" stroke-opacity="0.3" />
      <circle cx="${width / 2}" cy="${format === "square" ? 440 : 660}" r="${format === "square" ? 100 : 148}" fill="none" stroke="#D6AD5A" stroke-width="6" stroke-dasharray="${(score / 100) * 930} 930" stroke-linecap="round" />
      
      <text x="${width / 2}" y="${format === "square" ? 440 : 655}" font-family="Georgia, serif" font-size="${format === "square" ? 72 : 108}" font-weight="bold" fill="#D6AD5A" text-anchor="middle">${score}</text>
      <text x="${width / 2}" y="${format === "square" ? 485 : 720}" font-family="sans-serif" font-size="${format === "square" ? 18 : 22}" fill="#D8D2C7" opacity="0.7" text-anchor="middle">OVERALL RESILIENCE SCORE</text>

      <!-- Archetype -->
      <text x="${width / 2}" y="${format === "square" ? 620 : 960}" font-family="Georgia, serif" font-size="${format === "square" ? 40 : 54}" font-weight="bold" fill="#F4EFE6" letter-spacing="2" text-anchor="middle">${archetype}</text>
      <text x="${width / 2}" y="${format === "square" ? 660 : 1015}" font-family="sans-serif" font-size="20" fill="#D6AD5A" letter-spacing="2" text-anchor="middle">RESULT ARCHETYPE</text>

      <!-- Dimension Metrics -->
      <g transform="translate(0, ${format === "square" ? 720 : 1150})">
        <!-- Strongest -->
        <rect x="${width / 2 - 380}" y="0" width="350" height="110" fill="#14120f" stroke="#D6AD5A" stroke-width="1" stroke-opacity="0.3" rx="8" />
        <text x="${width / 2 - 205}" y="35" font-family="sans-serif" font-size="14" fill="#D6AD5A" letter-spacing="2" text-anchor="middle">STRONGEST DIMENSION</text>
        <text x="${width / 2 - 205}" y="75" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#F4EFE6" text-anchor="middle">${strongestLabel}</text>

        <!-- Growth Edge -->
        <rect x="${width / 2 + 30}" y="0" width="350" height="110" fill="#14120f" stroke="#D6AD5A" stroke-width="1" stroke-opacity="0.3" rx="8" />
        <text x="${width / 2 + 205}" y="35" font-family="sans-serif" font-size="14" fill="#D6AD5A" letter-spacing="2" text-anchor="middle">GROWTH EDGE</text>
        <text x="${width / 2 + 205}" y="75" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#F4EFE6" text-anchor="middle">${growthLabel}</text>
      </g>

      ${format === "portrait" ? `
        <!-- Quote Tagline -->
        <text x="${width / 2}" y="1460" font-family="Georgia, serif" font-size="24" font-style="italic" fill="#D8D2C7" opacity="0.85" text-anchor="middle">“Eternism is the practice of becoming harder to destroy.”</text>
      ` : ""}

      <!-- Footer CTA & Domain -->
      <line x1="${width / 2 - 200}" y1="${height - 180}" x2="${width / 2 + 200}" y2="${height - 180}" stroke="#D6AD5A" stroke-width="1" stroke-opacity="0.4" />
      <text x="${width / 2}" y="${height - 130}" font-family="sans-serif" font-size="20" font-weight="bold" fill="#D6AD5A" letter-spacing="3" text-anchor="middle">TAKE THE ETERNISM TRIAL</text>
      <text x="${width / 2}" y="${height - 90}" font-family="sans-serif" font-size="18" fill="#D8D2C7" opacity="0.75" letter-spacing="1" text-anchor="middle">thelifearchive.vip/eternism/trial</text>
    </svg>
  `;

  if (outputType === "svg") {
    return new NextResponse(svgOverlay, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400"
      }
    });
  }

  // Convert SVG to PNG using sharp
  const pngBuffer = await sharp(Buffer.from(svgOverlay))
    .png()
    .toBuffer();

  return new NextResponse(pngBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400"
    }
  });
}
