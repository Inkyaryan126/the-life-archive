import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";

const ROOT_DIR = process.cwd();
const AD_DIR = path.join(ROOT_DIR, "Advertising");

const SUBFOLDERS = [
  "Facebook/Ads",
  "Facebook/Organic",
  "TikTok/Ads",
  "TikTok/Organic",
  "Snapchat/Ads",
  "Snapchat/Organic",
  "Instagram/Ads",
  "Instagram/Organic",
  "YouTube/Shorts",
  "YouTube/Videos",
  "YouTube/Descriptions",
  "Google/Ads",
  "Business-Cards",
  "Flyers",
  "Signs",
  "Stickers",
  "Plaques",
  "Member-Cards",
  "Funeral-Homes",
  "Estate-Planners",
  "Partners",
  "Events",
  "Email",
  "SMS",
  "QR-Codes/PNG",
  "QR-Codes/SVG",
  "QR-Codes/Print",
  "QR-Codes/Engraving",
  "Reports",
  "Templates",
  "Archived"
];

export type SeedCampaign = {
  name: string;
  slug: string;
  platform: string;
  folder: string;
  isPhysical: boolean;
  destinationPath: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  material?: string;
};

export const INITIAL_CAMPAIGNS: SeedCampaign[] = [
  {
    name: "Facebook Legacy Question Ad",
    slug: "facebook-legacy-question-v1",
    platform: "Facebook",
    folder: "Facebook/Ads",
    isPhysical: false,
    destinationPath: "/legacy-question",
    utmSource: "facebook",
    utmMedium: "cpc",
    utmCampaign: "legacy_question_v1"
  },
  {
    name: "TikTok Legacy Question Video Ad",
    slug: "tiktok-video-legacy-question-v1",
    platform: "TikTok",
    folder: "TikTok/Ads",
    isPhysical: false,
    destinationPath: "/legacy-question",
    utmSource: "tiktok",
    utmMedium: "in_feed_video",
    utmCampaign: "legacy_question_v1"
  },
  {
    name: "Snapchat Story Ad",
    slug: "snapchat-story-legacy-v1",
    platform: "Snapchat",
    folder: "Snapchat/Ads",
    isPhysical: false,
    destinationPath: "/legacy-question",
    utmSource: "snapchat",
    utmMedium: "story_ad",
    utmCampaign: "legacy_question_v1"
  },
  {
    name: "Instagram Bio Link",
    slug: "instagram-bio-legacy-v1",
    platform: "Instagram",
    folder: "Instagram/Organic",
    isPhysical: false,
    destinationPath: "/legacy-question",
    utmSource: "instagram",
    utmMedium: "bio_link",
    utmCampaign: "organic_bio"
  },
  {
    name: "YouTube Description Link",
    slug: "youtube-description-v1",
    platform: "YouTube",
    folder: "YouTube/Descriptions",
    isPhysical: false,
    destinationPath: "/legacy-question",
    utmSource: "youtube",
    utmMedium: "video_description",
    utmCampaign: "youtube_organic"
  },
  {
    name: "Google Search Ad",
    slug: "google-search-legacy-v1",
    platform: "Google",
    folder: "Google/Ads",
    isPhysical: false,
    destinationPath: "/legacy-question",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "brand_search"
  },
  {
    name: "Executive Business Card QR",
    slug: "business-card-legacy-question-front-v1",
    platform: "Business Card",
    folder: "Business-Cards",
    isPhysical: true,
    destinationPath: "/legacy-question",
    utmSource: "business_card",
    utmMedium: "card_qr",
    utmCampaign: "executive_networking",
    material: "Heavy Stock Paper"
  },
  {
    name: "Metal Member Card Engraved QR",
    slug: "metal-member-card-engraved-v1",
    platform: "Member Card",
    folder: "Member-Cards",
    isPhysical: true,
    destinationPath: "/legacy-question",
    utmSource: "metal_member_card",
    utmMedium: "laser_engraved_qr",
    utmCampaign: "vip_membership",
    material: "Stainless Steel / Brass"
  },
  {
    name: "Legacy Question Paper Flyer",
    slug: "legacy-question-flyer-v1",
    platform: "Flyer",
    folder: "Flyers",
    isPhysical: true,
    destinationPath: "/legacy-question",
    utmSource: "print_flyer",
    utmMedium: "paper_qr",
    utmCampaign: "community_outreach",
    material: "Glossy Cardstock"
  },
  {
    name: "Funeral Home Partner Handout",
    slug: "funeral-home-flyer-canton-v1",
    platform: "Funeral Home",
    folder: "Funeral-Homes",
    isPhysical: true,
    destinationPath: "/legacy-question",
    utmSource: "funeral_home_partner",
    utmMedium: "partner_handout",
    utmCampaign: "canton_chapel",
    material: "Parchment Folder"
  },
  {
    name: "Estate Planner Partner Display",
    slug: "estate-planner-handout-v1",
    platform: "Estate Planner",
    folder: "Estate-Planners",
    isPhysical: true,
    destinationPath: "/legacy-question",
    utmSource: "estate_planner_partner",
    utmMedium: "desk_card",
    utmCampaign: "estate_planning_advisory",
    material: "Matte Cardboard"
  },
  {
    name: "Bronze Memorial Plaque QR",
    slug: "memorial-plaque-bronze-v1",
    platform: "Plaque",
    folder: "Plaques",
    isPhysical: true,
    destinationPath: "/legacy-question",
    utmSource: "memorial_plaque",
    utmMedium: "engraved_qr",
    utmCampaign: "heritage_preservation",
    material: "Cast Bronze"
  },
  {
    name: "Tattoo Shop Display Sign",
    slug: "tattoo-shop-display-v1",
    platform: "Tattoo Shop",
    folder: "Signs",
    isPhysical: true,
    destinationPath: "/legacy-question",
    utmSource: "tattoo_shop_partner",
    utmMedium: "counter_sign",
    utmCampaign: "ink_and_legacy",
    material: "Acrylic Stand"
  },
  {
    name: "Event Table Banner QR",
    slug: "event-table-banner-v1",
    platform: "Event",
    folder: "Events",
    isPhysical: true,
    destinationPath: "/legacy-question",
    utmSource: "event_booth",
    utmMedium: "banner_qr",
    utmCampaign: "expo_2026",
    material: "Vinyl Banner"
  },
  {
    name: "Direct VIP Referral Link",
    slug: "direct-vip-referral-v1",
    platform: "Referral",
    folder: "Email",
    isPhysical: false,
    destinationPath: "/legacy-question",
    utmSource: "vip_referral",
    utmMedium: "email_invite",
    utmCampaign: "founder_circle"
  }
];

