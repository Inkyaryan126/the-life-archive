import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  archiveBookZone,
  archiveSceneImageSize,
  archiveSceneZones
} from "../components/archive/archiveSceneLayout";
import {
  archiveTocEntriesPerPage,
  getArchiveTocPageCount,
  getArchiveTocPageItems,
  getMemoryTypeLabel,
  trimArchiveText
} from "../components/archive/archiveBookModel";
import type { Memory } from "../lib/types";

function read(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

function mockMemory(id: string, title: string): Memory {
  return {
    id,
    archiveSlug: "sample-archive",
    title,
    type: "journal",
    content: `Content for ${title}`,
    date: "2026-08-06",
    tags: []
  };
}

async function runTests() {
  console.log("Starting Archive Cinematic Scene Test Suite...");

  assert.equal(archiveSceneImageSize.width, 1535);
  assert.equal(archiveSceneImageSize.height, 1024);
  assert.deepEqual(archiveSceneZones.portrait, {
    left: 18.0456,
    top: 7.9102,
    width: 15.6352,
    height: 34.7656
  });
  assert.deepEqual(archiveSceneZones.identity, {
    left: 41.2378,
    top: 3.125,
    width: 31.8567,
    height: 43.8477
  });
  assert.equal(Number(archiveBookZone.left.toFixed(4)), 25.7329);
  assert.equal(Number(archiveBookZone.top.toFixed(4)), 51.7578);
  assert.equal(Number(archiveBookZone.width.toFixed(4)), 47.6221);
  assert.equal(Number(archiveBookZone.height.toFixed(4)), 35.8399);

  const chapters = [
    mockMemory("chapter-a", "First real chapter"),
    mockMemory("chapter-b", "Second real chapter"),
    mockMemory("chapter-c", "Third real chapter")
  ];

  assert.equal(archiveTocEntriesPerPage, 5);
  assert.equal(getArchiveTocPageCount([]), 1);
  assert.equal(getArchiveTocPageCount(chapters), 1);
  assert.equal(getArchiveTocPageCount([...chapters, ...chapters]), 2);
  assert.deepEqual(getArchiveTocPageItems(chapters, 0).map((chapter) => chapter.id), [
    "chapter-a",
    "chapter-b",
    "chapter-c"
  ]);
  assert.equal(getArchiveTocPageItems([...chapters, ...chapters], 1).length, 1);
  assert.equal(getMemoryTypeLabel("voice"), "Voice Note");
  assert.equal(trimArchiveText("Short biography", 40), "Short biography");
  assert.match(trimArchiveText("A ".repeat(100), 30), /\.\.\.$/);

  const pageContent = read("app/archive/[slug]/page.tsx");
  const sceneContent = read("components/archive/ArchiveCinematicScene.tsx");
  const portraitContent = read("components/archive/ArchivePortrait.tsx");
  const bookSpreadContent = read("components/archive/ArchiveBookSpread.tsx");
  const packageContent = read("package.json");
  const globalsContent = read("app/globals.css");

  assert.match(pageContent, /getMemoriesByArchiveSlug\(slug\)/);
  assert.match(pageContent, /getRandomMemoryUrl\(archive\.slug, siteUrl\)/);
  assert.match(pageContent, /getArchiveVisitorCount\(slug\)/);
  assert.match(pageContent, /isLivingArchive && isOwner/);
  assert.match(pageContent, /archiveStatusLabel=\{archiveStatusLabel\}/);
  assert.match(pageContent, /visitorCount=\{archiveVisitorCount\}/);
  assert.equal((pageContent.match(/Edit Archive/g) || []).length, 1);

  assert.match(sceneContent, /main-archive\.png/);
  assert.match(sceneContent, /mobile-main-archive\.png/);
  assert.match(sceneContent, /archiveSceneZones\.portrait/);
  assert.match(sceneContent, /archiveSceneZones\.identity/);
  assert.match(bookSpreadContent, /archiveSceneZones\.leftBookPage/);
  assert.match(bookSpreadContent, /archiveSceneZones\.rightBookPage/);
  assert.match(sceneContent, /w-screen/);
  assert.match(sceneContent, /-translate-x-1\/2/);
  assert.doesNotMatch(sceneContent, /max-w-\[96rem\]/);
  assert.match(sceneContent, /chapters\.length/);
  assert.match(sceneContent, /Visitors/);
  assert.match(sceneContent, /formatArchiveStat\(normalizedVisitorCount\)/);
  assert.match(sceneContent, /\/archive\/\$\{archive\.slug\}\/random/);
  assert.match(sceneContent, /isOwner \?/);
  assert.doesNotMatch(sceneContent, /Edit Archive/);
  assert.doesNotMatch(sceneContent, /anonymous_visitor_id|visitor_city|visitor_region|visitor_country|user_agent|referrer/);

  assert.match(portraitContent, /getArchiveHeroImageStyle\(positionX, positionY, zoom\)/);
  assert.match(sceneContent, /heroImagePositionX/);
  assert.match(sceneContent, /heroImagePositionY/);
  assert.match(sceneContent, /heroImageZoom/);

  assert.match(bookSpreadContent, /personName/);
  assert.match(bookSpreadContent, /font-signature/);
  assert.match(bookSpreadContent, /biography/);
  assert.match(bookSpreadContent, /chapter\.title/);
  assert.match(bookSpreadContent, /chapter\.content/);
  assert.match(bookSpreadContent, /\/archive\/\$\{archiveSlug\}\/memories\/\$\{chapter\.id\}/);
  assert.match(bookSpreadContent, /This archive does not have public chapters yet/);
  assert.match(bookSpreadContent, /getArchiveTocPageItems/);
  assert.match(bookSpreadContent, /setTocPageIndex/);
  assert.match(bookSpreadContent, /bg-transparent/);
  assert.doesNotMatch(bookSpreadContent, /bg-\[#d8bd83\]|radial-gradient\(circle_at_34%_18%|WebkitLineClamp|line-clamp/);
  assert.doesNotMatch(bookSpreadContent, /HTMLFlipBook|pageFlip|flipNext|flipPrev/);
  assert.doesNotMatch(packageContent, /react-pageflip/);
  assert.doesNotMatch(globalsContent, /stf__/);

  const editPageContent = read("app/archive/[slug]/edit/page.tsx");
  const editFormContent = read("components/EditArchiveForm.tsx");
  const editActionContent = read("app/archive/[slug]/actions.ts");

  assert.match(editPageContent, /min-w-0/);
  assert.match(editFormContent, /xl:grid-cols-\[minmax\(0,1fr\)_320px\]/);
  assert.match(editFormContent, /min-w-0 grid gap-6/);
  assert.match(editFormContent, /min-w-0 self-start grid gap-6/);
  assert.doesNotMatch(editFormContent, /as any/);
  assert.match(editActionContent, /normalizeHeroCropValues/);
  assert.match(editActionContent, /await updateArchive\(slug, updates\)/);
  assert.match(editActionContent, /return \{ error: "We couldn't save those changes right now\. Please try again\." \}/);
  assert.doesNotMatch(editActionContent, /throw new Error\(error\.message \|\| "Failed to update archive\."\)/);

  const siteVisitsContent = read("lib/site-visits.ts");
  const archiveVisitorHelper = siteVisitsContent.slice(
    siteVisitsContent.indexOf("export async function getArchiveVisitorCount"),
    siteVisitsContent.indexOf("export async function getSiteVisitStats")
  );
  assert.match(siteVisitsContent, /getArchiveVisitorCount/);
  assert.match(archiveVisitorHelper, /\.select\("id", \{ count: "exact", head: true \}\)/);
  assert.match(archiveVisitorHelper, /\.eq\("is_admin", false\)/);
  assert.doesNotMatch(archiveVisitorHelper, /visitor_city|visitor_region|visitor_country|user_agent|referrer|anonymous_visitor_id|user_email/);

  console.log("Archive Cinematic Scene Test Suite passed cleanly!");
}

runTests().catch((err) => {
  console.error("Archive Cinematic Scene Test Suite failed:", err);
  process.exit(1);
});
