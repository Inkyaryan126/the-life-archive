import assert from "node:assert/strict";
import {
  CARD_WIDTH_MM,
  CARD_HEIGHT_MM,
  buildMemberCardEngravingSvg,
  getMemberCardEngravingFilename,
  type MemberCardEngravingCandidate
} from "../lib/member-card-engraving";

const mockCandidate: MemberCardEngravingCandidate = {
  archiveId: "11111111-2222-3333-4444-555555555555",
  archiveSlug: "alex-morgan",
  archiveName: "The Life Archive of Alex Morgan",
  personName: "Alex Morgan",
  ownerId: "owner-123",
  ownerEmail: "alex@example.com",
  profileDisplayName: "Alexander Montgomery Morgan III",
  archiveType: "Living archive",
  legacyActivationCode: "ACT-98765-XYZ",
  qrDestination: "https://thelifearchive.vip/archive/alex-morgan",
  createdAt: "2026-01-15T08:00:00Z",
  createdYear: 2026,
  frontMissingFields: [],
  backMissingFields: [],
  missingFields: [],
  ready: true
};

async function runTests() {
  // 1. Physical dimensions constants
  assert.equal(CARD_WIDTH_MM, 85.6);
  assert.equal(CARD_HEIGHT_MM, 53.98);

  // 2. Filename generation for PNG and SVG
  const frontPng = getMemberCardEngravingFilename(mockCandidate, "front", "png");
  const frontSvg = getMemberCardEngravingFilename(mockCandidate, "front", "svg");
  const backPng = getMemberCardEngravingFilename(mockCandidate, "back", "png");
  const backSvg = getMemberCardEngravingFilename(mockCandidate, "back", "svg");

  assert.equal(frontPng, "life-archive-member-card-front-alex-morgan.png");
  assert.equal(frontSvg, "life-archive-member-card-front-alex-morgan.svg");
  assert.equal(backPng, "life-archive-member-card-back-alex-morgan.png");
  assert.equal(backSvg, "life-archive-member-card-back-alex-morgan.svg");

  // 3. Front-side vector SVG export verification
  const frontSvgContent = await buildMemberCardEngravingSvg(mockCandidate, "front");
  assert.match(frontSvgContent, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(frontSvgContent, /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(frontSvgContent, /width="85\.6mm"/);
  assert.match(frontSvgContent, /height="53\.98mm"/);
  assert.match(frontSvgContent, /viewBox="0 0 85\.6 53\.98"/);

  // Security & laser safety checks
  assert.doesNotMatch(frontSvgContent, /<text/i);
  assert.doesNotMatch(frontSvgContent, /<image/i);
  assert.doesNotMatch(frontSvgContent, /<script/i);
  assert.doesNotMatch(frontSvgContent, /<foreignObject/i);
  assert.doesNotMatch(frontSvgContent, /linearGradient/i);
  assert.doesNotMatch(frontSvgContent, /radialGradient/i);
  assert.doesNotMatch(frontSvgContent, /filter=/i);
  assert.doesNotMatch(frontSvgContent, /opacity=/i);

  // Vector path text rendering check
  assert.match(frontSvgContent, /<path d="[^"]+" fill="#000000"/);

  // 4. Back-side vector SVG export verification
  const backSvgContent = await buildMemberCardEngravingSvg(mockCandidate, "back");
  assert.match(backSvgContent, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(backSvgContent, /width="85\.6mm"/);
  assert.match(backSvgContent, /height="53\.98mm"/);
  assert.match(backSvgContent, /viewBox="0 0 85\.6 53\.98"/);

  // Security & laser safety checks
  assert.doesNotMatch(backSvgContent, /<text/i);
  assert.doesNotMatch(backSvgContent, /<image/i);
  assert.doesNotMatch(backSvgContent, /<script/i);
  assert.doesNotMatch(backSvgContent, /<foreignObject/i);

  // Vector QR code and activation code path check
  assert.match(backSvgContent, /aria-label="Archive QR code"/);
  assert.match(backSvgContent, /<path d="[^"]+" fill="#000000"/);

  // 5. Validation error for incomplete candidate
  const incompleteCandidate: MemberCardEngravingCandidate = {
    ...mockCandidate,
    profileDisplayName: null,
    frontMissingFields: ["Missing display name"],
    ready: false
  };

  await assert.rejects(
    () => buildMemberCardEngravingSvg(incompleteCandidate, "front"),
    /Missing required front-side data/
  );

  console.log("member-card-engraving verification tests passed cleanly!");
}

runTests().catch((err) => {
  console.error("member-card-engraving tests failed:", err);
  process.exit(1);
});
