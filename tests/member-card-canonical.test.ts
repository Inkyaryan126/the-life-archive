import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MEMBER_CARD_SPEC } from "../lib/member-card-spec";

async function runTests() {
  console.log("Starting Member Card Canonical Architecture Test Suite...");

  // 1. Verify Member Card Specification Constants
  assert.equal(MEMBER_CARD_SPEC.widthMm, 85.6);
  assert.equal(MEMBER_CARD_SPEC.heightMm, 53.98);
  assert.equal(MEMBER_CARD_SPEC.aspectRatio, 1.58577);
  assert.equal(MEMBER_CARD_SPEC.memberSinceBox.left, "47.1%");
  assert.equal(MEMBER_CARD_SPEC.memberSinceBox.top, "78.0%");
  assert.equal(MEMBER_CARD_SPEC.activationCodeBox.left, "57.5%");
  assert.equal(MEMBER_CARD_SPEC.activationCodeBox.top, "77.2%");

  // 2. Verify Canonical Renderer exports in components/MemberCard.tsx
  const componentPath = join(process.cwd(), "components", "MemberCard.tsx");
  const componentContent = readFileSync(componentPath, "utf8");

  assert.match(componentContent, /export function MemberCardFront/);
  assert.match(componentContent, /export function MemberCardBack/);
  assert.match(componentContent, /export function MemberCard/);
  assert.match(componentContent, /import \{ MEMBER_CARD_SPEC \} from "@\/lib\/member-card-spec";/);
  assert.match(componentContent, /MEMBER_CARD_SPEC\.frontNameBox/);
  assert.match(componentContent, /MEMBER_CARD_SPEC\.memberSinceBox/);
  assert.match(componentContent, /MEMBER_CARD_SPEC\.qrBox/);
  assert.match(componentContent, /MEMBER_CARD_SPEC\.activationCodeBox/);

  // 3. Verify Live Page imports canonical renderers and has no duplicate markup
  const pagePath = join(process.cwd(), "app", "member-card", "page.tsx");
  const pageContent = readFileSync(pagePath, "utf8");

  assert.match(pageContent, /import \{ MemberCard, MemberCardFront, MemberCardBack \} from "@\/components\/MemberCard";/);
  assert.match(pageContent, /import \{ MemberCardActions \} from "@\/components\/MemberCardActions";/);
  assert.match(pageContent, /<MemberCardFront/);
  assert.match(pageContent, /<MemberCardBack/);
  assert.match(pageContent, /<MemberCard/);
  assert.doesNotMatch(pageContent, /\[&_\.member-card-back\]:hidden/);
  assert.doesNotMatch(pageContent, /\[&_\.member-card-front\]:hidden/);

  // 4. Verify Constrained Responsive Typography on Date (Member Since Year)
  assert.match(componentContent, /clamp\(0\.4rem,\s*2cqw,\s*0\.85rem\)/);
  assert.match(componentContent, /aria-label=\{`Member since: \${createdYear}`\}/);

  // 5. Verify Constrained Responsive Typography on Legacy Activation Code
  assert.match(componentContent, /clamp\(0\.35rem,\s*1\.8cqw,\s*0\.72rem\)/);
  assert.match(componentContent, /aria-label=\{`Legacy Activation Code: \${legacyActivationCode}`\}/);

  // 6. Verify Print Controls Visibility & Styling
  const actionsPath = join(process.cwd(), "components", "MemberCardActions.tsx");
  const actionsContent = readFileSync(actionsPath, "utf8");

  assert.match(actionsContent, /Print Both Sides/);
  assert.match(actionsContent, /Print Front Only/);
  assert.match(actionsContent, /Print Back Only/);
  assert.match(actionsContent, /no-print/);
  assert.match(actionsContent, /bg-archive-gold/);
  assert.match(actionsContent, /text-archive-obsidian/);
  assert.match(actionsContent, /border border-archive-gold/);

  // 7. Verify Print Media CSS Rules in globals.css
  const globalsPath = join(process.cwd(), "app", "globals.css");
  const globalsContent = readFileSync(globalsPath, "utf8");

  assert.match(globalsContent, /\.no-print\s*\{\s*display:\s*none\s*!important;\s*\}/);
  assert.match(globalsContent, /html\[data-member-card-print-side="front"\] \.member-card-back/);
  assert.match(globalsContent, /html\[data-member-card-print-side="back"\] \.member-card-front/);
  assert.match(globalsContent, /width:\s*3\.375in\s*!important/);
  assert.match(globalsContent, /height:\s*2\.125in\s*!important/);

  console.log("Member Card Canonical Architecture Test Suite passed cleanly!");
}

runTests().catch((err) => {
  console.error("Member Card Canonical Test Suite failed:", err);
  process.exit(1);
});