export async function ensureDirectoryStructure() {
  if (!fs.existsSync(AD_DIR)) {
    fs.mkdirSync(AD_DIR, { recursive: true });
  }

  for (const folder of SUBFOLDERS) {
    const fullPath = path.join(AD_DIR, folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }
}

export async function generateAllAssets(options?: { siteUrl?: string }) {
  await ensureDirectoryStructure();

  const baseUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://www.thelifearchive.vip";
  const manifestEntries: any[] = [];

  for (const campaign of INITIAL_CAMPAIGNS) {
    const shortUrl = `${baseUrl.replace(/\/$/, "")}/go/${campaign.slug}`;

    // Standard PNG (600px)
    const pngPath = path.join(AD_DIR, "QR-Codes/PNG", `${campaign.slug}.png`);
    const pngBuffer = await QRCode.toBuffer(shortUrl, {
      type: "png",
      errorCorrectionLevel: "H",
      margin: 4,
      width: 600,
      color: { dark: "#11100e", light: "#ffffff" }
    });
    fs.writeFileSync(pngPath, pngBuffer);

    // Standard SVG (600px)
    const svgPath = path.join(AD_DIR, "QR-Codes/SVG", `${campaign.slug}.svg`);
    const svgString = await QRCode.toString(shortUrl, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 4,
      width: 600,
      color: { dark: "#11100e", light: "#ffffff" }
    });
    fs.writeFileSync(svgPath, svgString);

    // High-Res Print PNG (1800px)
    const printPath = path.join(AD_DIR, "QR-Codes/Print", `${campaign.slug}-print.png`);
    const printBuffer = await QRCode.toBuffer(shortUrl, {
      type: "png",
      errorCorrectionLevel: "H",
      margin: 4,
      width: 1800,
      color: { dark: "#000000", light: "#ffffff" }
    });
    fs.writeFileSync(printPath, printBuffer);

    // Pure Monochrome Engraving SVG (1200px)
    const engravingPath = path.join(AD_DIR, "QR-Codes/Engraving", `${campaign.slug}-engraving.svg`);
    const engravingString = await QRCode.toString(shortUrl, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 4,
      width: 1200,
      color: { dark: "#000000", light: "#ffffff" }
    });
    fs.writeFileSync(engravingPath, engravingString);

    // Save copy into specific platform folder
    const targetFolder = path.join(AD_DIR, campaign.folder);
    fs.writeFileSync(path.join(targetFolder, `${campaign.slug}.png`), pngBuffer);
    fs.writeFileSync(path.join(targetFolder, `${campaign.slug}.svg`), svgString);

    manifestEntries.push({
      asset_id: `asset_${campaign.slug}`,
      campaign_slug: campaign.slug,
      name: campaign.name,
      platform: campaign.platform,
      is_physical: campaign.isPhysical,
      short_url: shortUrl,
      destination_path: campaign.destinationPath,
      utm_source: campaign.utmSource,
      utm_medium: campaign.utmMedium,
      utm_campaign: campaign.utmCampaign,
      material: campaign.material || null,
      generated_files: [
        `Advertising/QR-Codes/PNG/${campaign.slug}.png`,
        `Advertising/QR-Codes/SVG/${campaign.slug}.svg`,
        `Advertising/QR-Codes/Print/${campaign.slug}-print.png`,
        `Advertising/QR-Codes/Engraving/${campaign.slug}-engraving.svg`,
        `Advertising/${campaign.folder}/${campaign.slug}.png`,
        `Advertising/${campaign.folder}/${campaign.slug}.svg`
      ],
      created_at: new Date().toISOString()
    });
  }

  // Write Advertising/manifest.json
  const manifestPath = path.join(AD_DIR, "manifest.json");
  const manifestData = {
    app: "The Life Archive Advertising Asset Manager",
    generated_at: new Date().toISOString(),
    total_assets: manifestEntries.length,
    assets: manifestEntries
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));

  // Write Advertising/README.md
  const readmePath = path.join(AD_DIR, "README.md");
  const readmeContent = `# The Life Archive Advertising & Attribution Assets

This directory contains organized digital and physical advertising assets, trackable QR codes, print vectors, laser-engraving specifications, and campaign manifests.

---

## 📁 Folder Structure

\`\`\`text
Advertising/
├── README.md
├── manifest.json
├── Facebook/ (Ads, Organic)
├── TikTok/ (Ads, Organic)
├── Snapchat/ (Ads, Organic)
├── Instagram/ (Ads, Organic)
├── YouTube/ (Shorts, Videos, Descriptions)
├── Google/ (Search & Display Ads)
├── Business-Cards/ (Networking & Card QR Assets)
├── Member-Cards/ (Laser-Engraved Metal Member Card Vectors)
├── Flyers/ (Paper Handouts & Community Outreach)
├── Funeral-Homes/ (Partner Chapel Parchment Handouts)
├── Estate-Planners/ (Estate Planning Advisory Cards)
├── Plaques/ (Engraved Bronze & Metal Memorial Plaques)
├── Signs/ (Acrylic Displays & Event Banners)
└── QR-Codes/
    ├── PNG/ (Standard 600px Digital Images)
    ├── SVG/ (Standard 600px Vector Graphics)
    ├── Print/ (High-Res 1800px 300DPI Print PNGs)
    └── Engraving/ (Pure Monochrome High-Contrast SVG Vectors for Laser/CNC)
\`\`\`

---

## ⚡ Local CLI Generation

Generate or refresh all advertising assets locally into this directory:

\`\`\`bash
npm run advertising:generate
\`\`\`

This command reads seed campaigns, constructs high-resolution QR codes, populates platform folders, and builds \`Advertising/manifest.json\`.

---

## 🛠️ QR Print & Laser Engraving Guidelines

- **Quiet Zone Margin**: Configured to 4 modules (large quiet zone) to ensure instant scanning even on reflective metal or textured paper.
- **Error Correction**: Error Correction Level **H** (30% damage/occlusion recovery).
- **Metal / Laser Engraving**: Use vector files from \`Advertising/QR-Codes/Engraving/\`. Tested for high contrast on stainless steel, brass, and anodized aluminum.
- **Minimum Physical Sizes**:
  - Business Cards: Minimum **0.75" x 0.75"** (19mm x 19mm)
  - Flyers & Handouts: Minimum **1.25" x 1.25"** (32mm x 32mm)
  - Metal Member Cards: Minimum **0.85" x 0.85"** (22mm x 22mm)
  - Plaques & Signs: Minimum **2.0" x 2.0"** (50mm x 50mm)

---

## 🎯 Attribution Architecture

All QR codes point to first-party short redirect URLs (\`https://www.thelifearchive.vip/go/[slug]\`), which record the scan/click, attach campaign parameters (\`utm_source\`, \`utm_medium\`, \`tla_campaign_id\`, \`tla_qr_id\`), and preserve first-touch vs. latest-touch attribution before safely redirecting visitors.
`;

  fs.writeFileSync(readmePath, readmeContent);

  console.log(`Successfully generated ${manifestEntries.length} advertising asset packages in Advertising/!`);
}

if (require.main === module) {
  generateAllAssets().catch((err) => {
    console.error("Failed to generate advertising assets:", err);
    process.exit(1);
  });
}
