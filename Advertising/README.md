# The Life Archive Advertising & Attribution Assets

This directory contains organized digital and physical advertising assets, trackable QR codes, print vectors, laser-engraving specifications, and campaign manifests.

---

## 📁 Folder Structure

```text
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
```

---

## ⚡ Local CLI Generation

Generate or refresh all advertising assets locally into this directory:

```bash
npm run advertising:generate
```

This command reads seed campaigns, constructs high-resolution QR codes, populates platform folders, and builds `Advertising/manifest.json`.

---

## 🛠️ QR Print & Laser Engraving Guidelines

- **Quiet Zone Margin**: Configured to 4 modules (large quiet zone) to ensure instant scanning even on reflective metal or textured paper.
- **Error Correction**: Error Correction Level **H** (30% damage/occlusion recovery).
- **Metal / Laser Engraving**: Use vector files from `Advertising/QR-Codes/Engraving/`. Tested for high contrast on stainless steel, brass, and anodized aluminum.
- **Minimum Physical Sizes**:
  - Business Cards: Minimum **0.75" x 0.75"** (19mm x 19mm)
  - Flyers & Handouts: Minimum **1.25" x 1.25"** (32mm x 32mm)
  - Metal Member Cards: Minimum **0.85" x 0.85"** (22mm x 22mm)
  - Plaques & Signs: Minimum **2.0" x 2.0"** (50mm x 50mm)

---

## 🎯 Attribution Architecture

All QR codes point to first-party short redirect URLs (`https://www.thelifearchive.vip/go/[slug]`), which record the scan/click, attach campaign parameters (`utm_source`, `utm_medium`, `tla_campaign_id`, `tla_qr_id`), and preserve first-touch vs. latest-touch attribution before safely redirecting visitors.
