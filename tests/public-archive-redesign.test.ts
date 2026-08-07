import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

async function runTests() {
  console.log("Starting Public Archive Redesign Test Suite...");

  // 1. Verify ShareArchiveDialog component file exists and exports ShareArchiveDialog
  const dialogPath = join(process.cwd(), "components", "archive", "ShareArchiveDialog.tsx");
  const dialogContent = readFileSync(dialogPath, "utf8");

  assert.match(dialogContent, /export function ShareArchiveDialog/);
  assert.match(dialogContent, /role="dialog"/);
  assert.match(dialogContent, /aria-modal="true"/);
  assert.match(dialogContent, /aria-labelledby="share-dialog-title"/);
  assert.match(dialogContent, /aria-label="Close share dialog"/);
  assert.match(dialogContent, /Escape/);
  assert.match(dialogContent, /Every scan opens a different memory or chapter\./);
  assert.match(dialogContent, /navigator\.clipboard\.writeText/);
  assert.match(dialogContent, /download/);

  // 2. Read public archive page content
  const pagePath = join(process.cwd(), "app", "archive", "[slug]", "page.tsx");
  const pageContent = readFileSync(pagePath, "utf8");
  const scenePath = join(process.cwd(), "components", "archive", "ArchiveCinematicScene.tsx");
  const sceneContent = readFileSync(scenePath, "utf8");
  const globalsPath = join(process.cwd(), "app", "globals.css");
  const globalsContent = readFileSync(globalsPath, "utf8");

  // 3. Verify QR Code is NOT visible on main page by default (removed QRPreview)
  assert.doesNotMatch(pageContent, /<QRPreview/);

  // 4. Verify ShareArchiveDialog is imported and wired
  assert.match(pageContent, /import \{ ShareArchiveDialog \} from "@\/components\/archive\/ShareArchiveDialog";/);
  assert.match(pageContent, /<ShareArchiveDialog/);

  // 5. Verify Random Chapter remains wired
  assert.match(sceneContent, /\/archive\/\$\{archive\.slug\}\/random/);

  // 6. Verify Add Memory appears conditionally for authorized owners
  assert.match(pageContent, /isLivingArchive && isOwner/);
  assert.match(pageContent, /\/archive\/\$\{archive\.slug\}\/add-memory/);

  // 7. Verify the cinematic archive scene replaces the older card-heavy grid
  assert.match(pageContent, /<ArchiveCinematicScene/);
  assert.doesNotMatch(pageContent, /archiveChapterButtons/);
  assert.doesNotMatch(pageContent, /Explore This Archive/);

  // 8. Verify Keepsake copy says "engraved slate plaque" and excludes brass plaque
  assert.match(pageContent, /engraved slate plaque/);
  assert.doesNotMatch(pageContent, /brass plaque/i);

  // 9. Verify Motion respects prefers-reduced-motion
  assert.match(sceneContent + globalsContent, /prefers-reduced-motion|motion-reduce:transform-none/);

  console.log("Public Archive Redesign Test Suite passed cleanly!");
}

runTests().catch((err) => {
  console.error("Public Archive Redesign Test Suite failed:", err);
  process.exit(1);
});
